const STYLES = {
  Playing: "bg-amber/15 text-amber",
  Finished: "bg-clear/15 text-clear",
  Backlog: "bg-slate2/20 text-slate2",
  Dropped: "bg-rust/15 text-rust",
};

const LABELS = {
  Playing: "Playing",
  Finished: "Finished",
  Backlog: "Backlog",
  Dropped: "Dropped",
};

export default function StatusStamp({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
