import { motion } from "framer-motion";

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface SettingStepProps {
  setting: {
    location: string;
    description: string;
  };
}

export default function SettingStep({ setting }: SettingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <LocationIcon className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            The Setting
          </h2>
        </div>
        <div className="space-y-6">
          {setting.location && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Location
              </h3>
              <p className="text-xl text-gray-900 dark:text-white">
                {setting.location}
              </p>
            </motion.div>
          )}
          {setting.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Description
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {setting.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

