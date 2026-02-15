import type { ArrayState } from "../types";

export function selectionSortSteps(input: number[]): ArrayState[] {
  const arr = [...input];
  const steps: ArrayState[] = [];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  steps.push({
    array: [...arr],
    message: "Starting Selection Sort (pick min from unsorted, grow sorted prefix)",
    comparisons,
    swaps,
    passes,
    writes,
  });

  const n = arr.length;
  const sortedPrefix: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    passes++;
    let minIdx = i;

    steps.push({
      array: [...arr],
      highlight: [i],
      sorted: [...sortedPrefix],
      comparisons,
      swaps,
      passes,
      writes,
      message: `Pass ${passes}: find the minimum from indices ${i}..${n - 1}`,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;

      steps.push({
        array: [...arr],
        highlight: [minIdx, j],
        sorted: [...sortedPrefix],
        comparisons,
        swaps,
        passes,
        writes,
        message: `Compare current min a[${minIdx}] = ${arr[minIdx]} with a[${j}] = ${arr[j]}`,
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;

        steps.push({
          array: [...arr],
          highlight: [minIdx],
          sorted: [...sortedPrefix],
          comparisons,
          swaps,
          passes,
          writes,
          message: `New minimum found at index ${minIdx} (value ${arr[minIdx]})`,
        });
      }
    }

    if (minIdx !== i) {
      swaps++;
      writes += 2;
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];

      steps.push({
        array: [...arr],
        swap: [i, minIdx],
        highlight: [i, minIdx],
        sorted: [...sortedPrefix],
        comparisons,
        swaps,
        passes,
        writes,
        message: `Swap min into position i=${i}`,
      });
    } else {
      steps.push({
        array: [...arr],
        highlight: [i],
        sorted: [...sortedPrefix],
        comparisons,
        swaps,
        passes,
        writes,
        message: `Index ${i} already has the minimum. No swap.`,
      });
    }

    sortedPrefix.push(i);

    steps.push({
      array: [...arr],
      sorted: [...sortedPrefix],
      comparisons,
      swaps,
      passes,
      writes,
      message: `Sorted prefix grows: indices 0..${i} are sorted`,
    });
  }

  if (n > 0) sortedPrefix.push(n - 1);

  steps.push({
    array: [...arr],
    sorted: [...Array(n).keys()],
    comparisons,
    swaps,
    passes,
    writes,
    message: "Array sorted successfully (Selection Sort)",
  });

  return steps;
}
