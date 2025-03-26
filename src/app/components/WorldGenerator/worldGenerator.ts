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
  calculateBiomeHeights,
  BIOME_HEIGHTS,
  ContinentalFalloffParams,
  DEFAULT_CONTINENTAL_PARAMS,
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
  getTemperatureColor,
  rgbToString,
} from "./biomeMapper";
import {
  getTemperatureColor as getTemperatureMapColor,
  TemperatureMapper,
} from "./temperatureMapper";
import { applyRadialGradient } from "./radialUtils";
import {
  ResourceGenerator,
  ResourceType,
  getResourceVisualizationColor,
  RESOURCE_VISUALIZATION_MODE,
} from "./resourceGenerator";

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
  resource: ResourceType;
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
  continentalFalloffParams?: ContinentalFalloffParams;
  moistureThresholds?: any; // Using 'any' temporarily, ideally should be properly typed
  temperatureThresholds?: any; // Using 'any' temporarily
  resourceDensity?: number;
  resourceScale?: number;
}

/**
 * Class that handles world generation using multiple noise functions
 */
export class WorldGenerator {
  private elevationNoise: OctaveNoise;
  private moistureNoise: OctaveNoise;
  private continentalNoise: OctaveNoise;
  private config: WorldGeneratorConfig;
  private temperatureMapper: TemperatureMapper;
  private resourceGenerator: ResourceGenerator;
  private moistureThresholds: any; // Using 'any' temporarily
  private temperatureThresholds: any; // Using 'any' temporarily
  private biomeHeights: typeof BIOME_HEIGHTS;

