export default function Logo({ size = "md" }) {
  const dims = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} shrink-0 rounded-md bg-crimson flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path
            d="M6 9h12a4.2 4.2 0 0 1 4.2 4.3l.5 4a2.4 2.4 0 0 1-4.2 1.8L17 17H7l-1.5 2.1a2.4 2.4 0 0 1-4.2-1.8l.5-4A4.2 4.2 0 0 1 6 9Z"
            fill="#0D1220"
          />
          <rect x="7" y="11.5" width="1.8" height="5" rx="0.6" fill="#E4283C" />
          <rect x="5.1" y="13.4" width="5.6" height="1.8" rx="0.6" fill="#E4283C" />
          <circle cx="17.5" cy="12.5" r="1.1" fill="#E4283C" />
          <circle cx="15.3" cy="14.8" r="1.1" fill="#E4283C" />
        </svg>
      </div>
      <span className="font-logo leading-none -skew-x-6 inline-block">
        <span className="block text-mist-50 text-base tracking-wide">EDY'S</span>
        <span className="block text-crimson text-[11px] tracking-[0.15em] -mt-0.5">
          GAME TRACKER
        </span>
      </span>
    </div>
  );
}
