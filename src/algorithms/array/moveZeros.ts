import type { ArrayState } from "../types";

// Two-pointer: keep a "write" pointer (nz) for next non-zero position
export function moveZerosStates(input: number[]): ArrayState[] {
  const frames: ArrayState[] = [];
  let arr = input.slice();

  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let writes = 0;

  let nz = 0;

  frames.push({
    array: arr.slice(),
    message: "Start: Move Zeros to the end (stable relative order of non-zeros).",
    activeIndices: [nz],
    comparisons,
    swaps,
    passes,
    writes,
  });

  for (let i = 0; i < arr.length; i++) {
    comparisons += 1;

    frames.push({
      array: arr.slice(),
      highlight: [i, nz].filter((x) => x >= 0 && x < arr.length),
      comparing: [i],
      activeIndices: [nz],
      message: `Check a[${i}]=${arr[i]}. If it's non-zero, place it at position nz=${nz}.`,
      comparisons,
      swaps,
      passes,
      writes,
    });

    if (arr[i] !== 0) {
      if (i !== nz) {
        // swap a[nz] and a[i]
        const a = arr.slice();
        [a[nz], a[i]] = [a[i], a[nz]];
        arr = a;
        swaps += 1;
        writes += 2; // two assignments in a swap

        frames.push({
          array: arr.slice(),
          highlight: [i, nz].filter((x) => x >= 0 && x < arr.length),
          swapped: [nz, i],
          message: `Swap non-zero forward: swap a[${nz}] and a[${i}].`,
          comparisons,
          swaps,
          passes,
          writes,
        });
      } else {
        frames.push({
          array: arr.slice(),
          highlight: [i],
          message: `Already in correct place (i == nz).`,
          comparisons,
          swaps,
          passes,
          writes,
        });
      }

      nz += 1;

      frames.push({
        array: arr.slice(),
        activeIndices: [nz].filter((x) => x >= 0 && x < arr.length),
        message: `Advance nz → ${nz}. Next non-zero will be placed here.`,
        comparisons,
        swaps,
        passes,
        writes,
      });
    }
  }

  passes += 1;

  frames.push({
    array: arr.slice(),
    sortedIndices: Array.from({ length: arr.length }, (_, idx) => idx),
    message: "Done: all zeros moved to the end.",
    comparisons,
    swaps,
    passes,
    writes,
  });

  return frames;
}
