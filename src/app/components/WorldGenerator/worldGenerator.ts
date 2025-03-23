/**
 * worldGenerator.ts
 *
 * Core world generation logic that combines elevation, moisture, and temperature
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
import {
  calculateTemperature,
  getTemperatureColor,
  TemperatureParams,
} from "./temperatureMapper";

/**
 * Interface for tile data in the world
 */
export interface WorldTile {
  x: number;
  y: number;
  elevation: number;
  moisture: number;
  temperature: number;
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
  temperatureParams: TemperatureParams;
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
   * Get temperature value at the specified world coordinates
   */
  getTemperature(x: number, y: number, elevation: number): number {
    return calculateTemperature(x, y, elevation, this.config.temperatureParams);
  }

  /**
   * Get comprehensive biome data at the specified coordinates
   */
  getBiomeData(x: number, y: number): BiomeData {
    // Get base elevation and moisture values
    const elevation = this.getElevation(x, y);
    const moisture = this.getMoisture(x, y);

    // Calculate temperature based on elevation and latitude
    const temperature = this.getTemperature(x, y, elevation);

    return {
      x,
      y,
      elevation,
      moisture,
      temperature,
    };
  }

  /**
   * Get biome type at the specified world coordinates
   */
  getBiome(x: number, y: number): BiomeType {
    const biomeData = this.getBiomeData(x, y);
    return getBiomeType(biomeData);
  }

  /**
   * Get full tile data for a specific location
   */
  getTile(x: number, y: number): WorldTile {
    // Get all biome data
    const biomeData = this.getBiomeData(x, y);

    // Determine biome based on data
    const biomeType = getBiomeType(biomeData);

    // Get appropriate color for this biome
    const color = getBiomeColor(biomeType);

    return {
      x,
      y,
      elevation: biomeData.elevation,
      moisture: biomeData.moisture,
      temperature: biomeData.temperature,
      biomeType,
      color,
    };
  }

  /**
   * Get a color for the specified location based on visualization mode
   */
  getColorForMode(x: number, y: number, mode: VisualizationMode): RGB {
    // Get biome data
    const biomeData = this.getBiomeData(x, y);

    // Return appropriate color based on visualization mode
    switch (mode) {
      case VisualizationMode.NOISE:
        // Return grayscale based on elevation
        const value = Math.floor(biomeData.elevation * 255);
        return { r: value, g: value, b: value };

      case VisualizationMode.ELEVATION:
        // Return elevation-based color gradient
        return getElevationColor(biomeData.elevation);

      case VisualizationMode.MOISTURE:
        // Return moisture-based color gradient
        return getMoistureColor(biomeData.moisture);

      case VisualizationMode.TEMPERATURE:
        // Return temperature-based color gradient
        return getTemperatureColor(biomeData.temperature);

      case VisualizationMode.WEIGHT_DISTRIBUTION:
        // For backward compatibility, show terrain distribution
        const terrainType = getTerrainTypeForHeight(biomeData.elevation);
        return getTerrainColor(biomeData.elevation, terrainType);

      case VisualizationMode.BIOME:
      default:
        // Return biome color (default mode)
        const biomeType = getBiomeType(biomeData);
        return getBiomeColor(biomeType);
    }
  }

  /**
   * Generate debug information for a specific location
   */
  getDebugInfo(x: number, y: number): string {
    const biomeData = this.getBiomeData(x, y);
    const biomeType = getBiomeType(biomeData);

    return (
      `Tile(${x},${y}) - ` +
      `Elev: ${biomeData.elevation.toFixed(3)} - ` +
      `Moist: ${biomeData.moisture.toFixed(3)} - ` +
      `Temp: ${biomeData.temperature.toFixed(3)} - ` +
      `Biome: ${BiomeType[biomeType]}`
    );
  }
}
