import { motion } from "framer-motion";
import { SearchIcon } from "@/components/icons";

interface PremiseStepProps {
  premise: string;
  title: string;
  genre: string;
  tone: string;
  difficulty: string;
  imageUrl?: string;
}

export default function PremiseStep({
  premise,
  title,
  genre,
  tone,
  difficulty,
  imageUrl,
}: PremiseStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {imageUrl && (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 shadow-2xl">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            <div className="flex gap-3 text-sm">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                {genre}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                {tone}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                {difficulty}
              </span>
            </div>
          </div>
        </div>
      )}

      {!imageUrl && (
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-6 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <div className="flex gap-3">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
              {genre}
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
              {tone}
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
              {difficulty}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
        <div className="flex gap-3 mb-6">
          <SearchIcon className="text-3xl text-primary" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            The Premise
          </h2>
        </div>
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          {premise}
        </p>
      </div>
    </motion.div>
  );
}

