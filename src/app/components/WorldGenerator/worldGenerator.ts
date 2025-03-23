/**
 * worldGenerator.ts
 *
 * Core world generation logic that combines elevation and moisture
 * noise to produce a complete world map with various biomes.
 */

import { BiomeType, RGB, TerrainType, VisualizationMode } from "./config";
import {
  OctaveNoise,
  createElevationNoise,
  createMoistureNoise,
} from "./octaveNoise";
import {
  ElevationMoistureData,
  getBiomeColor,
  getBiomeType,
  getElevationColor,
  getMoistureColor,
} from "./biomeMapper";
import { getTerrainTypeForHeight, getTerrainColor } from "./terrainUtils";

/**
 * Interface for tile data in the world
 */
export interface WorldTile {
  x: number;
  y: number;
  elevation: number;
  moisture: number;
  biomeType: BiomeType;
  color: RGB;
}

/**
 * Configuration for the world generator
 */
export interface WorldGeneratorConfig {
  seed: number;
  elevationOctaves: number;
  moistureOctaves: number;
  elevationScale: number;
  moistureScale: number;
  elevationPersistence: number;
  moisturePersistence: number;
}

/**
 * Class that handles world generation using multiple noise functions
 */
export class WorldGenerator {
  private elevationNoise: OctaveNoise;
  private moistureNoise: OctaveNoise;
  private config: WorldGeneratorConfig;

  /**
   * Create a new world generator with the specified configuration
   */
  constructor(config: WorldGeneratorConfig) {
    this.config = config;

    // Create noise generators for elevation and moisture
    this.elevationNoise = createElevationNoise(
      config.seed,
      config.elevationOctaves
    );
    this.moistureNoise = createMoistureNoise(
      config.seed,
      config.moistureOctaves
    );

    // Update noise generator settings
    this.elevationNoise.updateParams({
      scale: config.elevationScale,
      persistence: config.elevationPersistence,
    });

    this.moistureNoise.updateParams({
      scale: config.moistureScale,
      persistence: config.moisturePersistence,
    });
  }

  /**
   * Update the configuration of the world generator
   */
  updateConfig(newConfig: Partial<WorldGeneratorConfig>): void {
    // Update stored config
    this.config = { ...this.config, ...newConfig };

    // If seed changed, recreate both noise generators
    if (newConfig.seed !== undefined) {
      this.elevationNoise = createElevationNoise(
        this.config.seed,
        this.config.elevationOctaves
      );
      this.moistureNoise = createMoistureNoise(
        this.config.seed,
        this.config.moistureOctaves
      );
    }

    // Update elevation noise parameters if needed
    if (
      newConfig.elevationOctaves !== undefined ||
      newConfig.elevationScale !== undefined ||
      newConfig.elevationPersistence !== undefined
    ) {
      this.elevationNoise.updateParams({
        octaveCount: this.config.elevationOctaves,
        scale: this.config.elevationScale,
        persistence: this.config.elevationPersistence,
      });
    }

    // Update moisture noise parameters if needed
    if (
      newConfig.moistureOctaves !== undefined ||
      newConfig.moistureScale !== undefined ||
      newConfig.moisturePersistence !== undefined
    ) {
      this.moistureNoise.updateParams({
        octaveCount: this.config.moistureOctaves,
        scale: this.config.moistureScale,
        persistence: this.config.moisturePersistence,
      });
    }
  }

  /**
   * Get elevation value at the specified world coordinates
   */
  getElevation(x: number, y: number): number {
    return this.elevationNoise.get(x, y);
  }

  /**
   * Get moisture value at the specified world coordinates
   */
  getMoisture(x: number, y: number): number {
    return this.moistureNoise.get(x, y);
  }

  /**
   * Get both elevation and moisture values at once
   */
  getElevationAndMoisture(x: number, y: number): ElevationMoistureData {
    return {
      elevation: this.getElevation(x, y),
      moisture: this.getMoisture(x, y),
    };
  }

  /**
   * Get biome type at the specified world coordinates
   */
  getBiome(x: number, y: number): BiomeType {
    const { elevation, moisture } = this.getElevationAndMoisture(x, y);
    return getBiomeType(elevation, moisture);
  }

  /**
   * Get full tile data for a specific location
   */
  getTile(x: number, y: number): WorldTile {
    // Get base elevation and moisture values
    const { elevation, moisture } = this.getElevationAndMoisture(x, y);

    // Determine biome based on elevation and moisture
    const biomeType = getBiomeType(elevation, moisture);

    // Get appropriate color for this biome
    const color = getBiomeColor(biomeType);

    return {
      x,
      y,
      elevation,
      moisture,
      biomeType,
      color,
    };
  }

  /**
   * Get a color for the specified location based on visualization mode
   */
  getColorForMode(x: number, y: number, mode: VisualizationMode): RGB {
    // Get raw elevation and moisture data
    const { elevation, moisture } = this.getElevationAndMoisture(x, y);

    // Return appropriate color based on visualization mode
    switch (mode) {
      case VisualizationMode.NOISE:
        // Return grayscale based on elevation
        const value = Math.floor(elevation * 255);
        return { r: value, g: value, b: value };

      case VisualizationMode.ELEVATION:
        // Return elevation-based color gradient
        return getElevationColor(elevation);

      case VisualizationMode.MOISTURE:
        // Return moisture-based color gradient
        return getMoistureColor(moisture);

      case VisualizationMode.WEIGHT_DISTRIBUTION:
        // For backward compatibility, show terrain distribution
        const terrainType = getTerrainTypeForHeight(elevation);
        return getTerrainColor(elevation, terrainType);

      case VisualizationMode.BIOME:
      default:
        // Return biome color (default mode)
        const biomeType = getBiomeType(elevation, moisture);
        return getBiomeColor(biomeType);
    }
  }

  /**
   * Generate debug information for a specific location
   */
  getDebugInfo(x: number, y: number): string {
    const { elevation, moisture } = this.getElevationAndMoisture(x, y);
    const biomeType = getBiomeType(elevation, moisture);

    return (
      `Tile(${x},${y}) - ` +
      `Elevation: ${elevation.toFixed(3)} - ` +
      `Moisture: ${moisture.toFixed(3)} - ` +
      `Biome: ${BiomeType[biomeType]}`
    );
  }
}
