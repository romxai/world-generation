"use client";

import React, { useState } from "react";
import PolygonMap from "../components/WorldGenerator/PolygonMap";
import {
  BiomeWeights,
  VisualizationMode,
} from "../components/WorldGenerator/config";

/**
 * Polygon World Generation Demo
 *
 * This page demonstrates our advanced world generation using Voronoi polygons
 * with Delaunay triangulation and Lloyd relaxation for more natural terrain.
 */
export default function PolygonWorldPage() {
  // Map settings with state
  const [seed, setSeed] = useState<number>(42);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>("terrain");
  const [noiseDetail, setNoiseDetail] = useState<number>(8);
  const [noiseFalloff, setNoiseFalloff] = useState<number>(0.5);
  const [debug, setDebug] = useState<boolean>(false);

  // Biome weights for terrain distribution
  const [biomeWeights, setBiomeWeights] = useState<BiomeWeights>({
    ocean: 0.5, // Ocean coverage
    beach: 0.05, // Beach size
    plains: 0.2, // Plains coverage
    forest: 0.1, // Forest coverage
    hills: 0.05, // Hills coverage
    mountains: 0.07, // Mountain coverage
    snow: 0.03, // Snow coverage
  });

  // Function to generate a new random seed
  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Polygon-Based World Generator</h1>
      <p className="text-sm mb-6 text-center max-w-2xl">
        This advanced world generator uses Voronoi polygons with Delaunay
        triangulation and Lloyd relaxation to create more natural-looking
        terrain. The use of polygons instead of a square grid allows for more
        organic landmasses and water features.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Visualization Mode</label>
          <select
            className="p-2 border rounded"
            value={visualizationMode}
            onChange={(e) =>
              setVisualizationMode(e.target.value as VisualizationMode)
            }
          >
            <option value="terrain">Terrain</option>
            <option value="elevation">Elevation</option>
            <option value="noise">Raw Noise</option>
            <option value="weight">Weight Distribution</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Seed</label>
          <div className="flex">
            <input
              type="number"
              className="p-2 border rounded"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
            />
            <button
              className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={generateRandomSeed}
            >
              Random
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Noise Detail ({noiseDetail})</label>
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={noiseDetail}
            onChange={(e) => setNoiseDetail(Number(e.target.value))}
            className="w-40"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">
            Noise Falloff ({noiseFalloff.toFixed(2)})
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={noiseFalloff}
            onChange={(e) => setNoiseFalloff(Number(e.target.value))}
            className="w-40"
          />
        </div>

        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="debug"
            checked={debug}
            onChange={(e) => setDebug(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="debug" className="text-sm">
            Show Debug Info
          </label>
        </div>
      </div>

      <div className="border border-gray-300 rounded overflow-hidden">
        <PolygonMap
          width={960}
          height={600}
          seed={seed}
          debug={debug}
          biomeWeights={biomeWeights}
          noiseDetail={noiseDetail}
          noiseFalloff={noiseFalloff}
          visualizationMode={visualizationMode as "terrain"}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Ocean</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={biomeWeights.ocean}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                ocean: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.ocean?.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Beach</label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={biomeWeights.beach}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                beach: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.beach?.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Plains</label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={biomeWeights.plains}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                plains: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.plains?.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Forest</label>
          <input
            type="range"
            min="0.05"
            max="0.4"
            step="0.05"
            value={biomeWeights.forest}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                forest: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.forest?.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Hills</label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={biomeWeights.hills}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                hills: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.hills?.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Mountains</label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={biomeWeights.mountains}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                mountains: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.mountains?.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Snow</label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={biomeWeights.snow}
            onChange={(e) =>
              setBiomeWeights({
                ...biomeWeights,
                snow: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <span className="text-xs text-center">
            {biomeWeights.snow?.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