  /**
   * Create a new world generator with the specified configuration
   */
  constructor(config: WorldGeneratorConfig) {
    this.config = {
      ...config,
      radialGradientParams:
        config.radialGradientParams || DEFAULT_RADIAL_PARAMS,
      continentalFalloffParams:
        config.continentalFalloffParams || DEFAULT_CONTINENTAL_PARAMS,
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

    // Create continental noise generator
    this.continentalNoise = createElevationNoise(
      config.seed + (this.config.continentalFalloffParams?.noiseOffset || 5000),
      3 // Use fewer octaves for continental noise
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

    this.continentalNoise.updateParams({
      scale: this.config.continentalFalloffParams?.scale || 180,
      persistence: 0.5, // Use medium persistence for continental noise
    });

    // Initialize temperature mapper with precomputed heat gradient
    this.temperatureMapper = new TemperatureMapper(config.temperatureParams);

    // Initialize resource generator
    this.resourceGenerator = new ResourceGenerator({
      seed: config.seed + 3000, // Use a different offset for resources
      resourceDensity: config.resourceDensity || 0.25,
      resourceScale: config.resourceScale || 150,
    });

    // Calculate initial biome heights
    this.biomeHeights = calculateBiomeHeights([80, 10, 10, 5, 35, 25, 20]);
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

      // Recreate the continental noise with new seed
      this.continentalNoise = createElevationNoise(
        this.config.seed +
          (this.config.continentalFalloffParams?.noiseOffset || 5000),
        3
      );

      // Apply continental noise parameters
      this.continentalNoise.updateParams({
        scale: this.config.continentalFalloffParams?.scale || 180,
        persistence: 0.5,
      });

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

      // Update resource generator with new seed
      this.resourceGenerator.updateConfig({
        seed: this.config.seed + 3000, // Different offset for resources
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

    // Update temperature mapper if temperature params have changed
    if (newConfig.temperatureParams) {
      this.temperatureMapper = new TemperatureMapper({
        ...this.config.temperatureParams,
        ...newConfig.temperatureParams,
      });
    }

    // Update resource generator if resource parameters have changed
    if (
      newConfig.resourceDensity !== undefined ||
      newConfig.resourceScale !== undefined
    ) {
      this.resourceGenerator.updateConfig({
        resourceDensity:
          newConfig.resourceDensity !== undefined
            ? newConfig.resourceDensity
            : this.config.resourceDensity,
        resourceScale:
          newConfig.resourceScale !== undefined
            ? newConfig.resourceScale
            : this.config.resourceScale,
      });
    }

    // Update continental noise parameters if continental params changed
    if (newConfig.continentalFalloffParams) {
      this.continentalNoise.updateParams({
        scale: this.config.continentalFalloffParams?.scale || 180,
        persistence: 0.5,
      });
    }
  }

  /**
   * Apply continental falloff to create distinct landmasses
   */
  private applyContinentalFalloff(
    x: number,
    y: number,
    elevation: number
  ): number {
    const params = this.config.continentalFalloffParams;

    // If not enabled, return the original elevation
    if (!params?.enabled) {
      return elevation;
    }

    // Get continental noise value - this will identify potential continents
    const continentalValue = this.continentalNoise.get(x, y);

    // If above threshold, this is a potential continent center
    if (continentalValue > (params.threshold || 0.45)) {
      // No falloff applied to continent centers
      return elevation;
    }

    // Calculate how far below threshold we are (0-1 range)
    const distanceFromContinent =
      ((params.threshold || 0.45) - continentalValue) *
      (params.sharpness || 4.0);

    // Calculate falloff effect (0-1 range, clamped)
    const falloffEffect = Math.min(1, Math.max(0, distanceFromContinent));

    // Apply falloff to elevation - reduce more as we get further from continent
    // Use oceanDepth to control how deep the oceans get
    const reducedElevation =
      elevation -
      falloffEffect * (params.strength || 0.6) * (params.oceanDepth || 0.7);

    return reducedElevation;
  }

  /**
   * Get the elevation value at a specific coordinate
   */
  getElevation(x: number, y: number): number {
    // Get raw elevation from noise
    const rawElevation = this.elevationNoise.get(x, y);

    // Apply radial gradient effect to create ocean borders
    const radialElevation = applyRadialGradient(
      x,
      y,
      rawElevation,
      this.config.radialGradientParams
    );

    // Apply continental falloff to create distinct landmasses
    return this.applyContinentalFalloff(x, y, radialElevation);
  }

  /**
   * Get the moisture value at a specific coordinate
   */
  getMoisture(x: number, y: number): number {
    return this.moistureNoise.get(x, y);
  }

  /**
   * Get the temperature value at a specific coordinate
   */
  getTemperature(x: number, y: number, elevation: number): number {
    return this.temperatureMapper.calculateTemperature(x, y, elevation);
  }

  /**
   * Get complete biome data for a specific position
   */
  getBiomeData(x: number, y: number): BiomeData {
    // Get raw values
    const elevation = this.getElevation(x, y);
    const moisture = this.getMoisture(x, y);
    const temperature = this.getTemperature(x, y, elevation);

    return {
      elevation,
      moisture,
      temperature,
      x,
      y,
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
   * Get resource at a specific position
   */
  getResource(x: number, y: number, tile: WorldTile): ResourceType {
    return this.resourceGenerator.getResourceAt(x, y, tile);
  }

  /**
   * Get complete tile data for a specific position
   */
  getTile(x: number, y: number): WorldTile {
    // Get base values
    const elevation = this.getElevation(x, y);
    const moisture = this.getMoisture(x, y);
    const temperature = this.getTemperature(x, y, elevation);
    const biomeType = getBiomeType({
      elevation,
      moisture,
      temperature,
      x,
      y,
      moistureThresholds: this.moistureThresholds,
      temperatureThresholds: this.temperatureThresholds,
    });

    // Create initial tile
    const tile: WorldTile = {
      x,
      y,
      elevation,
      moisture,
      temperature,
      biomeType,
      resource: ResourceType.NONE, // Default to no resource
      color: getBiomeColor(biomeType),
    };

    // Add resource information
    tile.resource = this.getResource(x, y, tile);

    return tile;
  }

  /**
   * Get the color for a specific world location based on the visualization mode
   */
  getColorForMode(x: number, y: number, mode: VisualizationMode): RGB {
    switch (mode) {
      case VisualizationMode.BIOME:
        return getBiomeColor(this.getBiome(x, y));

      case VisualizationMode.ELEVATION:
        return getElevationColor(this.getElevation(x, y));

      case VisualizationMode.MOISTURE:
        return getMoistureColor(this.getMoisture(x, y));

      case VisualizationMode.TEMPERATURE: {
        const elevation = this.getElevation(x, y);
        const temperature = this.getTemperature(x, y, elevation);
        return getTemperatureMapColor(temperature);
      }

      case VisualizationMode.NOISE:
        // Visualize raw noise (grayscale)
        const value = this.elevationNoise.getRaw(x, y);
        const intensity = Math.floor(((value + 1) / 2) * 255);
        return { r: intensity, g: intensity, b: intensity };

      case VisualizationMode.RESOURCE: {
        // Get the tile data
        const tile = this.getTile(x, y);
        // Return resource visualization color
        return getResourceVisualizationColor(tile.resource);
      }

      default:
        return { r: 0, g: 0, b: 0 }; // Black for unknown mode
    }
  }

  /**
   * Get debug information for a specific position
   */
  getDebugInfo(x: number, y: number): string {
    const tile = this.getTile(x, y);
    const biomeInfo = `Biome: ${BiomeType[tile.biomeType]}`;
    const elevationInfo = `Elevation: ${tile.elevation.toFixed(3)}`;
    const moistureInfo = `Moisture: ${tile.moisture.toFixed(3)}`;
    const tempInfo = `Temperature: ${tile.temperature.toFixed(3)}`;
    const resourceInfo =
      tile.resource !== ResourceType.NONE
        ? `\nResource: ${ResourceType[tile.resource]}`
        : "";

    return `${biomeInfo}\n${elevationInfo}\n${moistureInfo}\n${tempInfo}${resourceInfo}`;
  }
}
