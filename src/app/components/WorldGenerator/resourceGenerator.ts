/**
 * resourceGenerator.ts
 *
 * Handles the generation and placement of resources in the world map.
 * Uses multiple noise functions and biome-based constraints to create
 * realistic and logical resource distribution.
 */

import { BiomeType, VisualizationMode, RGB } from "./config";
import { OctaveNoise, createElevationNoise } from "./octaveNoise";
import { WorldTile } from "./worldGenerator";

// Resource types available in the world
export enum ResourceType {
  NONE = 0,
  COAL = 1,
  IRON = 2,
  COPPER = 3,
  OIL = 4,
  GOLD = 5,
  SILVER = 6,
  GAS = 7,
}

// Resource colors for visualization
export const RESOURCE_COLORS: { [key in ResourceType]: RGB } = {
  [ResourceType.NONE]: { r: 0, g: 0, b: 0 },
  [ResourceType.COAL]: { r: 40, g: 40, b: 40 }, // Dark gray
  [ResourceType.IRON]: { r: 180, g: 90, b: 40 }, // Rust brown
  [ResourceType.COPPER]: { r: 184, g: 115, b: 51 }, // Copper brown
  [ResourceType.OIL]: { r: 20, g: 20, b: 30 }, // Dark blue-black
  [ResourceType.GOLD]: { r: 255, g: 215, b: 0 }, // Bright gold
  [ResourceType.SILVER]: { r: 220, g: 220, b: 225 }, // Light silver
  [ResourceType.GAS]: { r: 120, g: 230, b: 250 }, // Light blue
};

// Configuration for resource generation
export interface ResourceGeneratorConfig {
  seed: number;
  resourceScale: number;
  resourceDensity: number;
  resourceOctaves: number;
  resourcePersistence: number;
}

// Default configuration values
const DEFAULT_RESOURCE_CONFIG: ResourceGeneratorConfig = {
  seed: 12345,
  resourceScale: 180, // Scale of resource noise (higher = larger resource patches)
  resourceDensity: 0.35, // Overall density of resources (0-1) - increased for more common resources
  resourceOctaves: 3, // Number of octaves for resource noise - decreased for better distribution
  resourcePersistence: 0.6, // Persistence for resource noise - increased for more natural distribution
};

/**
 * Class that handles resource generation and placement
 */
export class ResourceGenerator {
  private resourceNoiseMap: { [key in ResourceType]?: OctaveNoise } = {};
  private config: ResourceGeneratorConfig;

