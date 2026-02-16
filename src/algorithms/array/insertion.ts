import type { ArrayState } from "../types";

export function insertionSortSteps(input: number[]): ArrayState[] {
  const a = input.slice();
  const steps: ArrayState[] = [];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  const n = a.length;

  steps.push({
    array: a.slice(),
    message:
      "Start Insertion Sort: the left part is kept sorted; each step inserts the next element into the correct position.",
    comparisons,
    swaps,
    passes,
    writes,
    sortedIndices: n > 0 ? [0] : [],
  });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;

    // left side (0..i-1) considered sorted at this moment
    steps.push({
      array: a.slice(),
      highlight: [i],
      activeIndices: [i],
      message: `Take key=a[${i}]=${key}. Insert it into the sorted region (0..${i - 1}).`,
      comparisons,
      swaps,
      passes,
      writes,
      sortedIndices: Array.from({ length: i }, (_, k) => k),
    });

    while (j >= 0) {
      comparisons += 1;

      steps.push({
        array: a.slice(),
        comparing: [j, j + 1],
        highlight: [j, j + 1],
        message: `Compare key=${key} with a[${j}]=${a[j]}. If a[j] > key, shift right.`,
        comparisons,
        swaps,
        passes,
        writes,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
      });

      if (a[j] > key) {
        a[j + 1] = a[j];
        writes += 1;

        steps.push({
          array: a.slice(),
          swapped: [j, j + 1], // used as a "movement" indicator
          highlight: [j, j + 1],
          message: `Shift: move a[${j}] to a[${j + 1}] to make space.`,
          comparisons,
          swaps,
          passes,
          writes,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
        });

        j--;
      } else {
        break;
      }
    }

    a[j + 1] = key;
    writes += 1;
    passes += 1;

    steps.push({
      array: a.slice(),
      highlight: [j + 1],
      message: `Place key=${key} at index ${j + 1}. Now (0..${i}) is sorted.`,
      comparisons,
      swaps,
      passes,
      writes,
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
    });
  }

  steps.push({
    array: a.slice(),
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    message: "Array sorted successfully. ✅",
    comparisons,
    swaps,
    passes,
    writes,
  });

  return steps;
}
