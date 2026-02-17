// src/algorithms/types.ts

export interface ArrayState {
  array: number[];

  // -------- Visual helpers (new, preferred) --------
  highlight?: number[];      // indices to highlight
  activeIndices?: number[];  // indices currently active
  comparing?: number[];      // indices being compared
  swapped?: number[];        // indices swapped
  sortedIndices?: number[];  // indices considered sorted/final

  // -------- Backward-compat (older step generators) --------
  // Keep these so any leftover older algorithm frames don't break tsc -b.
  swap?: number[];           // old name for swapped
  sorted?: number[];         // old name for sortedIndices
  line?: number;             // old teaching field
  vars?: Record<string, unknown>; // old teaching field
  metrics?: {
    comparisons?: number;
    swaps?: number;
    passes?: number;
    writes?: number;
  };

  // -------- UI text --------
  message?: string;

  // -------- Live counters (new, preferred) --------
  comparisons?: number;
  swaps?: number;
  passes?: number;
  writes?: number;
}
