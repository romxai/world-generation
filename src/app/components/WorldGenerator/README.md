# Procedural World Generator

A procedural world map generator for Next.js applications using Perlin noise to create colorful, infinitely explorable terrain with a fixed grid of purchasable tiles.

## Features

- Fixed 1000x1000 grid of tiles representing purchasable land parcels
- Grid-based tile system with color-based terrain rendering
- Multiple terrain types (ocean, beach, grass, mountains, snow)
- Smooth zooming and panning with proper constraints
- Optimized to only render tiles visible in the viewport
- Configurable seed for reproducible world generation
- Debug mode for development assistance
- Grid lines and coordinates shown only when zoomed in sufficiently
- Modular architecture with specialized components

## Files Structure

The generator is composed of several specialized files:

- `config.ts` - Configuration constants, terrain type definitions, and world parameters
- `noiseGenerator.ts` - Implementation of Perlin noise algorithm with seed support
- `terrainUtils.ts` - Utilities for terrain generation and coloring
- `WorldMap.tsx` - Main React component for rendering the world

## How It Works

1. **Fixed World Grid**: The world consists of a fixed 1000x1000 grid of tiles, providing a bounded world that users can explore.

2. **Noise Generation**: The system uses a custom Perlin noise implementation with a configurable seed to ensure reproducible results. The noise values are mapped to different terrain types.

3. **Tile System**: Each tile's terrain type is determined by its corresponding noise value, creating natural-looking continents and islands.

4. **Lazy Loading**: Only tiles visible in the current viewport are generated and rendered, greatly optimizing performance.

5. **Adaptive Detail**: Grid lines and coordinates are only shown when zoomed in enough, providing a cleaner view when zoomed out.

6. **Smooth Zooming**: The zoom centers on the mouse position, creating a natural zooming experience toward what the user is looking at.

7. **Bounded Panning**: Camera movement is constrained to the world boundaries, preventing users from navigating outside the world.

## Usage

```tsx
import WorldMap from './components/WorldGenerator/WorldMap';

// Basic usage with default values
<WorldMap />

// With custom parameters
<WorldMap
  width={1080}
  height={720}
  tileSize={16}
  seed={42}
  debug={true}
/>
```

## Configuration

You can customize various aspects of the world generation by modifying the `config.ts` file:

- Window dimensions and base tile size
- World grid dimensions (1000x1000 by default)
- Noise parameters (detail, falloff)
- Terrain heights and colors
- Camera settings (zoom limits, movement speed)
- Debug and display settings

## Implementation Details

### Fixed-Size World Grid

The world has a fixed size grid (1000x1000 tiles), which means:

- Total number of tiles stays constant regardless of zoom level
- At low zoom levels, individual tiles may be too small to see but the terrain is still visible
- At high zoom levels, individual tiles and grid lines become clearly visible

### Camera System

The camera system uses:

- A zoom factor that scales the visual size of tiles
- World coordinates for navigation (0,0 to 999,999)
- Pixel coordinates for rendering
- Conversion between these coordinate systems for interaction

### Performance Optimizations

- Only tiles visible in the viewport are generated and rendered
- Offscreen canvas is used for rendering before copying to visible canvas
- Tiles outside the viewport are not processed at all
- Grid lines and coordinates are only drawn when zoomed in sufficiently

## Future Extensions

The system is designed to be extendable in several ways:

1. **Tile Ownership**: Since the grid is fixed, each tile can be mapped to an owner or purchase status.

2. **Tileset Support**: The code includes infrastructure for using image-based tilesets instead of colors, with tile edge detection for proper borders.

3. **Biome Variations**: Additional terrain types can be easily added by extending the `TerrainType` enum and corresponding configs.

4. **Feature Generation**: The system can be extended to add rivers, roads, settlements, etc. on top of the base terrain.

5. **Interaction**: Additional modes for selecting and modifying tiles can be implemented.
