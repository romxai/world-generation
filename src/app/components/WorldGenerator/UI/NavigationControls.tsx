/**
 * NavigationControls.tsx
 *
 * Component for controlling map navigation with fixed buttons.
 */

import React from "react";

interface NavigationControlsProps {
  onPan: (direction: "up" | "down" | "left" | "right") => void;
  onZoom: (zoomIn: boolean) => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPan,
  onZoom,
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 select-none">
      <div className="text-white text-center text-xs mb-1 font-medium bg-gray-800 bg-opacity-70 rounded-md p-1">
        Map Navigation
      </div>

      {/* Zoom Controls */}
      <div className="flex justify-center mb-2">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-l-lg flex items-center justify-center text-xl font-bold shadow-lg border border-gray-600"
          onClick={() => onZoom(false)}
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-r-lg flex items-center justify-center text-xl font-bold shadow-lg border border-gray-600 border-l-0"
          onClick={() => onZoom(true)}
          aria-label="Zoom In"
        >
          +
        </button>
      </div>

      {/* Direction Controls */}
      <div className="flex justify-center">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("up")}
          aria-label="Pan Up"
        >
          ↑
        </button>
      </div>
      <div className="flex justify-between">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("left")}
          aria-label="Pan Left"
        >
          ←
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("right")}
          aria-label="Pan Right"
        >
          →
        </button>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("down")}
          aria-label="Pan Down"
        >
          ↓
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
