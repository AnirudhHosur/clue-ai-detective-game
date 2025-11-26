import { motion } from "framer-motion";
import { Button } from "@heroui/button";

const CharacterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

interface Character {
  name: string;
  role: string;
  personality?: string;
  motivation?: string;
  traits?: string;
}

interface CharactersStepProps {
  characters: Character[];
}

export default function CharactersStep({ characters }: CharactersStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <CharacterIcon className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Main Characters
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((character, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Card Header */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {character.name}
                </h3>
                <p className="text-primary font-semibold">{character.role}</p>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
              
              {/* Card Body */}
              <div className="p-6 space-y-4">
                {character.personality && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Personality
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.personality}
                    </p>
                  </div>
                )}
                {character.motivation && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Motivation
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.motivation}
                    </p>
                  </div>
                )}
                {character.traits && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Traits
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.traits}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

