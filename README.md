# Advanced Procedural World Generator

This component provides a complete procedural world generation system with advanced features for creating rich, detailed landscapes with diverse biomes.

## Key Features

- **Multi-octave Noise Generation**: Combines multiple noise functions at different frequencies and amplitudes to create more natural-looking terrain
- **Separate Elevation and Moisture Systems**: Uses independent noise generators for elevation and moisture to create diverse biomes
- **Rich Biome System**: Implements a wide range of biomes based on the Whittaker biome classification, combining elevation and moisture values
- **Highly Configurable**: All generation parameters can be adjusted via the UI
- **Interactive Visualization Modes**: View the world through different lenses (biomes, elevation, moisture, etc.)
- **Performance Optimizations**: Only renders visible portions of the world, with level-of-detail based on zoom level

## Technical Implementation

The world generator is built using multiple modules:

### Core Components

- **Config (`config.ts`)**: Central configuration and constants for the generator
- **Noise Generator (`noiseGenerator.ts`)**: Base Perlin noise implementation
- **Octave Noise (`octaveNoise.ts`)**: Multi-octave noise system that enhances the base noise
- **Biome Mapper (`biomeMapper.ts`)**: Maps elevation and moisture values to specific biomes
- **World Generator (`worldGenerator.ts`)**: Core logic for world generation
- **WorldMap Component (`WorldMap.tsx`)**: React component for rendering the world

### Noise Generation

The system uses octave noise to create more natural terrain:

1. **Base Noise**: Perlin noise provides the foundation
2. **Multiple Octaves**: Each octave adds detail at different scales
3. **Frequency & Amplitude**: Higher frequencies add detail, with decreasing amplitude (persistence)

Example:

```typescript
// Create noise with 4 octaves
const elevationNoise = createElevationNoise(seed, 4);

// Get noise value at specific coordinates
const elevation = elevationNoise.get(x, y);
```

### Biome System

Biomes are determined by combining elevation and moisture values:

1. **Elevation Bands**: The world is divided into multiple elevation bands (deep water to high mountains)
2. **Moisture Levels**: Each location has a moisture value from very dry to very wet
3. **Biome Classification**: The combination of elevation and moisture determines the biome

Example:

```typescript
// Get elevation and moisture values
const elevation = elevationNoise.get(x, y);
const moisture = moistureNoise.get(x, y);

// Determine biome
const biome = getBiomeType(elevation, moisture);
```

## Available Biomes

The system provides a rich set of biomes:

### Water Biomes

- Deep Ocean
- Medium Ocean
- Shallow Ocean

### Shore Biomes

- Beach
- Rocky Shore

### Low Elevation Biomes

- Subtropical Desert (dry)
- Temperate Desert (dry)
- Grassland (medium moisture)
- Tropical Seasonal Forest (wet)
- Tropical Rainforest (very wet)

### Medium Elevation Biomes

- Temperate Desert (dry)
- Shrubland (dry to medium)
- Temperate Grassland (medium)
- Temperate Deciduous Forest (wet)

### High Elevation Biomes

- Shrubland (dry)
- Taiga (medium to wet)
- Tundra (wet)

### Very High Elevation Biomes

- Bare (dry to medium)
- Scorched (wet)
- Snow (highest elevations)

## UI Controls

The system provides UI controls for adjusting:

- World seed
- Visualization mode
- Biome presets
- Elevation parameters (octaves, scale, persistence)
- Moisture parameters (octaves, scale, persistence)
- Display settings (tile size, debug info)

## Performance Considerations

- **Lazy Generation**: Only visible portions of the world are generated
- **Level of Detail**: Lower zoom levels use larger tiles for better performance
- **Offscreen Canvas**: Rendering is done to an offscreen canvas before copying

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

3. **Biome Variations**: Additional biome types can be easily added by extending the `BiomeType` enum and corresponding color configurations.

4. **Feature Generation**: The system can be extended to add rivers, roads, settlements, etc. on top of the base terrain.

5. **Interaction**: Additional modes for selecting and modifying tiles can be implemented.
