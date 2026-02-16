import type { ArrayState } from "../types";

export function selectionSortSteps(input: number[]): ArrayState[] {
  const a = input.slice();
  const steps: ArrayState[] = [];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  const n = a.length;

  steps.push({
    array: a.slice(),
    message: "Start Selection Sort: each pass selects the minimum from the unsorted region and swaps it into place.",
    comparisons,
    swaps,
    passes,
    writes,
    sortedIndices: [],
  });

  for (let i = 0; i < n; i++) {
    let minIdx = i;

    steps.push({
      array: a.slice(),
      highlight: [i],
      message: `Pass ${i + 1}: find the minimum in indices ${i}..${n - 1}.`,
      comparisons,
      swaps,
      passes,
      writes,
      sortedIndices: Array.from({ length: i }, (_, k) => k),
    });

    for (let j = i + 1; j < n; j++) {
      comparisons += 1;

      steps.push({
        array: a.slice(),
        comparing: [minIdx, j],
        highlight: [minIdx, j],
        message: `Compare current min a[${minIdx}]=${a[minIdx]} with a[${j}]=${a[j]}.`,
        comparisons,
        swaps,
        passes,
        writes,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
      });

      if (a[j] < a[minIdx]) {
        minIdx = j;

        steps.push({
          array: a.slice(),
          highlight: [minIdx],
          message: `New minimum found at index ${minIdx} (value ${a[minIdx]}).`,
          comparisons,
          swaps,
          passes,
          writes,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
        });
      }
    }

    if (minIdx !== i) {
      const tmp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = tmp;

      swaps += 1;
      writes += 2;

      steps.push({
        array: a.slice(),
        swapped: [i, minIdx],
        highlight: [i, minIdx],
        message: `Swap: place minimum into position ${i} (swap indices ${i} and ${minIdx}).`,
        comparisons,
        swaps,
        passes,
        writes,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
      });
    } else {
      steps.push({
        array: a.slice(),
        highlight: [i],
        message: `Index ${i} already contains the minimum. No swap needed.`,
        comparisons,
        swaps,
        passes,
        writes,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
      });
    }

    passes += 1;

    steps.push({
      array: a.slice(),
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      message: `Pass complete. Prefix (0..${i}) is sorted.`,
      comparisons,
      swaps,
      passes,
      writes,
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
