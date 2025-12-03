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
import { motion } from "framer-motion";

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
    //   title, genre, tone, plotSeed, difficulty, mainCharacters
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
      <section className="flex flex-col items-center justify-center min-h-[80vh] py-10 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div 
          className="w-full max-w-2xl bg-white dark:bg-gray-900/60 rounded-2xl shadow-xl px-6 py-8 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Mystery Game
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Just the essentials. Fill the details below and let the AI do the rest!
            </p>
          </div>
          
          {
            loading && (
              <div className="flex flex-col items-center">
                <Spinner classNames={{ label: "text-foreground mt-4" }} label="Generating Suspense for you..." variant="spinner" size="lg" />
              </div>
            )
          }
          
          {/* Credits display */}
          {!userLoading && dbUser && (
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Available Credits
                </span>
                <span className="text-xl font-bold">
                  {dbUser.credits}
                </span>
              </div>
              {dbUser.credits <= 0 && (
                <p className="text-sm text-yellow-200 mt-2">
                  You don't have enough credits to create a game. Please purchase more credits.
                </p>
              )}
            </motion.div>
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
              size="lg"
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
              size="lg"
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

            {/* Main Characters: dynamic JSON array */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Main Characters
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Add key characters (name, role, traits)
              </p>
              <div className="space-y-3">
                {mainCharacters.map((char, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex gap-2 items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
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
                        variant="flat"
                        color="danger"
                        size="sm"
                        className="ml-2"
                        onClick={() => removeCharacter(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </motion.div>
                ))}
                <Button
                  type="button"
                  variant="flat"
                  color="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={addCharacter}
                >
                  Add Character
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="bordered"
                  size="lg"
                  type="reset"
                  onClick={() => {
                    setTitle("");
                    setGenre(genreOptions[0]);
                    setTone(toneOptions[0]);
                    setPlotSeed("");
                    setDifficulty("Medium");
                    setMainCharacters([{ name: "", role: "", traits: "" }]);
                  }}
                  className="px-6"
                >
                  Reset
                </Button>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    size="lg"
                    color="secondary"
                    variant="shadow"
                    className="font-bold px-8 py-6 text-lg"
                    onClick={GenerateGame}
                    disabled={userLoading || !dbUser || dbUser.credits <= 0}
                  >
                    Create Game
                  </Button>
                </motion.div>
              </div>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                1 credit per game
              </span>
              
              <CustomLoader isLoading={loading} />
            </div>
          </form>
        </motion.div>
      </section>
    </DefaultLayout>
  );
}