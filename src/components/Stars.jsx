export default function Stars({ value, onChange, size = "text-sm", readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex gap-0.5 ${size}`}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(s === value ? 0 : s)}
          className={`${
            s <= value ? "text-amber" : "text-ink-600"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:text-amber/70"} leading-none`}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
