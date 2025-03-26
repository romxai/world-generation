/**
 * worldGenerator.ts
 *
 * Core world generation logic that combines elevation, moisture, and temperature
 * noise to produce a complete world map with various biomes.
 */

import {
  BiomeType,
  RGB,
  VisualizationMode,
  DEFAULT_RADIAL_PARAMS,
  TemperatureParams,
  RadialGradientParams,
} from "./config";
import {
  OctaveNoise,
  createElevationNoise,
  createMoistureNoise,
} from "./octaveNoise";
import {
  getBiomeColor,
  getBiomeType,
  getElevationColor,
  getMoistureColor,
  BiomeData,
} from "./biomeMapper";
import { getTemperatureColor, TemperatureMapper } from "./temperatureMapper";
import { applyRadialGradient } from "./radialUtils";

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
  radialGradientParams: RadialGradientParams;
  moistureThresholds?: any; // Using 'any' temporarily, ideally should be properly typed
  temperatureThresholds?: any; // Using 'any' temporarily, ideally should be properly typed
}

/**
 * Class that handles world generation using multiple noise functions
 */
export class WorldGenerator {
  private elevationNoise: OctaveNoise;
  private moistureNoise: OctaveNoise;
  private config: WorldGeneratorConfig;
  private temperatureMapper: TemperatureMapper;
  private moistureThresholds: any; // Using 'any' temporarily
  private temperatureThresholds: any; // Using 'any' temporarily

  /**
   * Create a new world generator with the specified configuration
   */
  constructor(config: WorldGeneratorConfig) {
    this.config = {
      ...config,
      radialGradientParams:
        config.radialGradientParams || DEFAULT_RADIAL_PARAMS,
    };

    // Store thresholds
    this.moistureThresholds = config.moistureThresholds || {};
    this.temperatureThresholds = config.temperatureThresholds || {};

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

    // Initialize temperature mapper with precomputed heat gradient
    this.temperatureMapper = new TemperatureMapper(config.temperatureParams);
  }

  /**
   * Update the configuration of the world generator
   */
  updateConfig(newConfig: Partial<WorldGeneratorConfig>): void {
    // Update the stored configuration
    this.config = {
      ...this.config,
      ...newConfig,
    };

    // Store thresholds if provided
    if (newConfig.moistureThresholds) {
      this.moistureThresholds = newConfig.moistureThresholds;
    }
    if (newConfig.temperatureThresholds) {
      this.temperatureThresholds = newConfig.temperatureThresholds;
    }

    // If seed changed, recreate the noise generators
    if (newConfig.seed !== undefined) {
      this.elevationNoise = createElevationNoise(
        this.config.seed,
        this.config.elevationOctaves
      );
      this.moistureNoise = createMoistureNoise(
        this.config.seed,
        this.config.moistureOctaves
      );

      // Apply existing scale and persistence settings
      this.elevationNoise.updateParams({
        scale: this.config.elevationScale,
        persistence: this.config.elevationPersistence,
      });

      this.moistureNoise.updateParams({
        scale: this.config.moistureScale,
        persistence: this.config.moisturePersistence,
      });

      // Recreate the temperature mapper with new seed
      this.temperatureMapper = new TemperatureMapper({
        ...this.config.temperatureParams,
        noiseSeed: this.config.seed + 2000, // Use a different offset for temperature
      });

      return; // Skip other updates if seed changed
    }

    // Update elevation noise parameters if provided
    if (
      newConfig.elevationOctaves ||
      newConfig.elevationScale ||
      newConfig.elevationPersistence
    ) {
      // If octaves changed, recreate the noise generator
      if (newConfig.elevationOctaves) {
        this.elevationNoise = createElevationNoise(
          this.config.seed,
          this.config.elevationOctaves
        );
      }

      this.elevationNoise.updateParams({
        scale: this.config.elevationScale,
        persistence: this.config.elevationPersistence,
      });
    }

    // Update moisture noise parameters if provided
    if (
      newConfig.moistureOctaves ||
      newConfig.moistureScale ||
      newConfig.moisturePersistence
    ) {
      // If octaves changed, recreate the noise generator
      if (newConfig.moistureOctaves) {
        this.moistureNoise = createMoistureNoise(
          this.config.seed,
          this.config.moistureOctaves
        );
      }

      this.moistureNoise.updateParams({
        scale: this.config.moistureScale,
        persistence: this.config.moisturePersistence,
      });
    }

    // Update temperature parameters if provided
    if (newConfig.temperatureParams) {
      this.temperatureMapper = new TemperatureMapper({
        ...this.config.temperatureParams,
        ...newConfig.temperatureParams,
      });
    }
  }

  /**
   * Get the elevation value at the specified world coordinates
   */
  getElevation(x: number, y: number): number {
    // Get raw elevation noise value
    let elevation = this.elevationNoise.get(x, y);

    // Apply radial gradient for continent/ocean distribution if enabled
    if (
      this.config.radialGradientParams &&
      this.config.radialGradientParams.strength !== undefined &&
      this.config.radialGradientParams.strength > 0
    ) {
      elevation = applyRadialGradient(
        x,
        y,
        elevation,
        this.config.radialGradientParams
      );
    }

    return elevation;
  }

  /**
   * Get the moisture value at the specified world coordinates
   */
  getMoisture(x: number, y: number): number {
    return this.moistureNoise.get(x, y);
  }

  /**
   * Get the temperature value at the specified world coordinates
   */
  getTemperature(x: number, y: number, elevation: number): number {
    return this.temperatureMapper.calculateTemperature(x, y, elevation);
  }

  /**
   * Get comprehensive biome data for a specific location
   */
  getBiomeData(x: number, y: number): BiomeData {
    // Get raw elevation and moisture values
    const elevation = this.getElevation(x, y);
    const moisture = this.getMoisture(x, y);
    const temperature = this.getTemperature(x, y, elevation);

    // Return comprehensive data object
    return {
      elevation,
      moisture,
      temperature,
      x,
      y,
      // Add threshold data for biome determination
      moistureThresholds: this.moistureThresholds,
      temperatureThresholds: this.temperatureThresholds,
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
