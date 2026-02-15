import type { ArrayState } from "../types";

export function insertionSortSteps(input: number[]): ArrayState[] {
  const arr = [...input];
  const steps: ArrayState[] = [];

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  steps.push({
    array: [...arr],
    message: "Starting Insertion Sort (left side stays sorted)",
    comparisons,
    swaps,
    passes,
    writes,
  });

  const n = arr.length;

  if (n > 0) {
    steps.push({
      array: [...arr],
      sorted: [0],
      comparisons,
      swaps,
      passes,
      writes,
      message: "Start: index 0 is sorted by definition",
    });
  }

  for (let i = 1; i < n; i++) {
    passes++;
    const key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      highlight: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
      comparisons,
      swaps,
      passes,
      writes,
      message: `Take key = a[${i}] = ${key}. Insert it into the sorted left side.`,
    });

    while (j >= 0) {
      comparisons++;

      steps.push({
        array: [...arr],
        highlight: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k),
        comparisons,
        swaps,
        passes,
        writes,
        message: `Compare key ${key} with a[${j}] = ${arr[j]}`,
      });

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        writes++;

        steps.push({
          array: [...arr],
          highlight: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => k),
          comparisons,
          swaps,
          passes,
          writes,
          message: `a[${j}] is bigger → shift it right to index ${j + 1}`,
        });

        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    writes++;

    steps.push({
      array: [...arr],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      comparisons,
      swaps,
      passes,
      writes,
      message: `Place key ${key} at index ${j + 1}. Left side (0..${i}) is now sorted.`,
    });
  }

  steps.push({
    array: [...arr],
    sorted: [...Array(n).keys()],
    comparisons,
    swaps,
    passes,
    writes,
    message: "Array sorted successfully (Insertion Sort)",
  });

  return steps;
}
