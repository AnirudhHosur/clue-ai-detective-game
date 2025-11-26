import { Button } from "@heroui/button";
import { motion } from "framer-motion";

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  showDownArrow?: boolean;
  onDownArrow?: () => void;
}

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export default function NavigationControls({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  showDownArrow,
  onDownArrow,
}: NavigationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        isIconOnly
        variant="flat"
        size="lg"
        onPress={onPrevious}
        isDisabled={!canGoPrevious}
        className="min-w-12 h-12"
      >
        <ArrowLeftIcon />
      </Button>

      {showDownArrow && onDownArrow && (
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Button
            isIconOnly
            variant="flat"
            size="lg"
            color="primary"
            onPress={onDownArrow}
            className="min-w-12 h-12"
          >
            <ArrowDownIcon />
          </Button>
        </motion.div>
      )}

      <Button
        isIconOnly
        variant="flat"
        size="lg"
        onPress={onNext}
        isDisabled={!canGoNext}
        className="min-w-12 h-12"
      >
        <ArrowRightIcon />
      </Button>
    </div>
  );
}

