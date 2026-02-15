import type { ArrayState } from "../types";

export function bubbleSortSteps(input: number[]): ArrayState[] {
  const arr = [...input];
  const steps: ArrayState[] = [];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  steps.push({
    array: [...arr],
    message: "Starting Bubble Sort",
    comparisons,
    swaps,
    passes,
    writes,
  });

  const n = arr.length;
  const sortedIdx: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    passes++;

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;

      steps.push({
        array: [...arr],
        highlight: [j, j + 1],
        sorted: [...sortedIdx],
        comparisons,
        swaps,
        passes,
        writes,
        message: `Compare a[${j}] = ${arr[j]} and a[${j + 1}] = ${arr[j + 1]}`,
      });

      if (arr[j] > arr[j + 1]) {
        swaps++;
        writes += 2;

        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        steps.push({
          array: [...arr],
          swap: [j, j + 1],
          highlight: [j, j + 1],
          sorted: [...sortedIdx],
          comparisons,
          swaps,
          passes,
          writes,
          message: `Out of order → Swap`,
        });
      }
    }

    const fixed = n - i - 1;
    sortedIdx.unshift(fixed);

    steps.push({
      array: [...arr],
      sorted: [...sortedIdx],
      comparisons,
      swaps,
      passes,
      writes,
      message: `Pass ${passes} complete → Largest element fixed at index ${fixed}`,
    });
  }

  if (n > 0 && !sortedIdx.includes(0)) sortedIdx.unshift(0);

  steps.push({
    array: [...arr],
    sorted: [...Array(n).keys()],
    comparisons,
    swaps,
    passes,
    writes,
    message: "Array sorted successfully (Bubble Sort)",
  });

  return steps;
}
