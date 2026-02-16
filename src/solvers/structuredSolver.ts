import { algorithms } from "../algorithms/registry";

export type StructuredSolve =
  | {
      ok: true;
      algoId: string;
      algoName: string;
      inputArray: number[];
      target?: number;
      finalAnswerText: string;
      visualizePayload: { inputArray: number[]; target?: number };
    }
  | {
      ok: false;
      error: string;
      hints: string[];
    };

function extractBracketArray(text: string): number[] | null {
  // Accept: [1,2,3] OR [1 2 3] OR 1,2,3
  const m = text.match(/\[([^\]]+)\]/);
  let raw = m ? m[1] : text;

  // If brackets not found, try to find a run of numbers separated by commas/spaces
  // (but we keep it conservative: must contain at least 2 numbers)
  const nums = raw
    .replace(/[\n\r]/g, " ")
    .split(/[^-0-9.]+/g)
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));

  if (nums.length >= 2) return nums;
  return null;
}

function extractTarget(text: string): number | null {
  // target=25, target 25, find 25
  const m =
    text.match(/target\s*[:=]?\s*(-?\d+(\.\d+)?)/i) ||
    text.match(/find\s+(-?\d+(\.\d+)?)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function guessAlgorithmId(text: string): string | null {
  const t = text.toLowerCase();

  // Explicit keywords
  if (t.includes("bubble")) return "bubble-sort";
  if (t.includes("insertion")) return "insertion-sort";
  if (t.includes("selection")) return "selection-sort";
  if (t.includes("move zero") || t.includes("move zeros") || t.includes("zeros")) return "move-zeros";
  if (t.includes("binary search") || t.includes("binsearch") || t.includes("search")) return "binary-search";

  // If target exists and looks like searching intent, assume binary search
  const hasTarget = /target\s*[:=]?/i.test(text) || /find\s+\d+/i.test(text);
  if (hasTarget) return "binary-search";

  // Default: sorting
  return "insertion-sort";
}

export function solveStructured(problemText: string): StructuredSolve {
  const text = (problemText || "").trim();
  if (!text) {
    return {
      ok: false,
      error: "Paste a problem statement first.",
      hints: [
        "Examples:",
        "• Sort: [5,2,9,1]",
        "• Bubble sort [55, 12, 78, 45]",
        "• Binary search in [3,8,12,19,25] target 19",
        "• Move zeros [0,5,0,3,12]",
      ],
    };
  }

  const algoId = guessAlgorithmId(text);
  if (!algoId) {
    return {
      ok: false,
      error: "Could not determine which algorithm to use.",
      hints: ["Try including words like: bubble / insertion / selection / move zeros / binary search"],
    };
  }

  const arr = extractBracketArray(text);
  if (!arr) {
    return {
      ok: false,
      error: "Could not find an input array.",
      hints: ["Use format like: [5, 2, 9, 1] or: Sort this array: [5 2 9 1]"],
    };
  }

  const target = extractTarget(text);

  const algo = algorithms.find((a) => a.id === algoId);
  if (!algo) {
    return {
      ok: false,
      error: `Algorithm not found: ${algoId}`,
      hints: ["Check registry.ts includes this algorithm id."],
    };
  }

  // Produce final answer (simple + student friendly)
  if (algoId === "binary-search") {
    if (target === null) {
      return {
        ok: false,
        error: "Binary search needs a target value.",
        hints: ["Example: binary search in [3,8,12,19,25] target 19"],
      };
    }
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = sorted.indexOf(target);
    const foundText = idx >= 0 ? `Found ${target} at index ${idx} (0-based) in sorted array.` : `Not found: ${target}.`;

    return {
      ok: true,
      algoId,
      algoName: algo.name,
      inputArray: sorted,
      target,
      finalAnswerText: `Sorted array: [${sorted.join(", ")}]\n${foundText}`,
      visualizePayload: { inputArray: arr, target }, // we pass original, algorithm itself will sort internally
    };
  }

  if (algoId === "move-zeros") {
    const non = arr.filter((x) => x !== 0);
    const zeros = arr.filter((x) => x === 0);
    const out = [...non, ...zeros];
    return {
      ok: true,
      algoId,
      algoName: algo.name,
      inputArray: arr,
      finalAnswerText: `Result: [${out.join(", ")}]`,
      visualizePayload: { inputArray: arr },
    };
  }

  // Sorting algorithms
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    ok: true,
    algoId,
    algoName: algo.name,
    inputArray: arr,
    finalAnswerText: `sortedIndices: [${sorted.join(", ")}]`,
    visualizePayload: { inputArray: arr },
  };
}