  /**
   * Create a new resource generator
   */
  constructor(config: Partial<ResourceGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_RESOURCE_CONFIG, ...config };
    this.initializeResourceNoise();
  }

  /**
   * Initialize noise generators for each resource type
   */
  private initializeResourceNoise(): void {
    // Create a separate noise generator for each resource type
    // Use different seed offsets for each resource
    const resources = [
      ResourceType.COAL,
      ResourceType.IRON,
      ResourceType.COPPER,
      ResourceType.OIL,
      ResourceType.GOLD,
      ResourceType.SILVER,
      ResourceType.GAS,
    ];

    resources.forEach((resource, index) => {
      // Use different seed offset for each resource type
      const resourceSeed = this.config.seed + index * 1000;

      this.resourceNoiseMap[resource] = createElevationNoise(
        resourceSeed,
        this.config.resourceOctaves
      );

      // Configure noise parameters
      this.resourceNoiseMap[resource]?.updateParams({
        scale: this.config.resourceScale,
        persistence: this.config.resourcePersistence,
      });
    });
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<ResourceGeneratorConfig>): void {
    const oldSeed = this.config.seed;

    // Update config with new values
    this.config = { ...this.config, ...newConfig };

    // If seed changed, reinitialize all noise generators
    if (newConfig.seed !== undefined && newConfig.seed !== oldSeed) {
      this.initializeResourceNoise();
      return;
    }

    // Otherwise just update parameters of existing noise generators
    Object.values(this.resourceNoiseMap).forEach((noise) => {
      if (noise) {
        noise.updateParams({
          scale: this.config.resourceScale,
          persistence: this.config.resourcePersistence,
        });
      }
    });
  }

  /**
   * Check if a resource can spawn in a given biome
   */
  private canResourceSpawnInBiome(
    resource: ResourceType,
    biome: BiomeType
  ): boolean {
    // Define which biomes can contain which resources
    switch (resource) {
      case ResourceType.COAL:
        // Coal can be found in various land biomes - widespread
        return [
          // Mountain areas
          BiomeType.BARE,
          BiomeType.SCORCHED,
          BiomeType.TUNDRA,
          // Forests
          BiomeType.TEMPERATE_DECIDUOUS_FOREST,
          BiomeType.TAIGA,
          BiomeType.TROPICAL_RAINFOREST,
          // Hills/Grasslands
          BiomeType.SHRUBLAND,
          BiomeType.GRASSLAND,
          BiomeType.TEMPERATE_GRASSLAND,
          // Cold areas
          BiomeType.SNOW,
        ].includes(biome);

      case ResourceType.IRON:
        // Iron is common in mountains and hills
        return [
          // Mountain areas
          BiomeType.BARE,
          BiomeType.SCORCHED,
          BiomeType.SNOW,
          // Colder regions
          BiomeType.TAIGA,
          BiomeType.TUNDRA,
          BiomeType.SNOW,
          // Hills and grasslands
          BiomeType.SHRUBLAND,
          BiomeType.TEMPERATE_GRASSLAND,
          BiomeType.GRASSLAND,
          // Some forests
          BiomeType.TEMPERATE_DECIDUOUS_FOREST,
        ].includes(biome);

      case ResourceType.COPPER:
        // Copper found in mountains and dry areas
        return [
          // Mountain areas
          BiomeType.BARE,
          BiomeType.SCORCHED,
          // Desert/dry areas
          BiomeType.SUBTROPICAL_DESERT,
          BiomeType.TEMPERATE_DESERT,
          // Hills and grasslands
          BiomeType.SHRUBLAND,
          BiomeType.TEMPERATE_GRASSLAND,
          BiomeType.GRASSLAND,
          // Some forests
          BiomeType.TROPICAL_SEASONAL_FOREST,
          BiomeType.TROPICAL_RAINFOREST,
        ].includes(biome);

      case ResourceType.OIL:
        // Oil found in deserts, beaches and shallow waters
        return [
          // Desert regions
          BiomeType.SUBTROPICAL_DESERT,
          BiomeType.TEMPERATE_DESERT,
          // Coastal areas
          BiomeType.BEACH,
          BiomeType.ROCKY_SHORE,
          // Waters
          BiomeType.OCEAN_SHALLOW,
          BiomeType.OCEAN_MEDIUM,
          // Some grasslands
          BiomeType.GRASSLAND,
          BiomeType.SHRUBLAND,
        ].includes(biome);

      case ResourceType.GOLD:
        // Gold rare, found in mountains and rivers
        return [
          // Mountain areas (primary source)
          BiomeType.BARE,
          BiomeType.SCORCHED,
          BiomeType.SNOW,
          // Forested areas (secondary deposits)
          BiomeType.TROPICAL_RAINFOREST,
          BiomeType.TEMPERATE_DECIDUOUS_FOREST,
          // River areas
          BiomeType.BEACH,
          // Some deserts
          BiomeType.SUBTROPICAL_DESERT,
        ].includes(biome);

      case ResourceType.SILVER:
        // Silver in mountains and some forested areas
        return [
          // Mountain areas (primary source)
          BiomeType.BARE,
          BiomeType.SCORCHED,
          BiomeType.SNOW,
          // Secondary sources
          BiomeType.TAIGA,
          BiomeType.TUNDRA,
          BiomeType.TEMPERATE_DECIDUOUS_FOREST,
          // Grasslands
          BiomeType.TEMPERATE_GRASSLAND,
          BiomeType.GRASSLAND,
        ].includes(biome);

      case ResourceType.GAS:
        // Natural gas in desert and swampy areas
        return [
          // Desert regions
          BiomeType.SUBTROPICAL_DESERT,
          BiomeType.TEMPERATE_DESERT,
          // Wet/swampy regions
          BiomeType.TROPICAL_RAINFOREST,
          BiomeType.TROPICAL_SEASONAL_FOREST,
          // Waters
          BiomeType.OCEAN_SHALLOW,
          BiomeType.OCEAN_MEDIUM,
          // Some grasslands
          BiomeType.SHRUBLAND,
        ].includes(biome);

      default:
        return false;
    }
  }

  /**
   * Get resource at a specific position
   */
  getResourceAt(x: number, y: number, tile: WorldTile): ResourceType {
    // If not on land, most places don't have resources (except OIL in shallow water)
    if (
      tile.biomeType === BiomeType.OCEAN_DEEP ||
      tile.biomeType === BiomeType.OCEAN_MEDIUM
    ) {
      return ResourceType.NONE;
    }

    // Check each resource type
    const resourceTypes = [
      ResourceType.COAL,
      ResourceType.IRON,
      ResourceType.COPPER,
      ResourceType.OIL,
      ResourceType.GOLD,
      ResourceType.SILVER,
      ResourceType.GAS,
    ];

    // Check biome compatibility and use noise to determine resource presence
    for (const resourceType of resourceTypes) {
      // Skip if this resource can't spawn in this biome
      if (!this.canResourceSpawnInBiome(resourceType, tile.biomeType)) {
        continue;
      }

      // Get the noise value for this resource at these coordinates
      const noise = this.resourceNoiseMap[resourceType];
      if (!noise) continue;

      const resourceValue = noise.get(x, y);

      // Resource thresholds - make valuable resources more rare
      const threshold = this.getResourceThreshold(resourceType, tile);

      if (resourceValue > threshold) {
        return resourceType;
      }
    }

    return ResourceType.NONE;
  }

  /**
   * Get the threshold for a resource to appear
   * Higher threshold = more rare
   */
  private getResourceThreshold(
    resource: ResourceType,
    tile: WorldTile
  ): number {
    // Base threshold - higher = more rare
    const baseThreshold = 1.0 - this.config.resourceDensity;

    // Adjust threshold based on resource type - more valuable resources are rarer
    switch (resource) {
      case ResourceType.COAL:
        return baseThreshold * 0.65; // Very common
      case ResourceType.IRON:
        return baseThreshold * 0.75; // Fairly common
      case ResourceType.COPPER:
        return baseThreshold * 0.82; // Moderate
      case ResourceType.OIL:
        return baseThreshold * 0.87; // Somewhat rare
      case ResourceType.GAS:
        return baseThreshold * 0.9; // Rare
      case ResourceType.SILVER:
        return baseThreshold * 0.93; // Very rare
      case ResourceType.GOLD:
        return baseThreshold * 0.95; // Extremely rare
      default:
        return baseThreshold;
    }
  }

  /**
   * Get the color for a resource type
   */
  getResourceColor(resource: ResourceType): RGB {
    return RESOURCE_COLORS[resource] || RESOURCE_COLORS[ResourceType.NONE];
  }

  /**
   * Get resource information as a string for debug display
   */
  getResourceInfo(resource: ResourceType): string {
    if (resource === ResourceType.NONE) {
      return "";
    }

    return `Resource: ${ResourceType[resource]}`;
  }
}

// Add the resource visualization mode
export const RESOURCE_VISUALIZATION_MODE = "resource";

// Export a function to get the color for a resource visualization
export function getResourceVisualizationColor(resource: ResourceType): RGB {
  // For visualization, make resources stand out more
  const color = { ...RESOURCE_COLORS[resource] }; // Clone the color object

  // Return darker color for no resource
  if (resource === ResourceType.NONE) {
    return { r: 30, g: 30, b: 30 };
  }

  // Enhance colors for visualization
  color.r = Math.min(255, color.r * 1.2);
  color.g = Math.min(255, color.g * 1.2);
  color.b = Math.min(255, color.b * 1.2);

  return color;
}
