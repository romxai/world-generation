/**
 * BiomeControls.tsx
 *
 * Component with controls for biome distribution and weights
 */

import React from "react";
import { BiomeType, BIOME_NAMES, BASIC_BIOME_TYPES } from "../config";
import Slider from "./Slider";

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
  // Handle weight changes
  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...customWeights];
    newWeights[index] = Math.max(1, value); // Ensure weights are at least 1
    setCustomWeights(newWeights);
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Biome Distribution</h3>

      {showWeightEditor ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-3">
            Adjust the weights to control the distribution of different biomes
            in the world. Higher weights mean more of that biome type.
          </p>

          {BASIC_BIOME_TYPES.map((biome, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  {BIOME_NAMES[biome]}
                </span>
                <span className="text-xs text-gray-400">
                  {customWeights[index]}
                </span>
              </div>
              <Slider
                value={customWeights[index]}
                min={1}
                max={100}
                step={1}
                onChange={(value) => handleWeightChange(index, value)}
                label={customWeights[index].toString()}
              />
            </div>
          ))}

          <button
            onClick={applyCustomWeights}
            className="w-full bg-blue-600 py-2 rounded mt-4 hover:bg-blue-700 transition"
          >
            Apply Custom Weights
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-3">
            Current biome distribution (select 'Custom' preset and 'Edit
            Weights' to modify):
          </p>

          {BASIC_BIOME_TYPES.map((biome, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  {BIOME_NAMES[biome]}
                </span>
                <span className="text-xs text-gray-400">
                  {biomeWeights[index]}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${
                      (biomeWeights[index] /
                        Math.max(...biomeWeights.slice(0, 7))) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BiomeControls;
