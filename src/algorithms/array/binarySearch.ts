import type { ArrayState } from "../types";

export function binarySearchStates(sortedInput: number[], target: number): ArrayState[] {
  const frames: ArrayState[] = [];
  const arr = sortedInput.slice();

  let low = 0;
  let high = arr.length - 1;
  let comparisons = 0;

  frames.push({
    array: arr,
    message: `Start Binary Search for target=${target}. (Array must be sorted.)`,
    line: 1,
    vars: { low, high },
    metrics: { comparisons },
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons += 1;

    frames.push({
      array: arr,
      highlight: [low, mid, high],
      message: `Compute mid = floor((low+high)/2) = ${mid}. Compare a[mid]=${arr[mid]} with target.`,
      line: 2,
      vars: { low, mid, high },
      metrics: { comparisons },
    });

    if (arr[mid] === target) {
      frames.push({
        array: arr,
        highlight: [mid],
        message: `Found target at index ${mid}.`,
        line: 3,
        vars: { low, mid, high },
        metrics: { comparisons },
      });
      return frames;
    }

    if (arr[mid] < target) {
      low = mid + 1;
      frames.push({
        array: arr,
        highlight: [low, high],
        message: `a[mid] < target, discard left half (including mid). New low=${low}.`,
        line: 4,
        vars: { low, mid, high },
        metrics: { comparisons },
      });
    } else {
      high = mid - 1;
      frames.push({
        array: arr,
        highlight: [low, high],
        message: `a[mid] > target, discard right half (including mid). New high=${high}.`,
        line: 5,
        vars: { low, mid, high },
        metrics: { comparisons },
      });
    }
  }

  frames.push({
    array: arr,
    message: "Not found: target is not in the array.",
    line: 6,
    metrics: { comparisons },
  });

  return frames;
}
