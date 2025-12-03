import CustomLoader from "@/components/customLoader";
import { loadCreateGamePrompt } from "@/config/loadPrompt";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Spinner } from "@heroui/spinner";
import { GetStaticProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/UserContext";

type CreateGameProps = {
  prompt: string;
};

export const getStaticProps: GetStaticProps<CreateGameProps> = async () => {
  const prompt = await loadCreateGamePrompt();
  return { props: { prompt } };
};

// Preset genre/tone/difficulty options
const genreOptions = [
  "Detective",
  "Noir",
  "Fantasy",
  "Historical",
  "Supernatural",
  "Police Procedural",
];

const toneOptions = [
  "Dark",
  "Serious",
  "Comedic",
  "Gritty",
  "Paranormal",
];

const difficultyOptions = [
  "Easy",
  "Medium",
  "Hard",
];

export default function CreateGame({ prompt }: CreateGameProps) {
  const router = useRouter();
  const { user: dbUser, isLoading: userLoading, refreshUser } = useUserContext();

  // Form state, each maps to the DB schema!
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState(genreOptions[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [plotSeed, setPlotSeed] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [imagePrompt, setImagePrompt] = useState("");
  const [mainCharacters, setMainCharacters] = useState([
    { name: "", role: "", traits: "" },
  ]);

  // Handler to edit character fields
  const editCharacter = (idx: number, field: string, value: string) => {
    setMainCharacters((prev) =>
      prev.map((char, i) => (i === idx ? { ...char, [field]: value } : char))
    );
  };

  const addCharacter = () => {
    setMainCharacters((prev) => [
      ...prev,
      { name: "", role: "", traits: "" },
    ]);
  };

  const removeCharacter = (idx: number) => {
    setMainCharacters((prev) => prev.filter((_, i) => i !== idx));
  };

  // Minimal submit - connect to Drizzle mutation/action!
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Map state objects to payload, call your mutation (not included)
    // Example:
    // createGameMutation.mutate({
    //   title, genre, tone, plotSeed, difficulty, imagePrompt, mainCharacters
    // })
  };

  const [loading, setLoading] = useState(false);

  const GenerateGame = async () => {
    // Check if user has enough credits
    if (!dbUser || dbUser.credits <= 0) {
      alert("You don't have enough credits to create a game!");
      return;
    }

    setLoading(true);
    const mcInput = mainCharacters.map((c) => ({
      name: c.name || "Unknown",
      role: c.role || "Unknown",
      traits: c.traits || "",
    }));

    const FINAL_PROMPT = (prompt ?? "")
      .replace(/\{title\}/g, title)
      .replace(/\{genre\}/g, genre)
      .replace(/\{tone\}/g, tone)
      .replace(/\{plotSeed\}/g, plotSeed)
      .replace(/\{difficulty\}/g, difficulty)
      .replace(/\{mainCharacters\}/g, JSON.stringify(mcInput, null, 2));

    try {
      const response = await fetch("/api/generateGame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: FINAL_PROMPT }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unknown AI error");
      
      // Parse the game content to extract details for image generation
      let parsedGameData: any = {};
      let imagePromptText = "";
      
      try {
        // Remove markdown code blocks if present
        let cleanedContent = data.result.trim();
        if (cleanedContent.startsWith("```json")) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        
        parsedGameData = JSON.parse(cleanedContent);
        
        // Create image prompt from game details
        const premise = parsedGameData.premise || "";
        const setting = parsedGameData.setting || {};
        const settingLocation = setting.location || "";
        const settingDescription = setting.description || "";
        const gameGenre = parsedGameData.genre || genre;
        const gameTone = parsedGameData.tone || tone;
        
        // Build a descriptive image prompt
        imagePromptText = `A ${gameTone.toLowerCase()} ${gameGenre.toLowerCase()} detective mystery scene. ${premise.substring(0, 200)}. ${settingLocation ? `Location: ${settingLocation}.` : ""} ${settingDescription ? settingDescription.substring(0, 150) : ""}. Atmospheric, cinematic, detailed, mysterious, detective story aesthetic.`;
      } catch (parseError) {
        console.error("Error parsing game content for image:", parseError);
        // Fallback to basic prompt
        imagePromptText = `A ${tone.toLowerCase()} ${genre.toLowerCase()} detective mystery scene. ${plotSeed.substring(0, 200)}. Atmospheric, cinematic, detailed, mysterious.`;
      }
      
      // Generate image using the prompt
      let generatedImageUrl = null;
      let imageBase64 = null;
      try {
        const imageResponse = await fetch("/api/generateImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePromptText }),
        });
        const imageData = await imageResponse.json();
        if (imageResponse.ok && imageData.imageUrl) {
          generatedImageUrl = imageData.imageUrl;
          imageBase64 = imageData.imageBase64 || null;
        } else {
          console.warn("Image generation failed:", imageData.error);
        }
      } catch (imageError) {
        console.error("Error generating image:", imageError);
        // Continue without image if generation fails
      }
      
      // Save game to database with image URL and base64
      const saveResult = await saveGameinDB(data.result, generatedImageUrl, imageBase64);
      
      // Deduct one credit from user
      await deductCredit();
      
      // Log success at the end
      if (generatedImageUrl) {
        console.log("Game created successfully with image");
      }
      
      // Close modal after successful save
      setLoading(false);
      
      // Redirect to view game page
      if (saveResult?.dbId) {
        router.push(`/view-game/${saveResult.dbId}`);
      }
    } catch (error) {
      console.error("Error generating game:", error);
      setLoading(false);
      // Optional: Show error message to user
    }
  };

  const saveGameinDB = async (gameContent: string, generatedImageUrl: string | null = null, imageBase64: string | null = null) => {
    const response = await fetch("/api/saveGame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        genre,
        tone,
        plotSeed,
        difficulty,
        imagePrompt,
        mainCharacters,
        gameContent, // AI-generated game content
        generatedImageUrl, // URL of the generated image (for reference, expires after 2 hours)
        imageBase64, // Base64 encoded image to store permanently
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to save game");
    }
    return data;
  };

  const deductCredit = async () => {
    if (!dbUser) return;
    
    try {
      const newCredits = dbUser.credits - 1;
      const response = await fetch("/api/updateUserCredits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: newCredits }),
      });
      
      if (response.ok) {
        // Refresh user context to reflect new credit balance
        await refreshUser();
      } else {
        console.error("Failed to update credits");
      }
    } catch (error) {
      console.error("Error deducting credits:", error);
    }
  };


  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center min-h-[80vh] py-10 bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900/60 rounded-xl shadow-lg px-6 py-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Create Your Mystery Game
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 text-center mb-1">
            Just the essentials. Fill the details below and let the AI do the rest!
          </p>
          {
            loading && (
              <Spinner classNames={{ label: "text-foreground mt-4" }} label="Generating Suspense for you..." variant="spinner" />
            )
          }
          
          {/* Credits display */}
          {!userLoading && dbUser && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Available Credits
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                  {dbUser.credits}
                </span>
              </div>
              {dbUser.credits <= 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  You don't have enough credits to create a game. Please purchase more credits.
                </p>
              )}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            <Input
              label="Game Title"
              name="title"
              aria-label="Game Title"
              placeholder="A Shadow in the Fog"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
            />

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Genre
              </label>
              <Listbox
                aria-label="Genre"
                selectionMode="single"
                selectedKeys={new Set([genre])}
                onSelectionChange={(keys) =>
                  setGenre(Array.from(keys)[0] as string)
                }
                className="w-full"
              >
                {genreOptions.map((option) => (
                  <ListboxItem key={option}>{option}</ListboxItem>
                ))}
              </Listbox>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Tone
              </label>
              <Listbox
                aria-label="Tone"
                selectionMode="single"
                selectedKeys={new Set([tone])}
                onSelectionChange={(keys) =>
                  setTone(Array.from(keys)[0] as string)
                }
                className="w-full"
              >
                {toneOptions.map((option) => (
                  <ListboxItem key={option}>{option}</ListboxItem>
                ))}
              </Listbox>
            </div>

            {/* Plot Seed */}
            <Textarea
              label="Plot Seed"
              name="plotSeed"
              aria-label="Plot Seed"
              rows={4}
              placeholder="What's the core mystery, suspects, setting, or twist?"
              value={plotSeed}
              onChange={(e) => setPlotSeed(e.target.value)}
              required
              className="w-full"
            />

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Difficulty
              </label>
              <Listbox
                aria-label="Difficulty"
                selectionMode="single"
                selectedKeys={new Set([difficulty])}
                onSelectionChange={(keys) =>
                  setDifficulty(Array.from(keys)[0] as string)
                }
                className="w-full"
              >
                {difficultyOptions.map((option) => (
                  <ListboxItem key={option}>{option}</ListboxItem>
                ))}
              </Listbox>
            </div>

            {/* Image prompt (optional) */}
            <Input
              label="Image Prompt (optional)"
              name="imagePrompt"
              aria-label="Image Prompt"
              placeholder="Detective silhouette in moonlight"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full"
            />

            {/* Main Characters: dynamic JSON array */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Main Characters
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Add key characters (name, role, traits)
              </p>
              <div className="space-y-2">
                {mainCharacters.map((char, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      name={`character-name-${idx}`}
                      placeholder="Name"
                      value={char.name}
                      onChange={(e) =>
                        editCharacter(idx, "name", e.target.value)
                      }
                      className="w-1/3"
                    />
                    <Input
                      name={`character-role-${idx}`}
                      placeholder="Role (e.g. suspect)"
                      value={char.role}
                      onChange={(e) =>
                        editCharacter(idx, "role", e.target.value)
                      }
                      className="w-1/3"
                    />
                    <Input
                      name={`character-traits-${idx}`}
                      placeholder="Traits"
                      value={char.traits}
                      onChange={(e) =>
                        editCharacter(idx, "traits", e.target.value)
                      }
                      className="w-1/3"
                    />
                    {mainCharacters.length > 1 && (
                      <Button
                        type="button"
                        variant="bordered"
                        size="sm"
                        className="ml-2"
                        onClick={() => removeCharacter(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="flat"
                  size="sm"
                  className="mt-2"
                  onClick={addCharacter}
                >
                  Add Character
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 justify-end pt-2">
              <Button
                variant="bordered"
                size="md"
                type="reset"
                onClick={() => {
                  setTitle("");
                  setGenre(genreOptions[0]);
                  setTone(toneOptions[0]);
                  setPlotSeed("");
                  setDifficulty("Medium");
                  setImagePrompt("");
                  setMainCharacters([{ name: "", role: "", traits: "" }]);
                }}
              >
                Reset
              </Button>
              <div className="flex flex-col items-end">
                <Button
                  type="submit"
                  size="md"
                  color="primary"
                  className="font-bold"
                  onClick={GenerateGame}
                  disabled={userLoading || !dbUser || dbUser.credits <= 0}
                >
                  Create Game
                </Button>
                <span className="text-xs text-gray-500 mt-1">
                  1 credit per game
                </span>
              </div>
              <CustomLoader isLoading={loading} />
            </div>
          </form>
        </div>
      </section>
    </DefaultLayout>
  );
}