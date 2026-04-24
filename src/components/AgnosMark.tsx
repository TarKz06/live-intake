export default function AgnosMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-primary-ink text-white shadow-sm"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <path d="M8 2 L14 13 L2 13 Z" fill="currentColor" />
        <circle cx="8" cy="10" r="1.4" fill="#0d7d6f" />
      </svg>
    </span>
  );
}
