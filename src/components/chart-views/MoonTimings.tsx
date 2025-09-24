import { useMoonTimings } from "../../hooks/timings/useMoonTimings";
import { DateChip, SignChip } from "../descriptions/Helpers";

export const MoonTimings = () => {
  const { loading, timings } = useMoonTimings();

  if (loading) return <div>Loading...</div>;

  const { ingresses = [] } = timings;

  const sortedIngresses = [...ingresses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Moon Timings</h2>

      {sortedIngresses.length === 0 ? (
        <div>No Moon ingresses in this period.</div>
      ) : (
        <div className="space-y-3">
          {sortedIngresses.map((ingress, i) => (
            <div
              key={i}
              className="p-3 border rounded-md shadow-sm flex justify-between items-center"
            >
              <DateChip date={ingress.date} />
              <span>Moon enters</span>
              <SignChip sign={ingress.sign} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
