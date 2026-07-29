const FILL_COLOR = {
  Playing: "#FFB74A",
  Finished: "#4ADE80",
  Backlog: "#6C7280",
  Dropped: "#EF5C5C",
};

export default function SaveBar({ progress, status, segments = 10 }) {
  const filledCount = Math.round((progress / 100) * segments);
  return (
    <div
      className="save-bar"
      style={{ "--seg": segments, "--fill": FILL_COLOR[status] }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={i < filledCount ? "filled" : ""} />
      ))}
    </div>
  );
}
