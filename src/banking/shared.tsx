import type { Dispatch, ReactNode, SetStateAction } from "react";
import { displayBalance, ledgerBalance } from "@/data";
import { formatMoney } from "@/lib/format";
import type { Account, BankState, View } from "@/types";
import { cn } from "@/utils/cn";

export const PHOTO =
  "https://images.pexels.com/photos/19098114/pexels-photo-19098114.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=320&w=320";

export interface ViewProps {
  state: BankState;
  setState: Dispatch<SetStateAction<BankState>>;
  go: (view: View) => void;
  toast: (msg: string) => void;
  hidden: boolean;
}

export function Money({
  value,
  hidden,
  sign,
  className,
}: {
  value: number;
  hidden?: boolean;
  sign?: boolean;
  className?: string;
}) {
  return <span className={cn("tabular", className)}>{formatMoney(value, { hidden, sign })}</span>;
}

export function Avatar({ className, alt = "Jedidiah Cole" }: { className?: string; alt?: string }) {
  return (
    <img
      src={PHOTO}
      alt={alt}
      className={cn("bg-[#d7e6f4] object-cover", className)}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

export function findAccount(state: BankState, id: string) {
  return state.accounts.find((a) => a.id === id);
}

export function balanceCaption(account: Account) {
  if (account.kind === "credit") return "Current balance";
  if (account.kind === "loan") return "Remaining balance";
  if (account.kind === "invest") return "Market value";
  return "Available balance";
}

export function headline(account: Account, state: BankState) {
  return displayBalance(account, state);
}

export function spendable(state: BankState, accountId: string) {
  const account = findAccount(state, accountId);
  if (!account) return 0;
  if (account.kind === "deposit") return Math.max(0, ledgerBalance(account, state.transactions));
  if (account.kind === "invest") return Math.max(0, state.investCash);
  return 0;
}

export function downloadCsv(filename: string, rows: string[][]) {
  const esc = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SuccessBlock({
  title,
  confirm,
  children,
  onDone,
}: {
  title: string;
  confirm: string;
  children: ReactNode;
  onDone: () => void;
}) {
  return (
    <div className="px-2 py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f6ee] text-[#128842]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 12.5l4.2 4.2L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-[#101820]">{title}</h2>
      <p className="mt-1 text-sm text-[#5c6770]">Confirmation {confirm}</p>
      <div className="mx-auto mt-5 max-w-md text-left text-sm">{children}</div>
      <button onClick={onDone} className="mt-6 h-11 rounded bg-[#117ACA] px-6 text-sm font-semibold text-white hover:bg-[#0d6eb5]">
        Done
      </button>
    </div>
  );
}
