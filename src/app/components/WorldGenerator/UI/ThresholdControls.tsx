/**
 * ThresholdControls.tsx
 *
 * Component for adjusting threshold values for biome generation.
 */

import React, { useState } from "react";
import { MOISTURE_THRESHOLDS, TEMPERATURE_THRESHOLDS } from "../config";
import Slider from "./Slider";
import InfoIcon from "./InfoIcon";

interface ThresholdControlsProps {
  // Moisture threshold controls
  moistureThresholds: typeof MOISTURE_THRESHOLDS;
  setMoistureThresholds: (thresholds: typeof MOISTURE_THRESHOLDS) => void;

  // Temperature threshold controls
  temperatureThresholds: typeof TEMPERATURE_THRESHOLDS;
  setTemperatureThresholds: (thresholds: typeof TEMPERATURE_THRESHOLDS) => void;
}

// Tooltips for thresholds
const MOISTURE_TOOLTIPS = {
  VERY_DRY:
    "Controls the boundary below which extremely arid regions like deserts form. Lower values create more deserts.",
  DRY: "Controls the boundary between arid and semi-arid regions. Affects distribution of steppes, savannas, and dry shrublands.",
  MEDIUM:
    "Controls the boundary between moderately dry and moderately wet areas. Affects grasslands and mixed forests.",
  WET: "Controls the boundary between moderate and high moisture. Higher values create more lush environments like rainforests.",
};

const TEMPERATURE_TOOLTIPS = {
  FREEZING:
    "Controls the boundary for extremely cold regions like ice sheets and tundra. Higher values create more polar regions.",
  COLD: "Controls the boundary for cold regions like taiga and boreal forests. Affects cold-climate biomes.",
  COOL: "Controls the boundary for cool temperate regions. Affects distribution of cool mixed forests and temperate grasslands.",
  MILD: "Controls the boundary for mild temperate regions. Affects temperate deciduous forests and woodlands.",
  WARM: "Controls the boundary for warm regions like subtropical environments. Affects distribution of warm forests and savannas.",
  HOT: "Controls the boundary for hot regions. Higher values create more tropical environments like rainforests and tropical deserts.",
};

