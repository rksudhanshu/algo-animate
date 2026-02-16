import type { ArrayState } from "../types";

export function binarySearchStates(sortedInput: number[], target: number): ArrayState[] {
  const frames: ArrayState[] = [];
  const arr = sortedInput.slice();

  let low = 0;
  let high = arr.length - 1;

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  frames.push({
    array: arr.slice(),
    highlight: arr.length ? [0, arr.length - 1] : [],
    message: `Start Binary Search for target=${target}. (Array must be sorted.)`,
    comparisons,
    swaps,
    passes,
    writes,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    comparisons += 1;

    frames.push({
      array: arr.slice(),
      highlight: [low, mid, high].filter((i) => i >= 0 && i < arr.length),
      comparing: [mid],
      message: `Compute mid=${mid} (low=${low}, high=${high}). Compare a[mid]=${arr[mid]} with target=${target}.`,
      comparisons,
      swaps,
      passes,
      writes,
    });

    if (arr[mid] === target) {
      frames.push({
        array: arr.slice(),
        highlight: [mid],
        sortedIndices: [mid],
        message: `✅ Found target at index ${mid}.`,
        comparisons,
        swaps,
        passes,
        writes,
      });
      return frames;
    }

    passes += 1;

    if (arr[mid] < target) {
      low = mid + 1;

      frames.push({
        array: arr.slice(),
        highlight: [low, high].filter((i) => i >= 0 && i < arr.length),
        message: `a[mid] < target → discard left half. New low=${low}.`,
        comparisons,
        swaps,
        passes,
        writes,
      });
    } else {
      high = mid - 1;

      frames.push({
        array: arr.slice(),
        highlight: [low, high].filter((i) => i >= 0 && i < arr.length),
        message: `a[mid] > target → discard right half. New high=${high}.`,
        comparisons,
        swaps,
        passes,
        writes,
      });
    }
  }

  frames.push({
    array: arr.slice(),
    highlight: [],
    message: `❌ Not found: target=${target} is not in the array.`,
    comparisons,
    swaps,
    passes,
    writes,
  });

  return frames;
}
