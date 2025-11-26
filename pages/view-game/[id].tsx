import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import DefaultLayout from "@/layouts/default";
import { Spinner } from "@heroui/spinner";
import { AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/game/ProgressBar";
import NavigationControls from "@/components/game/NavigationControls";
import PremiseStep from "@/components/game/steps/PremiseStep";
import SettingStep from "@/components/game/steps/SettingStep";
import CharactersStep from "@/components/game/steps/CharactersStep";
import ChapterStep from "@/components/game/steps/ChapterStep";
import EndingStep from "@/components/game/steps/EndingStep";

interface GameData {
  id: number;
  title: string;
  genre: string;
  tone: string;
  difficulty: string;
  premise: string;
  setting: {
    location: string;
    description: string;
  };
  mainCharacters: Array<{
    name: string;
    role: string;
    personality?: string;
    motivation?: string;
    traits?: string;
  }>;
  chapters: Array<{
    chapterNumber: number;
    title: string;
    summary: string;
    cluesDiscovered: string[];
    keyChoices: Array<{
      choiceId: string;
      prompt: string;
      options: Array<{
        option: string;
        consequence: string;
      }>;
    }>;
  }>;
  possibleEndings: Array<{
    endingId: string;
    title: string;
    conditions: string;
    summary: string;
    moral: string;
  }>;
  images: string[];
}

type StepType = "premise" | "setting" | "characters" | "chapter" | "ending";

export default function ViewGamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const currentId = useRef<string | null>(null);

  // Step navigation state
  const [currentStep, setCurrentStep] = useState<StepType>("premise");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});

  // Reset fetch state when ID changes
  useEffect(() => {
    if (id && String(id) !== currentId.current) {
      hasFetched.current = false;
    }
  }, [id]);

  useEffect(() => {
    if (!router.isReady || !id) {
      return;
    }

    const gameId = String(id);
    if (hasFetched.current && currentId.current === gameId) {
      return;
    }

    hasFetched.current = true;
    currentId.current = gameId;

    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/getGame?id=${gameId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch game");
        }

        setGame(data.game);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching game:", err);
        setError(err.message || "Failed to load game");
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, router.isReady]);

  // Calculate total steps and current step number
  const getTotalSteps = () => {
    if (!game) return 1;
    // Intro steps: premise, setting, characters = 3
    // Chapters: game.chapters.length
    // Ending: 1
    return 3 + (game.chapters?.length || 0) + 1;
  };

  const getCurrentStepNumber = () => {
    if (!game) return 1;
    let step = 0;
    if (currentStep === "premise") return 1;
    if (currentStep === "setting") return 2;
    if (currentStep === "characters") return 3;
    if (currentStep === "chapter") return 4 + currentChapterIndex;
    if (currentStep === "ending") return getTotalSteps();
    return 1;
  };

  const handleNext = () => {
    if (!game) return;

    if (currentStep === "premise") {
      setCurrentStep("setting");
    } else if (currentStep === "setting") {
      setCurrentStep("characters");
    } else if (currentStep === "characters") {
      // Move to first chapter
      if (game.chapters && game.chapters.length > 0) {
        setCurrentStep("chapter");
        setCurrentChapterIndex(0);
      } else {
        setCurrentStep("ending");
      }
    } else if (currentStep === "chapter") {
      // Check if we need to select choices before proceeding
      const currentChapter = game.chapters[currentChapterIndex];
      if (currentChapter?.keyChoices) {
        const allChoicesSelected = currentChapter.keyChoices.every(
          (choice) => selectedChoices[choice.choiceId] !== undefined
        );
        if (!allChoicesSelected) {
          // Don't proceed if choices aren't selected
          return;
        }
      }

      // Move to next chapter or ending
      if (currentChapterIndex < (game.chapters?.length || 0) - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
      } else {
        setCurrentStep("ending");
      }
    }
  };

  const handlePrevious = () => {
    if (!game) return;

    if (currentStep === "setting") {
      setCurrentStep("premise");
    } else if (currentStep === "characters") {
      setCurrentStep("setting");
    } else if (currentStep === "chapter") {
      if (currentChapterIndex > 0) {
        setCurrentChapterIndex(currentChapterIndex - 1);
      } else {
        setCurrentStep("characters");
      }
    } else if (currentStep === "ending") {
      if (game.chapters && game.chapters.length > 0) {
        setCurrentStep("chapter");
        setCurrentChapterIndex(game.chapters.length - 1);
      } else {
        setCurrentStep("characters");
      }
    }
  };

  const handleDownArrow = () => {
    if (!game) return;
    if (currentStep === "characters" && game.chapters && game.chapters.length > 0) {
      setCurrentStep("chapter");
      setCurrentChapterIndex(0);
    }
  };

  const handleChoiceSelect = (choiceId: string, optionIndex: number) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [choiceId]: optionIndex,
    }));
  };

  const canGoNext = () => {
    if (!game) return false;
    if (currentStep === "chapter") {
      const currentChapter = game.chapters[currentChapterIndex];
      if (currentChapter?.keyChoices) {
        const allChoicesSelected = currentChapter.keyChoices.every(
          (choice) => selectedChoices[choice.choiceId] !== undefined
        );
        return allChoicesSelected;
      }
    }
    return true;
  };

  const canGoPrevious = () => {
    return currentStep !== "premise";
  };

  const showDownArrow = () => {
    return currentStep === "characters" && game?.chapters && game.chapters.length > 0;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Spinner size="lg" label="Loading your mystery..." />
        </div>
      </DefaultLayout>
    );
  }

  if (error || !game) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-3xl font-bold text-danger mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Game not found"}
          </p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
        <ProgressBar
          currentStep={getCurrentStepNumber()}
          totalSteps={getTotalSteps()}
        />

        <div className="w-full flex-1 flex items-center justify-center min-h-[60vh]">
          <AnimatePresence mode="wait">
            {currentStep === "premise" && (
              <PremiseStep
                key="premise"
                premise={game.premise || ""}
                title={game.title}
                genre={game.genre}
                tone={game.tone}
                difficulty={game.difficulty}
                imageUrl={game.images && game.images.length > 0 ? game.images[0] : undefined}
              />
            )}

            {currentStep === "setting" && game.setting && (
              <SettingStep key="setting" setting={game.setting} />
            )}

            {currentStep === "characters" && game.mainCharacters && (
              <CharactersStep
                key="characters"
                characters={game.mainCharacters}
              />
            )}

            {currentStep === "chapter" &&
              game.chapters &&
              game.chapters[currentChapterIndex] && (
                <ChapterStep
                  key={`chapter-${currentChapterIndex}`}
                  chapter={game.chapters[currentChapterIndex]}
                  selectedChoices={selectedChoices}
                  onChoiceSelect={handleChoiceSelect}
                />
              )}

            {currentStep === "ending" && game.possibleEndings && (
              <EndingStep key="ending" endings={game.possibleEndings} />
            )}
          </AnimatePresence>
        </div>

        {currentStep !== "ending" && (
          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrevious()}
            canGoNext={canGoNext()}
            showDownArrow={showDownArrow()}
            onDownArrow={handleDownArrow}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
