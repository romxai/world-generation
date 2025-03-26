/**
 * GeneralControls.tsx
 *
 * Component for basic world generation controls like seed and visualization mode.
 */

import React from "react";
import { VisualizationMode } from "../config";

interface GeneralControlsProps {
  seed: number;
  setSeed: (value: number) => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
  generateNewSeed: () => void;
}

const GeneralControls: React.FC<GeneralControlsProps> = ({
  seed,
  setSeed,
  visualizationMode,
  setVisualizationMode,
  generateNewSeed,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Seed section */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h3 className="font-medium mb-2">World Seed</h3>
        <div className="flex items-center gap-2">
          <input
            id="seed"
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="bg-gray-800 px-2 py-1 rounded w-24 text-white"
          />
          <button
            onClick={generateNewSeed}
            className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Random
          </button>
        </div>
      </div>

      {/* Visualization mode */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h3 className="font-medium mb-2">Visualization</h3>
        <select
          value={visualizationMode}
          onChange={(e) =>
            setVisualizationMode(e.target.value as VisualizationMode)
          }
          className="bg-gray-800 px-2 py-1 rounded w-full text-white"
        >
          <option value={VisualizationMode.BIOME}>Biome Colors</option>
          <option value={VisualizationMode.NOISE}>Raw Noise</option>
          <option value={VisualizationMode.ELEVATION}>Elevation</option>
          <option value={VisualizationMode.MOISTURE}>Moisture</option>
          <option value={VisualizationMode.TEMPERATURE}>Temperature</option>
        </select>
      </div>
    </div>
  );
};

export default GeneralControls;
