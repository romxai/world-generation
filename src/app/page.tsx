"use client";

import React, { useState } from "react";
import WorldMap from "./components/WorldGenerator/WorldMap";
import {
  DEFAULT_SEED,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  DEFAULT_TILE_SIZE,
  WORLD_GRID_WIDTH,
  WORLD_GRID_HEIGHT,
} from "./components/WorldGenerator/config";

export default function Home() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [debug, setDebug] = useState(true);
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE);

  const generateNewSeed = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-2">Procedural World Generator</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <label htmlFor="seed">Seed:</label>
          <input
            id="seed"
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="bg-gray-800 px-2 py-1 rounded w-24 text-white"
          />
        </div>

        <button
          onClick={generateNewSeed}
          className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700"
        >
          Random Seed
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="tileSize">Base Tile Size:</label>
          <select
            id="tileSize"
            value={tileSize}
            onChange={(e) => setTileSize(Number(e.target.value))}
            className="bg-gray-800 px-2 py-1 rounded text-white"
          >
            <option value="8">8px</option>
            <option value="16">16px</option>
            <option value="32">32px</option>
            <option value="64">64px</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="debug">Debug Mode:</label>
          <input
            id="debug"
            type="checkbox"
            checked={debug}
            onChange={(e) => setDebug(e.target.checked)}
            className="bg-gray-800 rounded"
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="text-sm text-gray-400 mb-2 text-center">
          <strong>Controls:</strong> Use arrow keys to navigate the map, mouse
          wheel to zoom
        </div>

        <WorldMap
          width={WINDOW_WIDTH}
          height={WINDOW_HEIGHT}
          seed={seed}
          debug={debug}
          tileSize={tileSize}
        />
      </div>

      <div className="mt-2 text-sm text-gray-400 max-w-3xl text-center">
        <p>
          This world is divided into a fixed {WORLD_GRID_WIDTH}x
          {WORLD_GRID_HEIGHT} grid of purchasable tiles. The map is generated
          using Perlin noise to create natural-looking terrain with islands and
          continents. Tiles are only rendered when they are visible in the
          viewport for better performance.
        </p>
      </div>
    </div>
  );
}
