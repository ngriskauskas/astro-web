// The matrix fills the width it is given: the columns share it equally, the cells are square,
// and the symbols scale with the matrix (cqw is a hundredth of the width of the container
// marked @container), up to their full size on wide screens. On a phone the table is kept at
// least 38rem wide, so each cell stays a tappable size, and the matrix scrolls sideways inside
// its card instead of shrinking the cells below that.
export const MATRIX = "@container w-full max-w-[60rem] overflow-x-auto scroll-hint-x";
export const MATRIX_TABLE =
  "min-w-[38rem] w-full table-fixed border-collapse border border-gray-300 text-center text-[length:clamp(0.5rem,3.4cqw,1.125rem)] sm:min-w-0";
export const MATRIX_CELL = "flex aspect-square w-full items-center justify-center";
