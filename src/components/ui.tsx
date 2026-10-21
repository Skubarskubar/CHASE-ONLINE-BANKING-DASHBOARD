import type { ReactNode, SVGProps } from "react";
import { cn } from "@/utils/cn";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  search: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </Svg>
  ),
  eye: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  ),
  eyeOff: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.2 3.8" />
      <path d="M6.1 6.8C3.7 8.5 2 12 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  ),
  bell: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 9a6 6 0 1 1 12 0c0 7 2 7 2 7H4s2 0 2-7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  ),
  mail: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </Svg>
  ),
  chevron: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  ),
  down: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  ),
  close: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12.5l4.2 4.2L19 7.5" />
    </Svg>
  ),
  lock: (p: IconProps) => (
    <Svg {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  ),
  card: (p: IconProps) => (
    <Svg {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19" />
    </Svg>
  ),
  transfer: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 7h11l-3-3" />
      <path d="M17 17H6l3 3" />
    </Svg>
  ),
  plus: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  download: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </Svg>
  ),
  help: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1.1.8-1.1 1.5V14" />
      <path d="M12 17h.01" />
    </Svg>
  ),
  user: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c1.4-2.6 3.8-3.7 7-3.7s5.6 1.1 7 3.7" />
    </Svg>
  ),
  pin: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </Svg>
  ),
  menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  ),
  out: (p: IconProps) => (
    <Svg {...p}>
      <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h10" />
      <path d="M11 9l3 3-3 3" />
    </Svg>
  ),
  shield: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3l8 3v6c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V6l8-3z" />
    </Svg>
  ),
  chart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </Svg>
  ),
  home: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M7 10.5V20h10v-9.5" />
    </Svg>
  ),
  car: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 15h16l-1.4-4.2A2 2 0 0 0 16.7 9H7.3a2 2 0 0 0-1.9 1.3L4 15z" />
      <circle cx="7.5" cy="16.5" r="1.3" />
      <circle cx="16.5" cy="16.5" r="1.3" />
    </Svg>
  ),
};

export const fieldClass =
  "h-11 w-full rounded border border-[#8b9198] bg-white px-3 text-[15px] text-[#101820] outline-none transition placeholder:text-[#8b9198] focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/25";

export const labelClass = "mb-1.5 block text-[13px] font-semibold text-[#3c4450]";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#6b7280]">{hint}</span> : null}
    </label>
  );
}

export function PrimaryButton({
  children,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded bg-[#117ACA] px-4 text-[15px] font-semibold text-white transition hover:bg-[#0d6eb5] disabled:cursor-not-allowed disabled:bg-[#c5ced6]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded border border-[#117ACA] bg-white px-4 text-[15px] font-semibold text-[#117ACA] transition hover:bg-[#f3f8fc] disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-[#101820]/45" aria-label="Close dialog" onClick={onClose} />
      <div className="pop relative z-10 w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-[#101820]">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-[#5c6770] hover:bg-[#f2f4f6]" aria-label="Close">
            <Icon.close className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="pop fixed bottom-5 right-5 z-[90] flex max-w-sm items-start gap-2 rounded-md bg-[#101820] px-4 py-3 text-sm text-white shadow-xl">
      <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-[#8ee0ad]" />
      <span>{message}</span>
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-md border border-[#e5e8eb] bg-white shadow-[0_1px_2px_rgba(16,24,32,0.04)]", className)}>
      {children}
    </section>
  );
}
