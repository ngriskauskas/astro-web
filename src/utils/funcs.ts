export const formatDegMin = (degMin: [number, number]) =>
  `${Math.round(degMin[0])}° ${Math.round(degMin[1])}′`;

export const getLocalISODate = () => {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
};

export const getLocalISOTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
};
