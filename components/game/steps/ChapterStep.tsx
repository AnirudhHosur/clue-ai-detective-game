import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { SearchIcon } from "@/components/icons";

interface Choice {
  option: string;
  consequence: string;
}

interface KeyChoice {
  choiceId: string;
  prompt: string;
  options: Choice[];
}

interface Chapter {
  chapterNumber: number;
  title: string;
  summary: string;
  cluesDiscovered: string[];
  keyChoices: KeyChoice[];
}

interface ChapterStepProps {
  chapter: Chapter;
  selectedChoices: Record<string, number>;
  onChoiceSelect: (choiceId: string, optionIndex: number) => void;
}

export default function ChapterStep({
  chapter,
  selectedChoices,
  onChoiceSelect,
}: ChapterStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-bold text-2xl">
            {chapter.chapterNumber}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {chapter.title}
          </h2>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Summary
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {chapter.summary}
            </p>
          </div>

          {chapter.cluesDiscovered && chapter.cluesDiscovered.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
                Clues Discovered
              </h3>
              <div className="space-y-3">
                {chapter.cluesDiscovered.map((clue, clueIdx) => (
                  <motion.div
                    key={clueIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: clueIdx * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <SearchIcon className="text-primary mt-1 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{clue}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {chapter.keyChoices && chapter.keyChoices.length > 0 && (
            <div className="space-y-6">
              {chapter.keyChoices.map((choice, choiceIdx) => (
                <div
                  key={choice.choiceId}
                  className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {choice.prompt}
                  </h3>
                  <div className="space-y-3">
                    {choice.options.map((option, optIdx) => {
                      const isSelected =
                        selectedChoices[choice.choiceId] === optIdx;
                      return (
                        <motion.div
                          key={optIdx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            fullWidth
                            variant={isSelected ? "solid" : "bordered"}
                            color={isSelected ? "primary" : "default"}
                            size="lg"
                            className="justify-start h-auto py-4 px-4"
                            onPress={() => onChoiceSelect(choice.choiceId, optIdx)}
                          >
                            <div className="text-left w-full">
                              <p className="font-medium text-sm mb-1">
                                {option.option}
                              </p>
                              <p className="text-xs opacity-80">
                                {option.consequence}
                              </p>
                            </div>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

