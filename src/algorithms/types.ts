export type ArrayState = {
  array: number[];
  highlight?: number[];
  sorted?: number[];
  swap?: [number, number];

  // counters + narration (used by UI)
  comparisons?: number;
  swaps?: number;
  passes?: number;
  writes?: number;
  message?: string;
};
