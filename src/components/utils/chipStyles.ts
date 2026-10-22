// One look for every chip: a rounded pill with a fill and border tinted from its colour.
// Interactive chips lift slightly on hover and show a clear focus ring.
export const CHIP_BASE =
  "inline-flex min-h-7 max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium leading-none text-gray-900 align-middle transition duration-150 ease-out";

export const CHIP_INTERACTIVE =
  "cursor-pointer hover:-translate-y-px hover:shadow-md active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

// A neutral chip for links and plain labels.
export const CHIP_NEUTRAL = "border-gray-200 bg-white text-gray-700";

// Fill and border from one colour. `#rrggbb` plus an alpha byte gives a soft tint.
export const chipTint = (color: string) => ({
  backgroundColor: `${color}1f`,
  borderColor: `${color}66`,
});
