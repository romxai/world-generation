/**
 * temperatureMapper.ts
 *
 * This module handles temperature calculations using a precomputed heat gradient
 * map to improve performance while maintaining realistic climate patterns.
 */

import {
  WORLD_GRID_HEIGHT,
  WORLD_GRID_WIDTH,
  TemperatureParams,
  DEFAULT_TEMPERATURE_PARAMS,
  TEMPERATURE_ZONES,
} from "./config";
import { OctaveNoise } from "./octaveNoise";

/**
 * Class to handle temperature calculations with precomputed heat gradients
 */
export class TemperatureMapper {
  private readonly heatGradientMap: number[][];
  private readonly regionalVariations: OctaveNoise;
  private readonly params: TemperatureParams;

  /**
   * Initialize the temperature mapper with precomputed values
   */
  constructor(params: TemperatureParams = DEFAULT_TEMPERATURE_PARAMS) {
    this.params = {
      ...DEFAULT_TEMPERATURE_PARAMS,
      ...params,
    };

    // Generate the base heat gradient map (latitude-based)
    this.heatGradientMap = this.generateHeatGradientMap();

    // Create noise generator for regional temperature variations
    this.regionalVariations = new OctaveNoise({
      seed: this.params.noiseSeed || DEFAULT_TEMPERATURE_PARAMS.noiseSeed!,
      octaveCount:
        this.params.noiseOctaves || DEFAULT_TEMPERATURE_PARAMS.noiseOctaves!,
      scale: this.params.noiseScale || DEFAULT_TEMPERATURE_PARAMS.noiseScale!,
      persistence:
        this.params.noisePersistence ||
        DEFAULT_TEMPERATURE_PARAMS.noisePersistence!,
    });
  }

  /**
   * Generate a precomputed heat gradient map based on latitude
   */
  private generateHeatGradientMap(): number[][] {
    const map: number[][] = [];
    const {
      equatorPosition = 0.5,
      polarTemperature = 0.1,
      equatorTemperature = 0.9,
      bandScale = 1.0,
    } = this.params;

    for (let y = 0; y < WORLD_GRID_HEIGHT; y++) {
      map[y] = [];

      // Calculate normalized latitude (0 = south pole, 1 = north pole)
      const latitude = y / WORLD_GRID_HEIGHT;

      // Calculate distance from equator (0 = at equator, 1 = at pole)
      let distanceFromEquator =
        Math.abs(latitude - equatorPosition) /
        Math.max(equatorPosition, 1 - equatorPosition);

      // Apply band scaling - higher values make the bands narrower (more extreme temperatures)
      if (bandScale !== 1.0) {
        // Ensure distance stays in [0, 1] range
        distanceFromEquator = Math.pow(distanceFromEquator, 1 / bandScale);
      }

      // Temperature decreases as you move away from the equator (cosine pattern)
      const temperatureFactor = Math.cos((distanceFromEquator * Math.PI) / 2);

      // Calculate base temperature for this latitude (same for all x at this y)
      const baseTemperature =
        polarTemperature +
        temperatureFactor * (equatorTemperature - polarTemperature);

      // Store the same value for all x at this latitude
      for (let x = 0; x < WORLD_GRID_WIDTH; x++) {
        map[y][x] = baseTemperature;
      }
    }

    return map;
  }

  /**
   * Get the base temperature from the precomputed heat gradient map
   */
  getBaseTemperature(x: number, y: number): number {
    // Ensure coordinates are within the world grid bounds
    const boundedX = Math.max(0, Math.min(Math.floor(x), WORLD_GRID_WIDTH - 1));
    const boundedY = Math.max(
      0,
      Math.min(Math.floor(y), WORLD_GRID_HEIGHT - 1)
    );

    return this.heatGradientMap[boundedY][boundedX];
  }

  /**
   * Get regional temperature variation (smoothed noise value)
   */
  getRegionalVariation(x: number, y: number): number {
    // Get noise value (range roughly 0 to 1)
    const noise = this.regionalVariations.get(x, y);

    // Apply additional smoothing - implement a simple box blur by sampling neighboring points
    // This creates smoother transitions between different temperature regions
    let smoothedNoise = noise;

    // Only apply smoothing if we have more than 1 octave for performance reasons
    if (this.params.noiseOctaves && this.params.noiseOctaves > 1) {
      // Sample neighboring points and average them
      const samples = [
        noise,
        this.regionalVariations.get(x + 1, y),
        this.regionalVariations.get(x - 1, y),
        this.regionalVariations.get(x, y + 1),
        this.regionalVariations.get(x, y - 1),
      ];

      // Calculate average of samples (simple box blur)
      smoothedNoise =
        samples.reduce((sum, val) => sum + val, 0) / samples.length;
    }

    // Scale by temperature variance parameter and center around 0
    // Lower multiplier to reduce extreme temperature swings
    return (
      (smoothedNoise - 0.5) * (this.params.temperatureVariance || 0.08) * 1.6
    );
  }

  /**
   * Calculate final temperature by combining base heat, regional variations, and elevation
   */
  calculateTemperature(x: number, y: number, elevation: number): number {
    // Get base temperature from precomputed gradient map
    let temperature = this.getBaseTemperature(x, y);

    // Add regional variations (larger scale patterns)
    temperature += this.getRegionalVariation(x, y);

    // Higher elevation means colder temperature
    const elevationEffect = this.params.elevationEffect || 0.25;
    temperature -= elevation * elevationEffect;

    // Ensure temperature is in the valid range [0, 1]
    return Math.max(0, Math.min(1, temperature));
  }
}

/**
 * Get a color representation of a temperature value
 * @param temperature Temperature value (0-1)
 * @returns RGB color object
 */
export function getTemperatureColor(temperature: number): {
  r: number;
  g: number;
  b: number;
} {
  // Cold: Blue (0, 100, 255)
  // Mild: Green (0, 255, 0)
  // Hot: Red (255, 0, 0)

  let r, g, b;

  if (temperature < 0.25) {
    // Cold: Deep blue to lighter blue
    const t = temperature / 0.25;
    r = 0;
    g = Math.floor(100 + t * 100);
    b = 255;
  } else if (temperature < 0.5) {
    // Cool: Blue-green to green
    const t = (temperature - 0.25) / 0.25;
    r = 0;
    g = Math.floor(200 + t * 55);
    b = Math.floor(255 - t * 255);
  } else if (temperature < 0.75) {
    // Warm: Green to yellow
    const t = (temperature - 0.5) / 0.25;
    r = Math.floor(t * 255);
    g = 255;
    b = 0;
  } else {
    // Hot: Yellow to red
    const t = (temperature - 0.75) / 0.25;
    r = 255;
    g = Math.floor(255 - t * 255);
    b = 0;
  }

  return { r, g, b };
}

/**
 * Backward compatibility function for calculating temperature
 * Creates a temporary TemperatureMapper instance to compute the temperature
 */
export function calculateTemperature(
  x: number,
  y: number,
  elevation: number,
  params: TemperatureParams = DEFAULT_TEMPERATURE_PARAMS
): number {
  // Create a temporary mapper with the provided parameters
  const mapper = new TemperatureMapper(params);
  return mapper.calculateTemperature(x, y, elevation);
}
