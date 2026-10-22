// A quiet notice for a section that could not load. The role makes it announce itself.
export const LoadError = ({ message }: { message: string }) => (
  <p
    role="alert"
    className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-gray-800"
  >
    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
    <span>{message}</span>
  </p>
);
