import { useRef, useState, type ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  peekHeight?: number;
  maxHeight?: string;
}

export function BottomSheet({ children, peekHeight = 72, maxHeight = '70vh' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragging) return;
    setDragging(false);
    const diff = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) {
      setExpanded(diff > 0);
    }
  };

  const handleClick = () => {
    if (!dragging) setExpanded(!expanded);
  };

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-[1001] bg-[#1a1a22]/95 backdrop-blur-xl rounded-t-2xl transition-all duration-300 ease-out border-t border-white/[0.06]"
      style={{
        height: expanded ? maxHeight : `${peekHeight}px`,
        maxHeight,
      }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      <div className="overflow-y-auto scrollbar-thin" style={{ height: 'calc(100% - 28px)' }}>
        {children}
      </div>
    </div>
  );
}
