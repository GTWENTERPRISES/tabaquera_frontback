export function formatDuration(minutes?: number) {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  }
  return `${mins}m`;
}

export function formatLiveTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const displayMins = mins % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${displayMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${displayMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
