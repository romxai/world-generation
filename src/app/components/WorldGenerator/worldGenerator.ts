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
  ResourceType,
  ResourceConfig,
  DEFAULT_RESOURCE_CONFIGS,
} from "./config";
import {
  OctaveNoise,
  createElevationNoise,
  createMoistureNoise,
  OctaveNoiseParams,
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
 * Resource data for each tile
 */
export interface ResourceData {
  type: ResourceType;
  density: number; // 0-1 value representing concentration
  depositSize: number; // Size of the deposit (1-10)
}

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
  resources: Partial<Record<ResourceType, ResourceData>>; // Resources present in this tile
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
  moistureThresholds?: Record<string, number>; // More specific type for moisture thresholds
  temperatureThresholds?: Record<string, number>; // More specific type for temperature thresholds
  resourceConfigs?: Record<ResourceType, ResourceConfig>; // Configuration for resource generation
}

/**
 * Class that handles world generation using multiple noise functions
 */
export class WorldGenerator {
  private elevationNoise: OctaveNoise;
  private moistureNoise: OctaveNoise;
  private resourceNoise: Record<ResourceType, OctaveNoise>; // Noise generators for each resource
  private config: WorldGeneratorConfig;
  private temperatureMapper: TemperatureMapper;
  private moistureThresholds: Record<string, number>; // More specific type
  private temperatureThresholds: Record<string, number>; // More specific type
  private resourceConfigs: Record<ResourceType, ResourceConfig>;

