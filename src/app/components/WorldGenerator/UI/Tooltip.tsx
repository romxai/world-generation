/**
 * Tooltip.tsx
 *
 * A reusable tooltip component for displaying information about parameters.
 */

import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  position?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicking outside to close tooltip
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Positioning classes based on the position prop
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <div
        className="hover:cursor-pointer inline-flex items-center justify-center"
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-64 bg-gray-800 text-white text-sm rounded-md shadow-lg p-3 border border-gray-600`}
        >
          <div className="relative">{content}</div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
