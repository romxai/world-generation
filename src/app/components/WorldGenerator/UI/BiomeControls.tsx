/**
 * BiomeControls.tsx
 *
 * Component for controlling biome distribution weights for the world.
 */

import React, { useState } from "react";
import { BiomeType, BIOME_NAMES } from "../config";

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

interface BiomeControlsProps {
  biomeWeights: number[];
  setBiomeWeights: (weights: number[]) => void;
  customWeights: number[];
  setCustomWeights: (weights: number[]) => void;
  biomePreset: string;
  setBiomePreset: (preset: string) => void;
  showWeightEditor: boolean;
  setShowWeightEditor: (show: boolean) => void;
  applyCustomWeights: () => void;
}

// Helper function to get a tooltip for each biome type
const getBiomeTooltip = (biomeType: BiomeType): string => {
  switch (biomeType) {
    // Water biomes
    case BiomeType.OCEAN_DEEP:
      return "Deep ocean regions. Increasing this weight creates more deep water areas.";
    case BiomeType.OCEAN_MEDIUM:
      return "Medium-depth ocean. Transitional water zone between deep ocean and shallow waters.";
    case BiomeType.OCEAN_SHALLOW:
      return "Shallow water areas, often near coastlines. Good for reefs and coastal features.";

    // Beach/shore biomes
    case BiomeType.BEACH:
      return "Sandy beaches that form along coastlines. Higher weights create more extensive beaches.";
    case BiomeType.ROCKY_SHORE:
      return "Rocky coastal areas typically found in colder regions. Alternative to sandy beaches.";

    // Dry lowlands
    case BiomeType.SUBTROPICAL_DESERT:
      return "Hot, dry desert regions typically found near the equator. Higher weights create more extensive desert areas.";
    case BiomeType.TEMPERATE_DESERT:
      return "Cooler desert regions typically found in mid-latitudes. Less extreme than subtropical deserts.";

    // Humid lowlands
    case BiomeType.TROPICAL_RAINFOREST:
      return "Dense, lush forests in hot, wet regions near the equator. High biodiversity areas.";
    case BiomeType.TROPICAL_SEASONAL_FOREST:
      return "Forests in warm regions with wet and dry seasons. Less rain than rainforests.";
    case BiomeType.GRASSLAND:
      return "Open grassland areas with few trees. Typical of regions with moderate rainfall.";

    // Medium elevation
    case BiomeType.TEMPERATE_DECIDUOUS_FOREST:
      return "Forests in moderate climate zones with trees that lose their leaves seasonally.";
    case BiomeType.TEMPERATE_GRASSLAND:
      return "Cooler grasslands typically found in mid-latitudes. Similar to prairies or steppes.";
    case BiomeType.SHRUBLAND:
      return "Areas dominated by shrubs and small woody plants. Common in dry or medium-rainfall regions.";

    // High elevation areas
    case BiomeType.TAIGA:
      return "Northern coniferous forests with cold winters. Found in high latitudes or elevations.";
    case BiomeType.TUNDRA:
      return "Cold regions with low-growing vegetation and permafrost. Found in polar regions or high mountains.";

    // Very high elevation areas
    case BiomeType.BARE:
      return "Exposed rock or soil with minimal vegetation. Typically found in harsh environments.";
    case BiomeType.SCORCHED:
      return "Extremely hot, dry regions with minimal vegetation, such as volcanic areas.";
    case BiomeType.SNOW:
      return "Permanently snow-covered regions typically found in high elevations or polar areas.";

    default:
      return "Adjust the weight to change how common this biome type is in the world.";
  }
};

