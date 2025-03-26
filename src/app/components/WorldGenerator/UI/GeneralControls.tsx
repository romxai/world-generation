/**
 * GeneralControls.tsx
 *
 * Component for basic world generation controls like seed and visualization mode.
 */

import React from "react";
import { VisualizationMode } from "../config";
import InfoIcon from "./InfoIcon";

interface GeneralControlsProps {
  seed: number;
  setSeed: (value: number) => void;
  generateNewSeed: () => void;
  handleGenerateWorld?: (newSeed?: number) => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
}

const GeneralControls: React.FC<GeneralControlsProps> = ({
  seed,
  setSeed,
  generateNewSeed,
  handleGenerateWorld,
  visualizationMode,
  setVisualizationMode,
}) => {
  return (
    <div className="space-y-4">
      <div className="seed-controls">
        <div className="flex items-center mb-1">
          <label htmlFor="seed-input" className="block text-sm font-medium">
            World Seed
          </label>
          <InfoIcon content="A specific seed will always generate the same world. Use the same seed to recreate a world you like." />
        </div>
        <div className="flex space-x-2">
          <input
            id="seed-input"
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            className="w-1/2 bg-gray-700 text-white border border-gray-600 
                       rounded px-2 py-1 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={generateNewSeed}
            className="flex justify-center items-center bg-blue-600 
                     hover:bg-blue-700 text-white rounded px-2 py-1 
                     transition"
          >
            Random
          </button>
          <button
            onClick={() => handleGenerateWorld && handleGenerateWorld(seed)}
            className="flex-grow flex justify-center items-center bg-green-600 
                     hover:bg-green-700 text-white rounded px-2 py-1 
                     transition"
          >
            Generate World
          </button>
        </div>
      </div>

      <div className="visualization-controls">
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium">
            Visualization Mode
          </label>
          <InfoIcon content="Change how the world map is displayed. View biomes, elevation, moisture, temperature or resources." />
        </div>
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