  /**
   * Create a new world generator with the specified configuration
   */
  constructor(config: WorldGeneratorConfig) {
    this.config = {
      ...config,
      radialGradientParams:
        config.radialGradientParams || DEFAULT_RADIAL_PARAMS,
      resourceConfigs: config.resourceConfigs || DEFAULT_RESOURCE_CONFIGS,
    };

    // Store thresholds
    this.moistureThresholds = config.moistureThresholds || {};
    this.temperatureThresholds = config.temperatureThresholds || {};
    this.resourceConfigs =
      this.config.resourceConfigs || DEFAULT_RESOURCE_CONFIGS;

    // Create noise generators for elevation and moisture
    this.elevationNoise = createElevationNoise(
      config.seed,
      config.elevationOctaves
    );
    this.moistureNoise = createMoistureNoise(
      config.seed,
      config.moistureOctaves
    );

    // Initialize resource noise generators
    this.resourceNoise = this.initializeResourceNoise(config.seed);

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
   * Initialize noise generators for each resource type
   */
  private initializeResourceNoise(
    seed: number
  ): Record<ResourceType, OctaveNoise> {
    const resourceNoise: Record<ResourceType, OctaveNoise> = {} as Record<
      ResourceType,
      OctaveNoise
    >;

    // Create a noise generator for each resource type with different seed offsets
    Object.entries(this.resourceConfigs).forEach(
      ([resourceType, config], index) => {
        const resourceSeed = seed + 3000 + index * 100; // Ensure unique seeds for each resource
        const octaveCount = config.noiseOctaves || 3;

        const noise = new OctaveNoise({
          seed: resourceSeed,
          octaveCount,
          scale: config.noiseScale || 200,
          persistence: config.noisePersistence || 0.5,
        });

        resourceNoise[resourceType as ResourceType] = noise;
      }
    );

    return resourceNoise;
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
    if (newConfig.resourceConfigs) {
      this.resourceConfigs = newConfig.resourceConfigs;
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

      // Recreate resource noise generators
      this.resourceNoise = this.initializeResourceNoise(this.config.seed);

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

    // Update resource configurations if provided
    if (newConfig.resourceConfigs) {
      // Recreate any modified resource noise generators
      Object.entries(newConfig.resourceConfigs).forEach(
        ([resourceType, config]) => {
          const resourceTypeEnum = resourceType as ResourceType;
          if (
            config.noiseScale !==
              this.resourceConfigs[resourceTypeEnum]?.noiseScale ||
            config.noiseOctaves !==
              this.resourceConfigs[resourceTypeEnum]?.noiseOctaves ||
            config.noisePersistence !==
              this.resourceConfigs[resourceTypeEnum]?.noisePersistence
          ) {
            this.resourceNoise[resourceTypeEnum].updateParams({
              scale: config.noiseScale,
              persistence: config.noisePersistence,
            });

            // If octaves changed, need to recreate the noise generator
            if (
              config.noiseOctaves !==
              this.resourceConfigs[resourceTypeEnum]?.noiseOctaves
            ) {
              const resourceSeed =
                this.config.seed +
                3000 +
                Object.keys(ResourceType).indexOf(resourceType) * 100;
              this.resourceNoise[resourceTypeEnum] = new OctaveNoise({
                seed: resourceSeed,
                octaveCount: config.noiseOctaves,
                scale: config.noiseScale,
                persistence: config.noisePersistence,
              });
            }
          }
        }
      );
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
   * Get resources for a specific location
   */
  getResources(
    x: number,
    y: number,
    biomeType: BiomeType,
    elevation: number,
    moisture: number,
    temperature: number
  ): Partial<Record<ResourceType, ResourceData>> {
    const resources: Partial<Record<ResourceType, ResourceData>> = {};

    if (biomeType === BiomeType.OCEAN_DEEP) {
      return resources; // No resources in deep ocean
    }

    // Check each resource type
    Object.entries(this.resourceConfigs).forEach(([resourceType, config]) => {
      const type = resourceType as ResourceType;

      // Check if the biome is compatible with this resource
      const isValidBiome =
        !config.biomeTypes || config.biomeTypes.includes(biomeType);

      // Check if elevation is in range
      const [minElevation, maxElevation] = config.elevationRange;
      const isValidElevation =
        elevation >= minElevation && elevation <= maxElevation;

      // Check if moisture is in range
      const [minMoisture, maxMoisture] = config.moistureRange;
      const isValidMoisture =
        moisture >= minMoisture && moisture <= maxMoisture;

      // Check if temperature is in range
      const [minTemp, maxTemp] = config.temperatureRange;
      const isValidTemperature =
        temperature >= minTemp && temperature <= maxTemp;

      if (
        isValidBiome &&
        isValidElevation &&
        isValidMoisture &&
        isValidTemperature
      ) {
        // Get the resource noise value at this location
        const noiseValue = this.resourceNoise[type].get(x, y);

        // Calculate resource density using the noise value
        const density = Math.pow(noiseValue, 1.3); // Non-linear scaling for more clustered resources

        // Only add the resource if its density exceeds the base threshold
        if (density > config.baseDensity) {
          // Generate deposit size using a different noise scale
          const depositSizeValue = this.resourceNoise[type].get(
            x * 0.1,
            y * 0.1
          );
          const depositSize = Math.floor(depositSizeValue * 10) + 1; // 1-10 range

          resources[type] = {
            type,
            density,
            depositSize,
          };
        }
      }
    });

    return resources;
  }

  /**
   * Get comprehensive biome data for a specific location
   */
  getBiomeData(x: number, y: number): BiomeData {
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
   * Get the biome type at the specified world coordinates
   */
  getBiome(x: number, y: number): BiomeType {
    const data = this.getBiomeData(x, y);
    return getBiomeType(data);
  }

  /**
   * Get complete tile data for the specified world coordinates
   */
  getTile(x: number, y: number): WorldTile {
    const elevation = this.getElevation(x, y);
    const moisture = this.getMoisture(x, y);
    const temperature = this.getTemperature(x, y, elevation);
    const biomeData = this.getBiomeData(x, y);
    const biomeType = getBiomeType(biomeData);
    const resources = this.getResources(
      x,
      y,
      biomeType,
      elevation,
      moisture,
      temperature
    );

    // Use the biome map to determine the base color
    const color = getBiomeColor(biomeType);

    return {
      x,
      y,
      elevation,
      moisture,
      temperature,
      biomeType,
      color,
      resources,
    };
  }

  /**
   * Get the color for a tile based on the visualization mode
   */
  getColorForMode(x: number, y: number, mode: VisualizationMode): RGB {
    switch (mode) {
      case VisualizationMode.ELEVATION:
        const elevation = this.getElevation(x, y);
        return getElevationColor(elevation);

      case VisualizationMode.MOISTURE:
        const moisture = this.getMoisture(x, y);
        return getMoistureColor(moisture);

      case VisualizationMode.TEMPERATURE:
        const elevationForTemp = this.getElevation(x, y);
        const temperature = this.getTemperature(x, y, elevationForTemp);
        return getTemperatureColor(temperature);

      case VisualizationMode.NOISE:
        // Just use elevation noise for testing
        const noiseValue = this.elevationNoise.get(x, y);
        const noiseColor = Math.floor(noiseValue * 255);
        return { r: noiseColor, g: noiseColor, b: noiseColor };

      case VisualizationMode.RESOURCES:
        // Show resources as colored overlays
        const tile = this.getTile(x, y);
        // If no resources, show biome color at reduced intensity
        if (Object.keys(tile.resources).length === 0) {
          return {
            r: Math.floor(tile.color.r * 0.5),
            g: Math.floor(tile.color.g * 0.5),
            b: Math.floor(tile.color.b * 0.5),
          };
        }

        // Find the most dominant resource (highest density)
        let dominantResource: ResourceType | null = null;
        let highestDensity = 0;

        Object.entries(tile.resources).forEach(([resourceType, data]) => {
          if (data && data.density > highestDensity) {
            dominantResource = resourceType as ResourceType;
            highestDensity = data.density;
          }
        });

        // Return the color for that resource
        if (dominantResource !== null) {
          // Use type assertion since we know this is a valid resource type
          const resourceConfig = this.resourceConfigs[
            dominantResource as keyof typeof this.resourceConfigs
          ] as ResourceConfig;
          const resourceColor = resourceConfig.color;

          // Adjust brightness based on density
          const densityFactor = highestDensity * 1.5; // Amplify the effect
          const intensity = Math.min(1.0, 0.5 + densityFactor);

          return {
            r: Math.floor(resourceColor.r * intensity),
            g: Math.floor(resourceColor.g * intensity),
            b: Math.floor(resourceColor.b * intensity),
          };
        }

        // Fallback to biome color
        return tile.color;

      case VisualizationMode.BIOME:
      default:
        const biomeType = this.getBiome(x, y);
        return getBiomeColor(biomeType);
    }
  }

  /**
   * Get debug information for a specific tile
   */
  getDebugInfo(x: number, y: number): string {
    const tile = this.getTile(x, y);
    const biomeTypeName = BiomeType[tile.biomeType];

    // Build a list of resources present
    const resourceList = Object.entries(tile.resources)
      .map(([type, data]) => {
        if (data) {
          return `${this.resourceConfigs[type as ResourceType].name} (${(
            data.density * 100
          ).toFixed(1)}%)`;
        }
        return "";
      })
      .filter((item) => item !== "")
      .join(", ");

    return `Pos: (${x}, ${y})
Elevation: ${tile.elevation.toFixed(2)}
Moisture: ${tile.moisture.toFixed(2)}
Temperature: ${tile.temperature.toFixed(2)}
Biome: ${biomeTypeName}
${resourceList ? `Resources: ${resourceList}` : ""}`;
  }
}
