import React, { useEffect, useRef } from "react";

const WorldMap: React.FC = () => {
  const worldGeneratorRef = useRef<any>(null);

  // When generation parameters change, update the world generator
  useEffect(() => {
    worldGeneratorRef.current.updateConfig({
      seed,
      elevationOctaves,
      moistureOctaves,
      elevationScale,
      moistureScale,
      elevationPersistence,
      moisturePersistence,
      temperatureParams: temperatureParams,
      radialGradientParams: radialGradientParams,
    });
    setMapChanged(true);
  }, [
    seed,
    elevationOctaves,
    moistureOctaves,
    elevationScale,
    moistureScale,
    elevationPersistence,
    moisturePersistence,
    temperatureParams,
    radialGradientParams,
  ]);

  return <div>WorldMap component content</div>;
};

export default WorldMap;
