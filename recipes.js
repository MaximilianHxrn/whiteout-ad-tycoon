// Defines crafting/processing recipes for stations.
export const RECIPES = {
  cookhouse: {
    inputs: { rawMeat: 2, wood: 1 },
    outputs: { processedMeat: 1 },
    time: 4, // seconds
  },
  refinery: {
    inputs: { crudeOil: 2 },
    outputs: { diesel: 1 },
    time: 5,
  },
};