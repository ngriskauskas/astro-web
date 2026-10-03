// The matrix always fits the width it is given: the columns share it equally, the
// cells are square, and the symbols scale with the matrix (cqw is a hundredth of the
// width of the container marked @container), up to their full size on wide screens.
export const MATRIX = "@container w-full max-w-[51rem]";
export const MATRIX_TABLE =
  "w-full table-fixed border-collapse border border-gray-300 text-center text-[length:clamp(0.5rem,3.4cqw,1.125rem)]";
export const MATRIX_CELL = "flex aspect-square w-full items-center justify-center";
