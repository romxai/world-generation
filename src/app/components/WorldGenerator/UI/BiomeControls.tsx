/**
 * BiomeControls.tsx
 *
 * Component for controlling biome weights and distribution.
 */

import React from "react";
import { TerrainType, TERRAIN_NAMES } from "../config";

interface BiomeControlsProps {
  biomeWeights: number[];
  setBiomeWeights: (weights: number[]) => void;
  customWeights: number[];
  setCustomWeights: (weights: number[]) => void;
  applyCustomWeights: () => void;
  showWeightEditor: boolean;
}

const BiomeControls: React.FC<BiomeControlsProps> = ({
  biomeWeights,
  setBiomeWeights,
  customWeights,
  setCustomWeights,
  applyCustomWeights,
  showWeightEditor,
}) => {
  // Handler for changing a weight value
  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...customWeights];
    newWeights[index] = Math.max(0, value); // Ensure weights are non-negative
    setCustomWeights(newWeights);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Biome Distribution</h3>

      {showWeightEditor && (
        <div className="bg-gray-700 p-4 rounded-md mb-4">
          <h4 className="font-medium mb-3">Terrain Type Weights</h4>
          <p className="text-sm mb-3">
            Adjust the weights to control the distribution of terrain types.
            Higher weights result in more area covered by that terrain type.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customWeights.map((weight, index) => (
              <div key={index} className="mb-2">
                <label className="flex justify-between mb-1">
                  <span className="text-sm">
                    {TERRAIN_NAMES[index as TerrainType]}
                  </span>
                  <span className="text-sm">{weight}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e) =>
                    handleWeightChange(index, Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <button
            onClick={applyCustomWeights}
            className="mt-3 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Custom Weights
          </button>
        </div>
      )}

      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Current Biome Distribution</h4>

        <div className="grid grid-cols-3 gap-2">
          {biomeWeights.map((weight, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-gray-800 p-2 rounded"
            >
              <div
                className="w-8 h-8 rounded mb-1"
                style={{
                  background: getBiomeColorForIndex(index),
                }}
              ></div>
              <span className="text-xs">
                {TERRAIN_NAMES[index as TerrainType]}
              </span>
              <span className="text-xs text-gray-400">{weight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get a color for a terrain type
function getBiomeColorForIndex(index: number): string {
  const colors = [
    "rgb(30, 120, 200)", // OCEAN_DEEP
    "rgb(35, 140, 220)", // OCEAN_MEDIUM
    "rgb(40, 160, 230)", // OCEAN_SHALLOW
    "rgb(245, 236, 150)", // BEACH
    "rgb(118, 239, 124)", // GRASS
    "rgb(90, 90, 90)", // MOUNTAIN
    "rgb(240, 240, 240)", // SNOW
  ];

  return colors[index] || "rgb(128, 128, 128)";
}

export default BiomeControls;