const ThresholdControls: React.FC<ThresholdControlsProps> = (props) => {
  // Local state for thresholds
  const [moistureThresholds, setMoistureThresholds] = useState<
    typeof MOISTURE_THRESHOLDS
  >({ ...props.moistureThresholds });
  const [temperatureThresholds, setTemperatureThresholds] = useState<
    typeof TEMPERATURE_THRESHOLDS
  >({ ...props.temperatureThresholds });

  // Update local state and parent
  const updateMoistureThreshold = (
    key: keyof typeof MOISTURE_THRESHOLDS,
    value: number
  ) => {
    const updated = { ...moistureThresholds, [key]: value };
    setMoistureThresholds(updated);
    props.setMoistureThresholds(updated);
  };

  // Update local state and parent
  const updateTemperatureThreshold = (
    key: keyof typeof TEMPERATURE_THRESHOLDS,
    value: number
  ) => {
    const updated = { ...temperatureThresholds, [key]: value };
    setTemperatureThresholds(updated);
    props.setTemperatureThresholds(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Moisture thresholds */}
      <div className="bg-gray-700 p-3 rounded-md">
        <div className="flex items-center mb-2">
          <h4 className="font-medium">Moisture Thresholds</h4>
          <InfoIcon content="These values control the boundaries between different moisture levels in the world, affecting biome distribution." />
        </div>

        <Slider
          label="Very Dry"
          value={moistureThresholds.VERY_DRY}
          onChange={(value) => updateMoistureThreshold("VERY_DRY", value)}
          min={0.05}
          max={0.3}
          step={0.01}
          leftLabel={`${moistureThresholds.VERY_DRY.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={MOISTURE_TOOLTIPS.VERY_DRY}
        />

        <Slider
          label="Dry"
          value={moistureThresholds.DRY}
          onChange={(value) => updateMoistureThreshold("DRY", value)}
          min={0.2}
          max={0.5}
          step={0.01}
          leftLabel={`${moistureThresholds.DRY.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={MOISTURE_TOOLTIPS.DRY}
        />

        <Slider
          label="Medium"
          value={moistureThresholds.MEDIUM}
          onChange={(value) => updateMoistureThreshold("MEDIUM", value)}
          min={0.4}
          max={0.7}
          step={0.01}
          leftLabel={`${moistureThresholds.MEDIUM.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={MOISTURE_TOOLTIPS.MEDIUM}
        />

        <Slider
          label="Wet"
          value={moistureThresholds.WET}
          onChange={(value) => updateMoistureThreshold("WET", value)}
          min={0.6}
          max={0.9}
          step={0.01}
          leftLabel={`${moistureThresholds.WET.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={MOISTURE_TOOLTIPS.WET}
        />
      </div>

      {/* Temperature thresholds */}
      <div className="bg-gray-700 p-3 rounded-md">
        <div className="flex items-center mb-2">
          <h4 className="font-medium">Temperature Thresholds</h4>
          <InfoIcon content="These values control the boundaries between different temperature zones in the world, affecting biome distribution." />
        </div>

        <Slider
          label="Freezing"
          value={temperatureThresholds.FREEZING}
          onChange={(value) => updateTemperatureThreshold("FREEZING", value)}
          min={0.0}
          max={0.2}
          step={0.01}
          leftLabel={`${temperatureThresholds.FREEZING.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={TEMPERATURE_TOOLTIPS.FREEZING}
        />

        <Slider
          label="Cold"
          value={temperatureThresholds.COLD}
          onChange={(value) => updateTemperatureThreshold("COLD", value)}
          min={0.1}
          max={0.4}
          step={0.01}
          leftLabel={`${temperatureThresholds.COLD.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={TEMPERATURE_TOOLTIPS.COLD}
        />

        <Slider
          label="Cool"
          value={temperatureThresholds.COOL}
          onChange={(value) => updateTemperatureThreshold("COOL", value)}
          min={0.3}
          max={0.5}
          step={0.01}
          leftLabel={`${temperatureThresholds.COOL.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={TEMPERATURE_TOOLTIPS.COOL}
        />

        <Slider
          label="Mild"
          value={temperatureThresholds.MILD}
          onChange={(value) => updateTemperatureThreshold("MILD", value)}
          min={0.45}
          max={0.65}
          step={0.01}
          leftLabel={`${temperatureThresholds.MILD.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={TEMPERATURE_TOOLTIPS.MILD}
        />

        <Slider
          label="Warm"
          value={temperatureThresholds.WARM}
          onChange={(value) => updateTemperatureThreshold("WARM", value)}
          min={0.6}
          max={0.8}
          step={0.01}
          leftLabel={`${temperatureThresholds.WARM.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={TEMPERATURE_TOOLTIPS.WARM}
        />

        <Slider
          label="Hot"
          value={temperatureThresholds.HOT}
          onChange={(value) => updateTemperatureThreshold("HOT", value)}
          min={0.7}
          max={0.95}
          step={0.01}
          leftLabel={`${temperatureThresholds.HOT.toFixed(2)}`}
          rightLabel="Threshold"
          tooltip={TEMPERATURE_TOOLTIPS.HOT}
        />
      </div>

      <div className="col-span-1 md:col-span-2 bg-gray-600 p-3 rounded-md">
        <p className="text-sm">
          These thresholds control the boundaries between different biome types.
          Adjusting moisture thresholds determines where deserts, grasslands,
          and forests appear. Temperature thresholds control the distribution of
          tundra, taiga, temperate, and tropical biomes.
        </p>
      </div>
    </div>
  );
};

export default ThresholdControls;
