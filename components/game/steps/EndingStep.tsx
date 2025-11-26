import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

interface Ending {
  endingId: string;
  title: string;
  conditions: string;
  summary: string;
  moral: string;
}

interface EndingStepProps {
  endings: Ending[];
}

export default function EndingStep({ endings }: EndingStepProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <TrophyIcon className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Possible Endings
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {endings.map((ending, idx) => (
          <motion.div
            key={ending.endingId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">{ending.title}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Conditions
                  </h4>
                  <p className="text-sm text-gray-300">{ending.conditions}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Summary
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {ending.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs italic text-gray-400">{ending.moral}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <Button
          color="primary"
          size="lg"
          onPress={() => router.push("/play/create")}
        >
          Create New Game
        </Button>
        <Button
          variant="bordered"
          size="lg"
          onPress={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    </motion.div>
  );
}

