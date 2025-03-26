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
  generateNewSeed: () => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
}

const GeneralControls: React.FC<GeneralControlsProps> = ({
  seed,
  setSeed,
  generateNewSeed,
  visualizationMode,
  setVisualizationMode,
}) => {
  return (
    <div className="space-y-4">
      <div className="seed-controls">
        <label htmlFor="seed-input" className="block text-sm font-medium mb-1">
          World Seed
        </label>
        <div className="flex space-x-2">
          <input
            id="seed-input"
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            className="w-3/4 bg-gray-700 text-white border border-gray-600 
                       rounded px-2 py-1 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={generateNewSeed}
            className="w-1/4 flex justify-center items-center bg-green-600 
                     hover:bg-green-700 text-white rounded px-2 py-1 
                     transition"
          >
            Random
          </button>
        </div>
      </div>

      <div className="visualization-controls">
        <label className="block text-sm font-medium mb-1">
          Visualization Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVisualizationMode(VisualizationMode.BIOME)}
            className={`px-2 py-1 rounded text-sm text-center transition ${
              visualizationMode === VisualizationMode.BIOME
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Biomes
          </button>
          <button
            onClick={() => setVisualizationMode(VisualizationMode.ELEVATION)}
            className={`px-2 py-1 rounded text-sm text-center transition ${
              visualizationMode === VisualizationMode.ELEVATION
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Elevation
          </button>
          <button
            onClick={() => setVisualizationMode(VisualizationMode.MOISTURE)}
            className={`px-2 py-1 rounded text-sm text-center transition ${
              visualizationMode === VisualizationMode.MOISTURE
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Moisture
          </button>
          <button
            onClick={() => setVisualizationMode(VisualizationMode.TEMPERATURE)}
            className={`px-2 py-1 rounded text-sm text-center transition ${
              visualizationMode === VisualizationMode.TEMPERATURE
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setVisualizationMode(VisualizationMode.RESOURCES)}
            className={`px-2 py-1 rounded text-sm text-center transition ${
              visualizationMode === VisualizationMode.RESOURCES
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralControls;
