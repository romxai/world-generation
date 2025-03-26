/**
 * Tooltip.tsx
 *
 * Simple tooltip component that displays helpful information when hovering over an element.
 */

import React, { useState } from "react";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
}) => {
  const [show, setShow] = useState(false);

  // Determine position classes
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full mb-2";
      case "bottom":
        return "top-full mt-2";
      case "left":
        return "right-full mr-2";
      case "right":
        return "left-full ml-2";
      default:
        return "bottom-full mb-2";
    }
  };

  return (
    <div className="relative inline-block ml-2">
      <div
        className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ?
      </div>

      {show && (
        <div
          className={`absolute ${getPositionClasses()} bg-gray-800 text-white text-xs rounded px-2 py-1 w-48 z-10`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
