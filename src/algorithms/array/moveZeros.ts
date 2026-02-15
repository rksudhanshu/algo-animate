import type { ArrayState } from "../types";

// Two-pointer: keep a "write" pointer (nz) for next non-zero position
export function moveZerosStates(input: number[]): ArrayState[] {
  const frames: ArrayState[] = [];
  let arr = input.slice();

  let comparisons = 0;
  let swaps = 0;

  let nz = 0;

  frames.push({
    array: arr,
    message: "Start: Move Zeros to the end (stable relative order of non-zeros).",
    line: 1,
    vars: { nz },
    metrics: { comparisons, swaps },
  });

  for (let i = 0; i < arr.length; i++) {
    comparisons += 1;

    frames.push({
      array: arr,
      highlight: [i, nz],
      message: `Check a[${i}]=${arr[i]}. If it's non-zero, swap into position nz=${nz}.`,
      line: 2,
      vars: { i, nz },
      metrics: { comparisons, swaps },
    });

    if (arr[i] !== 0) {
      if (i !== nz) {
        const a = arr.slice();
        [a[nz], a[i]] = [a[i], a[nz]];
        arr = a;
        swaps += 1;

        frames.push({
          array: arr,
          highlight: [i, nz],
          swap: [nz, i],
          message: `Swap non-zero into front: swap a[${nz}] and a[${i}].`,
          line: 3,
          vars: { i, nz },
          metrics: { comparisons, swaps },
        });
      } else {
        frames.push({
          array: arr,
          highlight: [i],
          message: `Already in correct place (i==nz).`,
          line: 4,
          vars: { i, nz },
          metrics: { comparisons, swaps },
        });
      }
      nz++;
    }
  }

  frames.push({
    array: arr,
    message: "Done: all zeros moved to the end.",
    line: 5,
    vars: { nz },
    metrics: { comparisons, swaps },
  });

  return frames;
}
