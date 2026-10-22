// Shown on a natal chart whose birth time is unknown. The chart is calculated for noon, so
// the parts that depend on the exact time are left out and this says why.
export const BirthTimeNotice = () => (
  <p className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-700">
    Birth time unknown. This chart is calculated for noon, so the Ascendant, Midheaven and houses are
    not shown.
  </p>
);
