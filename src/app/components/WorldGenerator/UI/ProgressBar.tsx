/**
 * ProgressBar.tsx
 *
 * Component for displaying world generation progress.
 */

import React from "react";

interface ProgressBarProps {
  progress: number; // Value between 0 and 100
  message?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  message = "Generating world...",
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
      <div className="w-64 bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all ease-out duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-white text-sm font-medium">{message}</div>
    </div>
  );
};

export default ProgressBar;
