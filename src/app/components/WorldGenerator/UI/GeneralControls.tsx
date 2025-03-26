/**
 * GeneralControls.tsx
 *
 * Component for basic world generation controls like seed and visualization mode.
 */

import React, { useState } from "react";
import { VisualizationMode } from "../config";

// InfoTooltip component for providing context on each control
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        className="w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center justify-center focus:outline-none transition-colors duration-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Information"
      >
        i
      </button>
      {showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 border border-blue-500">
          {text}
        </div>
      )}
    </div>
  );
};

interface GeneralControlsProps {
  seed: number;
  setSeed: (value: number) => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
  biomePreset: string;
  setBiomePreset: (preset: string) => void;
  generateNewSeed: () => void;
  showWeightEditor: boolean;
  setShowWeightEditor: (show: boolean) => void;
}

const GeneralControls: React.FC<GeneralControlsProps> = ({
  seed,
  setSeed,
  visualizationMode,
  setVisualizationMode,
  biomePreset,
  setBiomePreset,
  generateNewSeed,
  showWeightEditor,
  setShowWeightEditor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Seed section */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h3 className="font-medium mb-2 flex items-center">
          World Seed
          <InfoTooltip text="The seed determines the random pattern of the world generation. The same seed will always generate the same world." />
        </h3>
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
            className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors duration-200"
          >
            Random
          </button>
        </div>
      </div>

      {/* Visualization mode */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h3 className="font-medium mb-2 flex items-center">
          Visualization
          <InfoTooltip text="Changes how the world is displayed. Different modes highlight different aspects of the world generation." />
        </h3>
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
          <option value={VisualizationMode.WEIGHT_DISTRIBUTION}>
            Weight Distribution
          </option>
        </select>
      </div>

      {/* Biome preset section */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h3 className="font-medium mb-2 flex items-center">
          Biome Preset
          <InfoTooltip text="Presets determine the distribution of biome types in your world. 'Custom' lets you adjust weights manually." />
        </h3>
        <div className="flex flex-col gap-2">
          <select
            value={biomePreset}
            onChange={(e) => setBiomePreset(e.target.value)}
            className="bg-gray-800 px-2 py-1 rounded w-full text-white"
          >
            <option value="WORLD">World Map</option>
            <option value="CONTINENTS">Continents</option>
            <option value="ISLANDS">Islands</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <button
            onClick={() => setShowWeightEditor(!showWeightEditor)}
            className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors duration-200"
          >
            {showWeightEditor ? "Hide Weight Editor" : "Edit Weights"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralControls;
