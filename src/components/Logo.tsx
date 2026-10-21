export function Logo({
  className = "",
  iconClass = "h-8 w-8",
  wordClass = "text-[26px]",
  light = false,
}: {
  className?: string;
  iconClass?: string;
  wordClass?: string;
  light?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className}`}>
      <svg viewBox="0 0 24 24" className={`${iconClass} shrink-0`} aria-hidden="true">
        <path
          fill="#117ACA"
          d="M0 15.415c0 .468.38.85.848.85h5.937V.575L0 7.72v7.695m15.416 8.582c.467 0 .846-.38.846-.849v-5.937H.573l7.146 6.785h7.697M24 8.587a.844.844 0 0 0-.847-.846h-5.938V23.43l6.782-7.148L24 8.586M8.585.003a.847.847 0 0 0-.847.847v5.94h15.688L16.282.003H8.585Z"
        />
      </svg>
      <span
        className={`font-bold leading-none tracking-[-0.045em] ${light ? "text-white" : "text-[#1c1c1c]"} ${wordClass}`}
      >
        Chase
      </span>
    </span>
  );
}
