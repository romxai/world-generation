/**
 * NoiseControls.tsx
 *
 * Component for controlling noise generation parameters for the world.
 */

import React from "react";
import Slider from "./Slider";

interface NoiseControlsProps {
  noiseDetail: number;
  setNoiseDetail: (value: number) => void;
  noiseFalloff: number;
  setNoiseFalloff: (value: number) => void;
  elevationOctaves: number;
  setElevationOctaves: (value: number) => void;
  moistureOctaves: number;
  setMoistureOctaves: (value: number) => void;
  elevationScale: number;
  setElevationScale: (value: number) => void;
  moistureScale: number;
  setMoistureScale: (value: number) => void;
  elevationPersistence: number;
  setElevationPersistence: (value: number) => void;
  moisturePersistence: number;
  setMoisturePersistence: (value: number) => void;
}

const NoiseControls: React.FC<NoiseControlsProps> = ({
  noiseDetail,
  setNoiseDetail,
  noiseFalloff,
  setNoiseFalloff,
  elevationOctaves,
  setElevationOctaves,
  moistureOctaves,
  setMoistureOctaves,
  elevationScale,
  setElevationScale,
  moistureScale,
  setMoistureScale,
  elevationPersistence,
  setElevationPersistence,
  moisturePersistence,
  setMoisturePersistence,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Basic noise settings */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Base Noise Settings</h4>

        <Slider
          label="Noise Detail"
          value={noiseDetail}
          onChange={setNoiseDetail}
          min={1}
          max={20}
          step={1}
          leftLabel={`Low (${noiseDetail})`}
          rightLabel="High"
          tooltip="Controls the level of detail in the world's terrain. Higher values create more detailed, intricate landscapes but may affect performance."
        />

        <Slider
          label="Noise Falloff"
          value={noiseFalloff}
          onChange={setNoiseFalloff}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`Smooth (${noiseFalloff.toFixed(2)})`}
          rightLabel="Sharp"
          tooltip="Controls how quickly terrain features transition. Lower values create smoother, more gradual changes while higher values create sharper transitions."
        />
      </div>

      {/* Elevation noise settings */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Elevation Noise</h4>

        <Slider
          label="Octaves"
          value={elevationOctaves}
          onChange={setElevationOctaves}
          min={1}
          max={16}
          step={1}
          leftLabel={`Few (${elevationOctaves})`}
          rightLabel="Many"
          tooltip="Controls the layering of noise for elevation. More octaves create more complex terrain with both large features and fine details."
        />

        <Slider
          label="Scale"
          value={elevationScale}
          onChange={setElevationScale}
          min={50}
          max={500}
          step={10}
          leftLabel={`Small (${elevationScale})`}
          rightLabel="Large"
          tooltip="Controls the size of elevation features. Higher values create broader mountains and valleys, while lower values create more frequent, smaller features."
        />

        <Slider
          label="Persistence"
          value={elevationPersistence}
          onChange={setElevationPersistence}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`Low (${elevationPersistence.toFixed(2)})`}
          rightLabel="High"
          tooltip="Controls how much each successive octave contributes to the final elevation. Higher values create more rugged, dramatic terrain."
        />
      </div>

      {/* Moisture noise settings */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Moisture Noise</h4>

        <Slider
          label="Octaves"
          value={moistureOctaves}
          onChange={setMoistureOctaves}
          min={1}
          max={16}
          step={1}
          leftLabel={`Few (${moistureOctaves})`}
          rightLabel="Many"
          tooltip="Controls the layering of noise for moisture distribution. More octaves create more complex moisture patterns with local variations."
        />

        <Slider
          label="Scale"
          value={moistureScale}
          onChange={setMoistureScale}
          min={50}
          max={500}
          step={10}
          leftLabel={`Small (${moistureScale})`}
          rightLabel="Large"
          tooltip="Controls the size of moisture regions. Higher values create broader wet/dry regions, while lower values create more frequent, smaller transitions."
        />

        <Slider
          label="Persistence"
          value={moisturePersistence}
          onChange={setMoisturePersistence}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`Low (${moisturePersistence.toFixed(2)})`}
          rightLabel="High"
          tooltip="Controls how much each successive octave contributes to the final moisture. Higher values create more variable, patchy moisture distribution."
        />
      </div>
    </div>
  );
};

export default NoiseControls;
