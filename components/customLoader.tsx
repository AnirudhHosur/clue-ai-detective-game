import { useEffect } from "react";
import Image from "next/image";

interface CustomLoaderProps {
  isLoading: boolean;
}

function CustomLoader({ isLoading }: CustomLoaderProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Generating your Game...
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Sit tight while we create an amazing mystery experience for you!
          </p>
          <div className="relative w-64 h-64">
            <Image
              src="/loader.gif"
              alt="Loading animation"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            This may take a few moments...
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomLoader;
