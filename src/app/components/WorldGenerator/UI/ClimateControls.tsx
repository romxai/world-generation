/**
 * ClimateControls.tsx
 *
 * Component for controlling climate and temperature parameters for the world.
 */

import React from "react";
import Slider from "./Slider";

interface ClimateControlsProps {
  equatorPosition: number;
  setEquatorPosition: (value: number) => void;
  temperatureVariance: number;
  setTemperatureVariance: (value: number) => void;
  elevationTempEffect: number;
  setElevationTempEffect: (value: number) => void;
  temperatureBandScale: number;
  setTemperatureBandScale: (value: number) => void;
}

const ClimateControls: React.FC<ClimateControlsProps> = ({
  equatorPosition,
  setEquatorPosition,
  temperatureVariance,
  setTemperatureVariance,
  elevationTempEffect,
  setElevationTempEffect,
  temperatureBandScale,
  setTemperatureBandScale,
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Climate Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded-md">
          <h4 className="font-medium mb-2">Temperature Distribution</h4>

          <Slider
            label="Equator Position"
            value={equatorPosition}
            onChange={setEquatorPosition}
            min={0.1}
            max={0.9}
            step={0.05}
            leftLabel={`South (${equatorPosition.toFixed(2)})`}
            rightLabel="North"
          />

          <Slider
            label="Temperature Variance"
            value={temperatureVariance}
            onChange={setTemperatureVariance}
            min={0}
            max={0.5}
            step={0.05}
            leftLabel={`Low (${temperatureVariance.toFixed(2)})`}
            rightLabel="High"
          />

          <Slider
            label="Temperature Band Scale"
            value={temperatureBandScale}
            onChange={setTemperatureBandScale}
            min={0.5}
            max={2}
            step={0.1}
            leftLabel={`Wide (${temperatureBandScale.toFixed(1)})`}
            rightLabel="Narrow"
          />
        </div>

        <div className="bg-gray-700 p-3 rounded-md">
          <h4 className="font-medium mb-2">Elevation Effects</h4>

          <Slider
            label="Elevation Temperature Effect"
            value={elevationTempEffect}
            onChange={setElevationTempEffect}
            min={0}
            max={0.8}
            step={0.05}
            leftLabel={`Weak (${elevationTempEffect.toFixed(2)})`}
            rightLabel="Strong"
          />

          <div className="mt-4 p-3 bg-gray-600 rounded-md">
            <p className="text-sm">
              Higher elevation temperature effect makes mountains colder.
              Increase for more snow and ice on mountains, decrease for warmer
              mountains.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateControls;
