// src/algorithms/registry.ts

export type AlgorithmRegistryItem = {
  id: string;
  name: string;
  category: "Sorting" | "Searching" | "Other";
};

export type AlgoInfo = {
  id: string;
  name: string;
  category: "Sorting" | "Searching" | "Other";
  short: string;
  whenToUse: string[];
  complexity: { best: string; average: string; worst: string; space: string };
  stable?: boolean;
  inPlace?: boolean;
  notes?: string[];
};

export type LearnQuestionOption = {
  id: string;
  text: string;
  correct?: boolean;
  why?: string;
};

export type LearnQuestion = {
  id: string;
  prompt: string;
  options: LearnQuestionOption[];
  tip?: string;
};

// ✅ Keep these IDs exactly matching what your app currently uses
export const algorithms: AlgorithmRegistryItem[] = [
  { id: "bubble-sort", name: "Bubble Sort", category: "Sorting" },
  { id: "insertion-sort", name: "Insertion Sort", category: "Sorting" },
  { id: "selection-sort", name: "Selection Sort", category: "Sorting" },
  { id: "binary-search", name: "Binary Search", category: "Searching" },
];

// --- Algorithm Info Card metadata ---
export const algorithmInfoById: Record<string, AlgoInfo> = {
  "bubble-sort": {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "Sorting",
    short: "Repeatedly compares adjacent elements and swaps them if they are in the wrong order.",
    whenToUse: [
      "Teaching / learning (very visual and intuitive).",
      "Very small arrays where simplicity matters.",
      "When you want to illustrate swap operations clearly.",
    ],
    complexity: { best: "O(n) (already sorted)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    stable: true,
    inPlace: true,
    notes: [
      "Works by pushing the largest element to the end each pass.",
      "Inefficient for medium/large inputs (use better algorithms later).",
    ],
  },

  "insertion-sort": {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "Sorting",
    short: "Builds a sorted region on the left by inserting each new element into its correct position.",
    whenToUse: [
      "Small arrays or nearly sorted data.",
      "When you need a simple in-place algorithm.",
      "As a building block in hybrid sorts (conceptually).",
    ],
    complexity: { best: "O(n) (nearly sorted)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    stable: true,
    inPlace: true,
    notes: ["Very good when the array is almost sorted.", "Feels like sorting playing cards in your hand."],
  },

  "selection-sort": {
    id: "selection-sort",
    name: "Selection Sort",
    category: "Sorting",
    short: "Finds the minimum element from the unsorted region and swaps it into the next position in the sorted region.",
    whenToUse: [
      "Teaching (clear ‘pick minimum’ logic).",
      "When swap count needs to be small (still O(n²) comparisons).",
      "Very small lists where simplicity is important.",
    ],
    complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    stable: false,
    inPlace: true,
    notes: ["Always does ~n² comparisons, even if already sorted.", "Uses few swaps compared to Bubble."],
  },

  "binary-search": {
    id: "binary-search",
    name: "Binary Search",
    category: "Searching",
    short: "Searches a sorted array by repeatedly halving the search range.",
    whenToUse: [
      "Fast lookup in sorted arrays/lists.",
      "You can afford sorting once, then many searches.",
      "When you want logarithmic-time search.",
    ],
    complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
    stable: undefined,
    inPlace: undefined,
    notes: ["Requires sorted data.", "Each step cuts the search space in half."],
  },
};

// --- Learn Mode questions per algorithm ---
export const learnQuestionsById: Record<string, LearnQuestion[]> = {
  "bubble-sort": [
    {
      id: "b1",
      prompt: "In Bubble Sort, what is the key operation repeated many times?",
      options: [
        { id: "a", text: "Pick the smallest element and swap once per pass", why: "That’s Selection Sort, not Bubble Sort." },
        { id: "b", text: "Compare adjacent elements and swap if out of order", correct: true, why: "Exactly. Bubble Sort repeatedly compares neighbors and swaps them." },
        { id: "c", text: "Split array into halves and merge", why: "That describes Merge Sort." },
      ],
      tip: "Think: neighbors keep swapping until sorted.",
    },
    {
      id: "b2",
      prompt: "After the first full pass of Bubble Sort, what is guaranteed?",
      options: [
        { id: "a", text: "The smallest element is at index 0", why: "Not guaranteed. Bubble pushes the largest to the end per pass." },
        { id: "b", text: "The largest element is at the last position", correct: true, why: "Yes. The largest value ‘bubbles’ to the end in a full pass." },
        { id: "c", text: "Array becomes fully sorted", why: "Only if it was already sorted or nearly sorted." },
      ],
    },
    {
      id: "b3",
      prompt: "Why is Bubble Sort O(n²) in the worst case?",
      options: [
        { id: "a", text: "Because it always uses recursion", why: "Bubble Sort doesn’t need recursion." },
        { id: "b", text: "Because it does nested passes of comparisons", correct: true, why: "Correct. Roughly n passes × ~n comparisons per pass → ~n² operations." },
        { id: "c", text: "Because it uses extra memory", why: "Bubble Sort is O(1) space (in-place)." },
      ],
    },
  ],

  "insertion-sort": [
    {
      id: "i1",
      prompt: "Insertion Sort grows which region as it runs?",
      options: [
        { id: "a", text: "A sorted region on the left side", correct: true, why: "Yes. It keeps the left part sorted and inserts the next element into it." },
        { id: "b", text: "A sorted region on the right side", why: "Not typically. The common version grows sorted on the left." },
        { id: "c", text: "No region; it randomizes elements", why: "No—Insertion Sort builds order." },
      ],
      tip: "Like arranging playing cards in your hand.",
    },
    {
      id: "i2",
      prompt: "When is Insertion Sort fastest (best case)?",
      options: [
        { id: "a", text: "When the array is already sorted or nearly sorted", correct: true, why: "Exactly. Very few shifts needed → close to O(n)." },
        { id: "b", text: "When the array is reverse-sorted", why: "That’s worst-case (lots of shifts)." },
        { id: "c", text: "Always the same speed", why: "No, its time depends heavily on how sorted the input is." },
      ],
    },
    {
      id: "i3",
      prompt: "What is the main cost in Insertion Sort?",
      options: [
        { id: "a", text: "Shifting elements to make room", correct: true, why: "Correct. It often shifts a block of elements to insert one item." },
        { id: "b", text: "Building a heap", why: "That’s Heap Sort." },
        { id: "c", text: "Merging two sorted lists", why: "That’s Merge Sort." },
      ],
    },
  ],

  "selection-sort": [
    {
      id: "s1",
      prompt: "What does Selection Sort do in each pass?",
      options: [
        { id: "a", text: "Find the minimum in the unsorted region and swap it into place", correct: true, why: "Yes. One minimum selected per pass." },
        { id: "b", text: "Compare neighbors and swap many times", why: "That’s Bubble Sort." },
        { id: "c", text: "Insert next element into sorted region by shifting", why: "That’s Insertion Sort." },
      ],
    },
    {
      id: "s2",
      prompt: "Why is Selection Sort always O(n²) comparisons?",
      options: [
        { id: "a", text: "Because it must scan the remaining unsorted portion each pass", correct: true, why: "Correct. It always does a full scan to find the minimum." },
        { id: "b", text: "Because it uses recursion", why: "No recursion needed." },
        { id: "c", text: "Because it is unstable", why: "Stability is separate from time complexity." },
      ],
    },
    {
      id: "s3",
      prompt: "Selection Sort often has fewer swaps than Bubble Sort. Why?",
      options: [
        { id: "a", text: "It swaps at most once per pass", correct: true, why: "Right. One swap after selecting the minimum." },
        { id: "b", text: "It never swaps", why: "It swaps to place the minimum each pass." },
        { id: "c", text: "It uses extra memory to avoid swaps", why: "No, it is in-place." },
      ],
    },
  ],

  "binary-search": [
    {
      id: "bs1",
      prompt: "Binary Search requires what condition to be correct?",
      options: [
        { id: "a", text: "Array must be sorted", correct: true, why: "Correct. The halving logic only works on sorted data." },
        { id: "b", text: "Array must have unique values", why: "Not required. It still works (returns one matching index)." },
        { id: "c", text: "Array must be small", why: "No, it works great on large arrays." },
      ],
    },
    {
      id: "bs2",
      prompt: "Why is Binary Search O(log n)?",
      options: [
        { id: "a", text: "Because each step halves the search range", correct: true, why: "Exactly. n → n/2 → n/4 → … until 1." },
        { id: "b", text: "Because it checks every element once", why: "That’s linear search: O(n)." },
        { id: "c", text: "Because it sorts the array first", why: "Sorting is separate. Search itself is O(log n) once sorted." },
      ],
    },
    {
      id: "bs3",
      prompt: "If n increases from 10 to 1000, log2(n) grows from ~3 to ~10. What does that mean?",
      options: [
        { id: "a", text: "Binary Search becomes ~100× slower", why: "No—log grows slowly." },
        { id: "b", text: "Binary Search needs only a few more steps", correct: true, why: "Correct. Even huge n only adds a small number of extra comparisons." },
        { id: "c", text: "Binary Search stops working", why: "It still works; it remains efficient." },
      ],
      tip: "Logarithms grow very slowly—this is why Big-O matters.",
    },
  ],
};
