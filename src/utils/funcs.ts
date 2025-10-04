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

export const getLocalISODateTime = (date: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
