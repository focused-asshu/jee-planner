export const formatStudyTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0));
  const totalMinutes = Math.floor(safeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${safeSeconds % 60}s`;
};
