// src/algorithms/types.ts

export interface ArrayState {
  array: number[];

  // Visual helpers (optional)
  highlight?: number[];      // indices to highlight
  activeIndices?: number[];  // indices currently active
  comparing?: number[];      // indices being compared
  swapped?: number[];        // indices swapped
  sortedIndices?: number[];  // indices considered sorted/final

  // UI text
  message?: string;

  // Live counters (optional)
  comparisons?: number;
  swaps?: number;
  passes?: number;
  writes?: number;
}
