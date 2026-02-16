import type { ArrayState } from "../types";

export function bubbleSortSteps(input: number[]): ArrayState[] {
  const a = input.slice();
  const steps: ArrayState[] = [];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  const n = a.length;
  const sortedIndices: number[] = [];

  steps.push({
    array: a.slice(),
    message: "Start Bubble Sort: compare adjacent items and swap if they are out of order.",
    comparisons,
    swaps,
    passes,
    writes,
    sortedIndices: sortedIndices.slice(),
  });

  for (let pass = 0; pass < n - 1; pass++) {
    let didSwap = false;

    for (let j = 0; j < n - 1 - pass; j++) {
      comparisons += 1;

      steps.push({
        array: a.slice(),
        comparing: [j, j + 1],
        highlight: [j, j + 1],
        message: `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}.`,
        comparisons,
        swaps,
        passes,
        writes,
        sortedIndices: sortedIndices.slice(),
      });

      if (a[j] > a[j + 1]) {
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;

        swaps += 1;
        writes += 2;
        didSwap = true;

        steps.push({
          array: a.slice(),
          swapped: [j, j + 1],
          highlight: [j, j + 1],
          message: `swapped: because ${a[j]} should come before ${a[j + 1]}.`,
          comparisons,
          swaps,
          passes,
          writes,
          sortedIndices: sortedIndices.slice(),
        });
      }
    }

    passes += 1;

    // element at (n - 1 - pass) is now fixed
    const fixed = n - 1 - pass;
    if (!sortedIndices.includes(fixed)) sortedIndices.unshift(fixed);

    steps.push({
      array: a.slice(),
      sortedIndices: sortedIndices.slice(),
      message: `Pass ${pass + 1} complete. Index ${fixed} is now fixed (sorted region grows from the right).`,
      comparisons,
      swaps,
      passes,
      writes,
    });

    if (!didSwap) {
      // Already sorted — mark all remaining indices as sorted
      const remaining = Array.from({ length: fixed }, (_, k) => k);
      const allSorted = Array.from(new Set([...remaining, ...sortedIndices])).sort((x, y) => x - y);

      steps.push({
        array: a.slice(),
        sortedIndices: allSorted,
        message: "No swaps in this pass → the array is already sorted. ✅",
        comparisons,
        swaps,
        passes,
        writes,
      });

      return steps;
    }
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