const BiomeControls: React.FC<BiomeControlsProps> = ({
  biomeWeights,
  setBiomeWeights,
  customWeights,
  setCustomWeights,
  biomePreset,
  setBiomePreset,
  showWeightEditor,
  setShowWeightEditor,
  applyCustomWeights,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2 flex items-center">
          Biome Weight Distribution
          <InfoTooltip text="Adjust the weights to control how common each biome type is in your world. Higher weights make that biome more common." />
        </h4>
        <p className="text-xs text-gray-300 mb-3">
          Current preset: <span className="font-medium">{biomePreset}</span>
        </p>

        {showWeightEditor && (
          <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-1 text-xs font-medium border-b border-gray-600 pb-1">
                <div className="col-span-3">Biome Type</div>
                <div className="col-span-2">Weight</div>
                <div className="col-span-1">Value</div>
              </div>

              {/* Biome Groups */}
              <h5 className="font-medium text-blue-300 text-sm flex items-center">
                Water Biomes
                <InfoTooltip text="Ocean and water biomes. These control the distribution of different water depths in your world." />
              </h5>
              {[
                BiomeType.OCEAN_DEEP,
                BiomeType.OCEAN_MEDIUM,
                BiomeType.OCEAN_SHALLOW,
              ].map((biome) => (
                <div
                  key={biome}
                  className="grid grid-cols-6 gap-1 items-center"
                >
                  <div className="col-span-3 flex items-center">
                    {BIOME_NAMES[biome]}
                    <InfoTooltip text={getBiomeTooltip(biome)} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customWeights[biome]}
                    onChange={(e) => {
                      const newWeights = [...customWeights];
                      newWeights[biome] = parseInt(e.target.value);
                      setCustomWeights(newWeights);
                    }}
                    className="col-span-2"
                  />
                  <div className="col-span-1 text-right">
                    {customWeights[biome]}
                  </div>
                </div>
              ))}

              <h5 className="font-medium text-yellow-300 text-sm mt-4 flex items-center">
                Shore Biomes
                <InfoTooltip text="Shore and coastal biomes. These appear at the transition between water and land." />
              </h5>
              {[BiomeType.BEACH, BiomeType.ROCKY_SHORE].map((biome) => (
                <div
                  key={biome}
                  className="grid grid-cols-6 gap-1 items-center"
                >
                  <div className="col-span-3 flex items-center">
                    {BIOME_NAMES[biome]}
                    <InfoTooltip text={getBiomeTooltip(biome)} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customWeights[biome]}
                    onChange={(e) => {
                      const newWeights = [...customWeights];
                      newWeights[biome] = parseInt(e.target.value);
                      setCustomWeights(newWeights);
                    }}
                    className="col-span-2"
                  />
                  <div className="col-span-1 text-right">
                    {customWeights[biome]}
                  </div>
                </div>
              ))}

              <h5 className="font-medium text-amber-500 text-sm mt-4 flex items-center">
                Dry Lowlands
                <InfoTooltip text="Dry and arid biomes typically found in hot or rain-shadow regions." />
              </h5>
              {[BiomeType.SUBTROPICAL_DESERT, BiomeType.TEMPERATE_DESERT].map(
                (biome) => (
                  <div
                    key={biome}
                    className="grid grid-cols-6 gap-1 items-center"
                  >
                    <div className="col-span-3 flex items-center">
                      {BIOME_NAMES[biome]}
                      <InfoTooltip text={getBiomeTooltip(biome)} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customWeights[biome]}
                      onChange={(e) => {
                        const newWeights = [...customWeights];
                        newWeights[biome] = parseInt(e.target.value);
                        setCustomWeights(newWeights);
                      }}
                      className="col-span-2"
                    />
                    <div className="col-span-1 text-right">
                      {customWeights[biome]}
                    </div>
                  </div>
                )
              )}

              <h5 className="font-medium text-green-400 text-sm mt-4 flex items-center">
                Humid Lowlands
                <InfoTooltip text="Moist, vegetated biomes typically found in regions with good rainfall." />
              </h5>
              {[
                BiomeType.TROPICAL_RAINFOREST,
                BiomeType.TROPICAL_SEASONAL_FOREST,
                BiomeType.GRASSLAND,
              ].map((biome) => (
                <div
                  key={biome}
                  className="grid grid-cols-6 gap-1 items-center"
                >
                  <div className="col-span-3 flex items-center">
                    {BIOME_NAMES[biome]}
                    <InfoTooltip text={getBiomeTooltip(biome)} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customWeights[biome]}
                    onChange={(e) => {
                      const newWeights = [...customWeights];
                      newWeights[biome] = parseInt(e.target.value);
                      setCustomWeights(newWeights);
                    }}
                    className="col-span-2"
                  />
                  <div className="col-span-1 text-right">
                    {customWeights[biome]}
                  </div>
                </div>
              ))}

              <h5 className="font-medium text-teal-400 text-sm mt-4 flex items-center">
                Medium Elevation
                <InfoTooltip text="Biomes typically found in hills and medium-elevation regions." />
              </h5>
              {[
                BiomeType.TEMPERATE_DECIDUOUS_FOREST,
                BiomeType.TEMPERATE_GRASSLAND,
                BiomeType.SHRUBLAND,
              ].map((biome) => (
                <div
                  key={biome}
                  className="grid grid-cols-6 gap-1 items-center"
                >
                  <div className="col-span-3 flex items-center">
                    {BIOME_NAMES[biome]}
                    <InfoTooltip text={getBiomeTooltip(biome)} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customWeights[biome]}
                    onChange={(e) => {
                      const newWeights = [...customWeights];
                      newWeights[biome] = parseInt(e.target.value);
                      setCustomWeights(newWeights);
                    }}
                    className="col-span-2"
                  />
                  <div className="col-span-1 text-right">
                    {customWeights[biome]}
                  </div>
                </div>
              ))}

              <h5 className="font-medium text-cyan-400 text-sm mt-4 flex items-center">
                High Elevation
                <InfoTooltip text="Biomes typically found in mountains and high-elevation regions." />
              </h5>
              {[BiomeType.TAIGA, BiomeType.TUNDRA].map((biome) => (
                <div
                  key={biome}
                  className="grid grid-cols-6 gap-1 items-center"
                >
                  <div className="col-span-3 flex items-center">
                    {BIOME_NAMES[biome]}
                    <InfoTooltip text={getBiomeTooltip(biome)} />
                  </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                    value={customWeights[biome]}
                    onChange={(e) => {
                      const newWeights = [...customWeights];
                      newWeights[biome] = parseInt(e.target.value);
                      setCustomWeights(newWeights);
                    }}
                    className="col-span-2"
                  />
                  <div className="col-span-1 text-right">
                    {customWeights[biome]}
                  </div>
              </div>
            ))}

              <h5 className="font-medium text-gray-300 text-sm mt-4 flex items-center">
                Very High Elevation
                <InfoTooltip text="Biomes typically found in the highest mountains and extreme environments." />
              </h5>
              {[BiomeType.BARE, BiomeType.SCORCHED, BiomeType.SNOW].map(
                (biome) => (
                  <div
                    key={biome}
                    className="grid grid-cols-6 gap-1 items-center"
                  >
                    <div className="col-span-3 flex items-center">
                      {BIOME_NAMES[biome]}
                      <InfoTooltip text={getBiomeTooltip(biome)} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customWeights[biome]}
                      onChange={(e) => {
                        const newWeights = [...customWeights];
                        newWeights[biome] = parseInt(e.target.value);
                        setCustomWeights(newWeights);
                      }}
                      className="col-span-2"
                    />
                    <div className="col-span-1 text-right">
                      {customWeights[biome]}
                    </div>
                  </div>
                )
              )}
          </div>

            <div className="mt-4 text-center">
          <button
            onClick={applyCustomWeights}
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors duration-200"
          >
            Apply Custom Weights
          </button>
        </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BiomeControls;
