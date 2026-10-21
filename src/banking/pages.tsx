import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Field, GhostButton, Icon, Modal, Panel, PrimaryButton, fieldClass } from "@/components/ui";
import { createInitialState, ledgerBalance, netWorth, pushTxn, txnsFor } from "@/data";
import { Money, SuccessBlock, ViewProps, findAccount, headline, spendable } from "@/banking/shared";
import {
  addMonthsISO,
  catColor,
  confirmation,
  daysAgo,
  formatLong,
  formatMoney,
  formatMonth,
  isoDate,
  monthKey,
  parseMoney,
  round2,
  todayISO,
  uid,
} from "@/lib/format";
import type { BankState, Branch, View } from "@/types";
import { cn } from "@/utils/cn";

type Tab = "transfer" | "bill" | "zelle" | "wire";

export function PayPage({ state, setState, go, toast, hidden, initialTab }: ViewProps & { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab || "transfer");
  const tabs: { id: Tab; label: string }[] = [
    { id: "transfer", label: "Transfer" },
    { id: "bill", label: "Pay bills" },
    { id: "zelle", label: "Zelle" },
    { id: "wire", label: "Wire" },
  ];
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Pay & transfer</h1>
      <p className="mt-1 text-sm text-[#5c6770]">Move money between your accounts, pay a bill, or send to someone you know. Nothing is transmitted outside this preview.</p>
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-[#e6e8eb]">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              go({ name: "pay", tab: item.id });
            }}
            className={cn("h-10 shrink-0 border-b-2 px-4 text-sm font-semibold", tab === item.id ? "border-[#117ACA] text-[#117ACA]" : "border-transparent text-[#5c6770]")}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Panel className="mt-4 p-5">
        {tab === "transfer" && <TransferTab state={state} setState={setState} toast={toast} hidden={hidden} />}
        {tab === "bill" && <BillTab state={state} setState={setState} toast={toast} hidden={hidden} />}
        {tab === "zelle" && <ZelleTab state={state} setState={setState} toast={toast} hidden={hidden} />}
        {tab === "wire" && <WireTab state={state} setState={setState} toast={toast} hidden={hidden} />}
      </Panel>
    </div>
  );
}

function sources(state: BankState) {
  return state.accounts.filter((a) => a.kind === "deposit" || a.kind === "invest");
}

function AmountField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input className={fieldClass} inputMode="decimal" placeholder="0.00" value={value} onChange={(e) => onChange(e.target.value)} />;
}

function TransferTab({ state, setState, toast, hidden }: Omit<ViewProps, "go">) {
  const [fromId, setFromId] = useState("chk");
  const [toId, setToId] = useState("sav");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [when, setWhen] = useState(todayISO());
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"form" | "review" | "done">("form");
  const [confirmNo, setConfirmNo] = useState("");
  const available = spendable(state, fromId);
  const destinations = state.accounts.filter((a) => a.id !== fromId);

  function validate() {
    const n = parseMoney(amount);
    if (!fromId || !toId || fromId === toId) return "Choose two different accounts.";
    if (n === null || n <= 0) return "Enter an amount greater than $0.00.";
    if (when <= todayISO() && n > available) return `That is more than the ${formatMoney(available)} available.`;
    const dest = findAccount(state, toId);
    if (dest && (dest.kind === "credit" || dest.kind === "loan") && n > headline(dest, state)) {
      return "Amount is more than the current balance.";
    }
    return "";
  }

  function submit() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    const n = parseMoney(amount)!;
    const ref = confirmation();
    setConfirmNo(ref);
    if (when > todayISO()) {
      const dest = findAccount(state, toId)!;
      setState((s) => ({
        ...s,
        scheduled: [
          { id: uid("sch"), name: `Transfer to ${dest.nickname || dest.name}`, amount: n, fromId, nextDate: when, kind: "transfer" },
          ...s.scheduled,
        ],
      }));
    } else {
      setState((s) => applyMove(s, fromId, toId, n, memo));
    }
    setStage("done");
    toast(when > todayISO() ? "Transfer scheduled." : "Transfer complete.");
  }

  if (stage === "done") {
    const dest = findAccount(state, toId);
    return (
      <SuccessBlock title={when > todayISO() ? "Transfer scheduled" : "Transfer complete"} confirm={confirmNo} onDone={() => setStage("form")}>
        <Row label="Amount" value={formatMoney(parseMoney(amount) || 0)} />
        <Row label="From" value={findAccount(state, fromId)?.name || ""} />
        <Row label="To" value={dest?.name || ""} />
        <Row label="When" value={formatLong(when)} />
        {memo && <Row label="Memo" value={memo} />}
      </SuccessBlock>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const problem = validate();
          setError(problem);
          if (!problem) setStage("review");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From">
            <select className={fieldClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {sources(state).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatMoney(spendable(state, a.id), { hidden })})
                </option>
              ))}
            </select>
          </Field>
          <Field label="To">
            <select className={fieldClass} value={toId} onChange={(e) => setToId(e.target.value)}>
              {destinations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Amount" hint={`Available ${formatMoney(available, { hidden })}`}>
          <AmountField value={amount} onChange={setAmount} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <input type="date" className={fieldClass} value={when} min={todayISO()} onChange={(e) => setWhen(e.target.value)} />
          </Field>
          <Field label="Memo">
            <input className={fieldClass} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
        {error && <p className="text-sm text-[#b42318]">{error}</p>}
        {stage === "review" ? (
          <div className="rounded-md bg-[#f5f9fc] p-4 text-sm">
            <p className="font-semibold">Review transfer</p>
            <p className="mt-1 text-[#4b5560]">
              {formatMoney(parseMoney(amount) || 0)} from {findAccount(state, fromId)?.name} to {findAccount(state, toId)?.name} on {formatLong(when)}.
            </p>
            <div className="mt-3 flex gap-2">
              <PrimaryButton onClick={submit}>Confirm</PrimaryButton>
              <GhostButton onClick={() => setStage("form")}>Edit</GhostButton>
            </div>
          </div>
        ) : (
          <PrimaryButton type="submit">Review transfer</PrimaryButton>
        )}
      </form>
      <aside className="rounded-md bg-[#f7f8f9] p-4 text-sm text-[#4b5560]">
        <p className="font-semibold text-[#101820]">Scheduled</p>
        <ul className="mt-2 space-y-2">
          {state.scheduled.slice(0, 4).map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>{item.name}</span>
              <span className="tabular">{formatMoney(item.amount, { hidden })}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function applyMove(state: BankState, fromId: string, toId: string, amount: number, memo: string) {
  const from = findAccount(state, fromId)!;
  const to = findAccount(state, toId)!;
  const date = todayISO();
  let next = state;
  const note = memo ? ` — ${memo}` : "";
  if (from.kind === "invest") {
    next = { ...next, investCash: round2(next.investCash - amount) };
    next = pushTxn(
      next,
      { accountId: "inv", date, description: `TRANSFER TO ${to.name.toUpperCase()}${note}`, amount: -amount, category: "Transfer", status: "posted" },
      "investActivity",
    );
  } else {
    next = pushTxn(next, {
      accountId: fromId,
      date,
      description:
        to.kind === "credit" || to.kind === "loan"
          ? `PAYMENT TO ${to.name.toUpperCase()} ...${to.mask}${note}`
          : `TRANSFER TO ${to.name.toUpperCase()} ...${to.mask}${note}`,
      amount: -amount,
      category: to.kind === "credit" ? "Payment" : to.kind === "loan" ? "Loan payment" : "Transfer",
      status: "posted",
    });
  }
  if (to.kind === "invest") {
    next = { ...next, investCash: round2(next.investCash + amount) };
    next = pushTxn(
      next,
      { accountId: "inv", date, description: `TRANSFER FROM ${from.name.toUpperCase()}${note}`, amount, category: "Transfer", status: "posted" },
      "investActivity",
    );
  } else if (to.kind === "credit") {
    next = pushTxn(next, {
      accountId: toId,
      date,
      description: "PAYMENT THANK YOU",
      amount: -amount,
      category: "Payment",
      status: "posted",
    });
  } else if (to.kind === "loan") {
    const principal = to.id === "mtg" ? round2(amount * 0.253) : to.id === "aut" ? round2(amount * 0.643) : amount;
    next = pushTxn(next, {
      accountId: toId,
      date,
      description: "PAYMENT RECEIVED — PRINCIPAL",
      amount: -principal,
      category: "Loan payment",
      status: "posted",
    });
  } else {
    next = pushTxn(next, {
      accountId: toId,
      date,
      description: `TRANSFER FROM ${from.name.toUpperCase()} ...${from.mask}${note}`,
      amount,
      category: "Transfer",
      status: "posted",
    });
  }
  return next;
}

function BillTab({ state, setState, toast, hidden }: Omit<ViewProps, "go">) {
  const [payeeId, setPayeeId] = useState(state.payees[0]?.id || "");
  const [fromId, setFromId] = useState("chk");
  const [amount, setAmount] = useState(String(state.payees[0]?.lastAmount || ""));
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const payee = state.payees.find((p) => p.id === payeeId);

  if (done && payee) {
    return (
      <SuccessBlock title="Payment sent" confirm={done} onDone={() => setDone(null)}>
        <Row label="Payee" value={payee.name} />
        <Row label="Amount" value={formatMoney(parseMoney(amount) || 0)} />
        <Row label="From" value={findAccount(state, fromId)?.name || ""} />
      </SuccessBlock>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseMoney(amount);
          if (!payee || n === null || n <= 0) {
            setError("Choose a payee and enter an amount.");
            return;
          }
          if (n > spendable(state, fromId)) {
            setError("That is more than your available balance.");
            return;
          }
          const ref = confirmation();
          setState((s) =>
            pushTxn(s, {
              accountId: fromId,
              date: todayISO(),
              description: `${payee.name.toUpperCase()} BILL PAY`,
              amount: -n,
              category: payee.category,
              status: "posted",
            }),
          );
          setDone(ref);
          toast(`Paid ${payee.name}.`);
        }}
      >
        <Field label="Payee">
          <select
            className={fieldClass}
            value={payeeId}
            onChange={(e) => {
              setPayeeId(e.target.value);
              const next = state.payees.find((p) => p.id === e.target.value);
              if (next) setAmount(String(next.lastAmount));
            }}
          >
            {state.payees.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        {payee && <p className="text-xs text-[#6b7280]">{payee.subtitle}</p>}
        <Field label="From">
          <select className={fieldClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {state.accounts
              .filter((a) => a.kind === "deposit")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatMoney(spendable(state, a.id), { hidden })})
                </option>
              ))}
          </select>
        </Field>
        <Field label="Amount">
          <AmountField value={amount} onChange={setAmount} />
        </Field>
        {error && <p className="text-sm text-[#b42318]">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <PrimaryButton type="submit">Pay bill</PrimaryButton>
          <GhostButton onClick={() => setAdding(true)}>Add payee</GhostButton>
        </div>
      </form>
      <div>
        <p className="text-sm font-semibold">Upcoming</p>
        <ul className="mt-2 space-y-2 text-sm">
          {state.scheduled.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded border border-[#eef0f2] px-3 py-2">
              <span>
                <span className="block font-medium">{item.name}</span>
                <span className="text-xs text-[#6b7280]">{formatLong(item.nextDate)}</span>
              </span>
              <button
                className="text-xs font-semibold text-[#117ACA]"
                onClick={() => {
                  setState((s) => {
                    const bumped: BankState = {
                      ...s,
                      scheduled: s.scheduled.map((row) => (row.id === item.id ? { ...row, nextDate: addMonthsISO(row.nextDate, 1) } : row)),
                    };
                    if (item.kind === "transfer") return applyMove(bumped, item.fromId, "sav", item.amount, "Scheduled");
                    if (item.name.startsWith("Mortgage")) return applyMove(bumped, item.fromId, "mtg", item.amount, "Scheduled");
                    if (item.name.startsWith("Auto")) return applyMove(bumped, item.fromId, "aut", item.amount, "Scheduled");
                    return pushTxn(bumped, {
                      accountId: item.fromId,
                      date: todayISO(),
                      description: `${item.name.toUpperCase()} BILL PAY`,
                      amount: -item.amount,
                      category: "Bills & utilities",
                      status: "posted",
                    });
                  });
                  toast(`Paid ${item.name}.`);
                }}
              >
                Pay now
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Modal open={adding} title="Add a payee" onClose={() => setAdding(false)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const id = uid("payee");
            setState((s) => ({
              ...s,
              payees: [...s.payees, { id, name, subtitle: subtitle || "Added in preview", category: "Bills & utilities", lastAmount: 0 }],
            }));
            setPayeeId(id);
            setAdding(false);
            setName("");
            setSubtitle("");
            toast("Payee added.");
          }}
        >
          <Field label="Name">
            <input className={fieldClass} required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Account note">
            <input className={fieldClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Account number or memo" />
          </Field>
          <PrimaryButton type="submit">Save payee</PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}

function ZelleTab({ state, setState, toast, hidden }: Omit<ViewProps, "go">) {
  const [contactId, setContactId] = useState(state.contacts[0]?.id || "");
  const [fromId, setFromId] = useState("chk");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const contact = state.contacts.find((c) => c.id === contactId);

  if (done && contact) {
    return (
      <SuccessBlock title="Money sent" confirm={done} onDone={() => setDone(null)}>
        <Row label="To" value={contact.name} />
        <Row label="Amount" value={formatMoney(parseMoney(amount) || 0)} />
        <Row label="From" value={findAccount(state, fromId)?.name || ""} />
        {note && <Row label="Note" value={note} />}
      </SuccessBlock>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {state.contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => setContactId(c.id)}
            className={cn("flex min-w-[120px] flex-col items-center rounded-md border px-3 py-3 text-sm", contactId === c.id ? "border-[#117ACA] bg-[#f4f8fc]" : "border-[#e6e8eb]")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: c.color }}>
              {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
            <span className="mt-2 font-semibold">{c.name.split(" ")[0]}</span>
          </button>
        ))}
        <button onClick={() => setAdding(true)} className="flex min-w-[120px] flex-col items-center justify-center rounded-md border border-dashed border-[#c5ccd3] px-3 py-3 text-sm font-semibold text-[#117ACA]">
          <Icon.plus className="h-5 w-5" />
          Add
        </button>
      </div>
      <form
        className="max-w-lg space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseMoney(amount);
          if (!contact || n === null || n <= 0) {
            setError("Choose someone and enter an amount.");
            return;
          }
          if (n > 2000) {
            setError("Zelle preview limit is $2,000 per send.");
            return;
          }
          const todayOut = state.transactions
            .filter((t) => t.date === todayISO() && t.category === "Zelle" && t.amount < 0)
            .reduce((s, t) => s + Math.abs(t.amount), 0);
          if (todayOut + n > 5000) {
            setError("That would pass the $5,000 daily Zelle preview limit.");
            return;
          }
          if (n > spendable(state, fromId)) {
            setError("That is more than your available balance.");
            return;
          }
          const ref = confirmation();
          setState((s) =>
            pushTxn(s, {
              accountId: fromId,
              date: todayISO(),
              description: `ZELLE TO ${contact.name.toUpperCase()}${note ? " — " + note : ""}`,
              amount: -n,
              category: "Zelle",
              status: "posted",
            }),
          );
          setDone(ref);
          toast(`Sent to ${contact.name}.`);
        }}
      >
        <Field label="From">
          <select className={fieldClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {state.accounts
              .filter((a) => a.kind === "deposit")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatMoney(spendable(state, a.id), { hidden })})
                </option>
              ))}
          </select>
        </Field>
        <Field label="Amount" hint={contact ? `To ${contact.name} · ${contact.handle}` : ""}>
          <AmountField value={amount} onChange={setAmount} />
        </Field>
        <Field label="Note">
          <input className={fieldClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dinner, rent, thanks" />
        </Field>
        {error && <p className="text-sm text-[#b42318]">{error}</p>}
        <PrimaryButton type="submit">Send</PrimaryButton>
      </form>
      <Modal open={adding} title="Add a recipient" onClose={() => setAdding(false)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const id = uid("z");
            setState((s) => ({
              ...s,
              contacts: [...s.contacts, { id, name, handle, color: "#117ACA" }],
            }));
            setContactId(id);
            setAdding(false);
            setName("");
            setHandle("");
          }}
        >
          <Field label="Name">
            <input className={fieldClass} required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email or U.S. mobile">
            <input className={fieldClass} required value={handle} onChange={(e) => setHandle(e.target.value)} />
          </Field>
          <PrimaryButton type="submit">Save</PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}

function WireTab({ state, setState, toast, hidden }: Omit<ViewProps, "go">) {
  const [fromId, setFromId] = useState("chk");
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("");
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <SuccessBlock title="Wire request saved" confirm={done} onDone={() => setDone(null)}>
        <p className="mb-3 rounded bg-[#fff8eb] px-3 py-2 text-xs leading-relaxed text-[#8a5a00]">
          Simulated only. This preview does not transmit wires to any bank.
        </p>
        <Row label="To" value={recipient} />
        <Row label="Amount" value={formatMoney(parseMoney(amount) || 0)} />
        <Row label="Fee" value="$25.00" />
      </SuccessBlock>
    );
  }

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseMoney(amount);
        if (!recipient || !bank || !/^\d{9}$/.test(routing) || account.length < 4 || n === null || n <= 0) {
          setError("Enter the recipient, bank, a 9-digit routing number, account number, and amount.");
          return;
        }
        if (n + 25 > spendable(state, fromId)) {
          setError("Amount plus the $25 preview fee is more than the available balance.");
          return;
        }
        const ref = confirmation();
        setState((s) =>
          pushTxn(s, {
            accountId: fromId,
            date: todayISO(),
            description: `WIRE TO ${recipient.toUpperCase()} — SIMULATED`,
            amount: round2(-(n + 25)),
            category: "Transfer",
            status: "pending",
          }),
        );
        setDone(ref);
        toast("Simulated wire saved.");
      }}
    >
      <p className="rounded-md bg-[#f7f8f9] p-3 text-sm leading-relaxed text-[#4b5560]">
        Domestic wire preview. A $25 fee is included. Requests stay on this device and are not sent to a payment network.
      </p>
      <Field label="From">
        <select className={fieldClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
          {state.accounts
            .filter((a) => a.kind === "deposit")
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({formatMoney(spendable(state, a.id), { hidden })})
              </option>
            ))}
        </select>
      </Field>
      <Field label="Recipient name">
        <input className={fieldClass} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      </Field>
      <Field label="Recipient bank">
        <input className={fieldClass} value={bank} onChange={(e) => setBank(e.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Routing number">
          <input className={fieldClass} value={routing} onChange={(e) => setRouting(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Account number">
          <input className={fieldClass} value={account} onChange={(e) => setAccount(e.target.value)} />
        </Field>
      </div>
      <Field label="Amount">
        <AmountField value={amount} onChange={setAmount} />
      </Field>
      {error && <p className="text-sm text-[#b42318]">{error}</p>}
      <PrimaryButton type="submit">Review & save wire</PrimaryButton>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#f0f2f4] py-2">
      <span className="text-[#6b7280]">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

export function DepositPage({ state, setState, toast, hidden }: ViewProps) {
  const [accountId, setAccountId] = useState("chk");
  const [amount, setAmount] = useState("");
  const [front, setFront] = useState(false);
  const [back, setBack] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const deposits = state.transactions.filter((t) => t.description.startsWith("MOBILE DEPOSIT"));

  if (done) {
    return (
      <Panel className="p-5">
        <SuccessBlock title="Deposit submitted" confirm={done} onDone={() => setDone(null)}>
          <Row label="Amount" value={formatMoney(parseMoney(amount) || 0)} />
          <Row label="To" value={findAccount(state, accountId)?.name || ""} />
          <p className="mt-3 text-xs leading-relaxed text-[#6b7280]">The full amount is available now in this preview and marked pending. No check image is uploaded or stored.</p>
        </SuccessBlock>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">Deposit checks</h1>
        <p className="mt-1 text-sm text-[#5c6770]">Capture is simulated. We never receive an image of a real check.</p>
        <Panel className="mt-4 p-5">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const n = parseMoney(amount);
              if (n === null || n <= 0) {
                setError("Enter the check amount.");
                return;
              }
              if (n > 5000) {
                setError("This preview accepts deposits up to $5,000.");
                return;
              }
              if (!front || !back) {
                setError("Capture the front and back of the sample check.");
                return;
              }
              const ref = confirmation();
              setState((s) =>
                pushTxn(s, {
                  accountId,
                  date: todayISO(),
                  description: "MOBILE DEPOSIT",
                  amount: n,
                  category: "Income",
                  status: "pending",
                }),
              );
              setDone(ref);
              toast("Deposit is pending.");
            }}
          >
            <Field label="Deposit to">
              <select className={fieldClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {state.accounts
                  .filter((a) => a.kind === "deposit")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {formatMoney(spendable(state, a.id), { hidden })}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Amount">
              <AmountField value={amount} onChange={setAmount} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Capture label="Front of check" done={front} onClick={() => setFront(true)} />
              <Capture label="Back of check" done={back} onClick={() => setBack(true)} />
            </div>
            {error && <p className="text-sm text-[#b42318]">{error}</p>}
            <PrimaryButton type="submit">Submit deposit</PrimaryButton>
          </form>
        </Panel>
      </div>
      <Panel className="p-4">
        <h2 className="text-sm font-semibold">Recent deposits</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {deposits.length === 0 && <li className="text-[#6b7280]">No mobile deposits yet.</li>}
          {deposits.map((t) => (
            <li key={t.id} className="flex justify-between gap-3">
              <span>
                <span className="block font-medium">{formatLong(t.date)}</span>
                <span className="text-xs capitalize text-[#6b7280]">{t.status}</span>
              </span>
              <span className="tabular font-semibold text-[#0b7a3b]">{formatMoney(t.amount, { sign: true })}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Capture({ label, done, onClick }: { label: string; done: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-md border px-3 py-6 text-sm font-semibold", done ? "border-[#128842] bg-[#f3fbf6] text-[#0f6b38]" : "border-dashed border-[#c5ccd3] text-[#117ACA]")}>
      {done ? `${label} captured` : `Capture ${label.toLowerCase()}`}
    </button>
  );
}

const CARDS = [
  { id: "debit", variant: "debit" as const, name: "JEDIDIAH A COLE", last4: "4421", label: "Debit card", account: "Private Client Checking" },
  { id: "sap", variant: "sapphire" as const, name: "JEDIDIAH A COLE", last4: "7712", label: "Sapphire Preferred", account: "Credit card" },
  { id: "fre", variant: "freedom" as const, name: "JEDIDIAH A COLE", last4: "2290", label: "Freedom Unlimited", account: "Credit card" },
];

export function CardsPage({ state, setState, toast, hidden, go }: ViewProps) {
  const [selected, setSelected] = useState("sap");
  const [reveal, setReveal] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const card = CARDS.find((c) => c.id === selected)!;
  const locked = !!state.cardsLocked[card.id];
  const account = card.id === "debit" ? findAccount(state, "chk") : findAccount(state, card.id);

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Cards</h1>
      <p className="mt-1 text-sm text-[#5c6770]">Lock a card, review rewards, or pay a balance. Card numbers shown here are samples.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {CARDS.map((item) => (
          <MetalCard key={item.id} {...item} locked={!!state.cardsLocked[item.id]} selected={selected === item.id} onClick={() => setSelected(item.id)} />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Panel className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{card.label}</h2>
              <p className="text-sm text-[#6b7280]">{card.account} · •••• {card.last4}</p>
            </div>
            <button
              onClick={() => {
                setState((s) => ({ ...s, cardsLocked: { ...s.cardsLocked, [card.id]: !s.cardsLocked[card.id] } }));
                toast(locked ? `${card.label} unlocked.` : `${card.label} locked.`);
              }}
              className={cn("h-10 rounded px-4 text-sm font-semibold", locked ? "bg-[#117ACA] text-white" : "border border-[#c41230] text-[#c41230]")}
            >
              {locked ? "Unlock card" : "Lock card"}
            </button>
          </div>
          {locked && <p className="mt-3 rounded bg-[#fff6f6] px-3 py-2 text-sm text-[#9b1c1c]">New purchases and ATM withdrawals are declined while this card is locked. Recurring payments already set up may still post.</p>}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Sample number</dt>
              <dd className="font-semibold tabular">{reveal ? `4000 0000 0000 ${card.last4}` : `•••• •••• •••• ${card.last4}`}</dd>
            </div>
            <button className="text-sm font-semibold text-[#117ACA]" onClick={() => setReveal((v) => !v)}>
              {reveal ? "Hide number" : "Show sample number"}
            </button>
            {account && account.kind === "credit" && (
              <>
                <div className="flex justify-between pt-2">
                  <dt className="text-[#6b7280]">Balance</dt>
                  <dd className="font-semibold tabular"><Money value={headline(account, state)} hidden={hidden} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b7280]">Available</dt>
                  <dd className="font-semibold tabular">{formatMoney((account.limit || 0) - ledgerBalance(account, state.transactions), { hidden })}</dd>
                </div>
              </>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {account?.kind === "credit" && (
              <PrimaryButton onClick={() => go({ name: "pay", tab: "transfer" })}>Pay card</PrimaryButton>
            )}
            <GhostButton onClick={() => setLostOpen(true)}>Report lost or stolen</GhostButton>
          </div>
        </Panel>
        <Panel className="p-5">
          <h2 className="font-semibold">Rewards</h2>
          {selected === "sap" && (
            <div className="mt-3">
              <p className="text-3xl font-semibold tabular">{state.rewards.sapphire.toLocaleString()} pts</p>
              <p className="text-sm text-[#6b7280]">About {formatMoney(state.rewards.sapphire / 100)} if redeemed for cash in this preview.</p>
              <PrimaryButton
                className="mt-4"
                disabled={state.rewards.sapphire <= 0}
                onClick={() => {
                  const dollars = round2(state.rewards.sapphire / 100);
                  setState((s) =>
                    pushTxn(
                      { ...s, rewards: { ...s.rewards, sapphire: 0 } },
                      {
                        accountId: "chk",
                        date: todayISO(),
                        description: "SAPPHIRE REWARDS CASH",
                        amount: dollars,
                        category: "Income",
                        status: "posted",
                      },
                    ),
                  );
                  toast(`Redeemed ${formatMoney(dollars)} to checking.`);
                }}
              >
                Redeem to checking
              </PrimaryButton>
            </div>
          )}
          {selected === "fre" && (
            <div className="mt-3">
              <p className="text-3xl font-semibold tabular">{formatMoney(state.rewards.freedom)}</p>
              <p className="text-sm text-[#6b7280]">Cash back available in this preview.</p>
              <PrimaryButton
                className="mt-4"
                disabled={state.rewards.freedom <= 0}
                onClick={() => {
                  const dollars = state.rewards.freedom;
                  setState((s) =>
                    pushTxn(
                      { ...s, rewards: { ...s.rewards, freedom: 0 } },
                      {
                        accountId: "chk",
                        date: todayISO(),
                        description: "FREEDOM CASH BACK",
                        amount: dollars,
                        category: "Income",
                        status: "posted",
                      },
                    ),
                  );
                  toast(`Redeemed ${formatMoney(dollars)} to checking.`);
                }}
              >
                Redeem to checking
              </PrimaryButton>
            </div>
          )}
          {selected === "debit" && <p className="mt-3 text-sm text-[#5c6770]">Debit purchases don’t earn Sapphire points. ATM limit illustration: $3,000 per day. Purchase limit illustration: $5,000 per day.</p>}
        </Panel>
      </div>
      <Modal open={lostOpen} title="Replace this card?" onClose={() => setLostOpen(false)}>
        <p className="text-sm leading-relaxed text-[#4b5560]">We’ll lock {card.label} immediately. A replacement is noted in messages. No card is mailed from this preview.</p>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={() => setLostOpen(false)}>Cancel</GhostButton>
          <PrimaryButton
            onClick={() => {
              setState((s) => ({
                ...s,
                cardsLocked: { ...s.cardsLocked, [card.id]: true },
                messages: [
                  {
                    id: uid("m"),
                    from: "Chase Card Services",
                    role: "Cards",
                    subject: `${card.label} replacement started`,
                    body: `We locked the card ending ${card.last4}. In a live bank, a replacement would arrive in 5–7 days. This preview does not mail a card.`,
                    date: todayISO(),
                    unread: true,
                    folder: "inbox",
                  },
                  ...s.messages,
                ],
              }));
              setLostOpen(false);
              toast("Card locked and replacement noted.");
            }}
          >
            Lock and replace
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

function MetalCard({
  variant,
  name,
  last4,
  label,
  locked,
  selected,
  onClick,
}: {
  variant: "debit" | "sapphire" | "freedom";
  name: string;
  last4: string;
  label: string;
  locked: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const skin =
    variant === "debit"
      ? "from-[#f8fbfe] via-[#d5e7f6] to-[#8eb6d8] text-[#102033]"
      : variant === "sapphire"
        ? "from-[#071525] via-[#14345c] to-[#1c6cb3] text-white"
        : "from-[#242a31] via-[#4a545e] to-[#171c21] text-white";
  return (
    <button type="button" onClick={onClick} className={cn("relative aspect-[1.62/1] overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left shadow-lg transition hover:-translate-y-0.5", skin, selected && "ring-2 ring-[#117ACA] ring-offset-2")}>
      <span className="card-shine pointer-events-none absolute inset-y-[-20%] left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between">
        <Logo iconClass="h-6 w-6" wordClass={variant === "debit" ? "text-[16px] text-[#102033]" : "text-[16px] text-white"} light={variant !== "debit"} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-75">{label}</span>
      </div>
      <div className="mt-5 h-7 w-9 rounded bg-gradient-to-br from-[#f3dc9a] to-[#b68b2d] shadow-inner" />
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.18em]">•••• {last4}</p>
          <p className="mt-1 text-[11px] font-semibold tracking-wide">{name}</p>
        </div>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded bg-black/35 px-2 py-1 text-[10px] font-bold uppercase text-white">
            <Icon.lock className="h-3 w-3" /> Locked
          </span>
        )}
      </div>
    </button>
  );
}

export function PlanPage({ state, setState, hidden }: ViewProps) {
  const since = daysAgo(30);
  const buckets = useMemo(() => spendingBuckets(state, since), [state, since]);
  const total = buckets.reduce((s, b) => s + b.amount, 0);
  const income = state.transactions
    .filter((t) => t.date >= since && t.amount > 0 && (t.category === "Income" || t.category === "Zelle") && findAccount(state, t.accountId)?.kind === "deposit")
    .reduce((s, t) => s + t.amount, 0);
  const worth = netWorth(state);
  const [home, setHome] = useState(String(state.homeValue));

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Plan & track</h1>
      <p className="mt-1 text-sm text-[#5c6770]">Last 30 days of preview activity, plus a net-worth snapshot that includes your home estimate.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Spending</p>
          <p className="mt-1 text-3xl font-semibold tabular"><Money value={total} hidden={hidden} /></p>
          <p className="text-xs text-[#6b7280]">Excludes transfers and card payments</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Money in</p>
          <p className="mt-1 text-3xl font-semibold tabular text-[#0b7a3b]"><Money value={income} hidden={hidden} /></p>
          <p className="text-xs text-[#6b7280]">Payroll, interest, and Zelle received</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Net worth</p>
          <p className="mt-1 text-3xl font-semibold tabular"><Money value={worth.net} hidden={hidden} /></p>
          <p className="text-xs text-[#6b7280]">Assets {formatMoney(worth.assets, { hidden })} · owed {formatMoney(worth.liabilities, { hidden })}</p>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="flex flex-col items-center p-5">
          <Donut slices={buckets.map((b) => ({ value: b.amount, color: catColor(b.category) }))} />
          <p className="mt-2 text-sm font-semibold">Where it went</p>
        </Panel>
        <Panel className="p-5">
          <h2 className="font-semibold">Budgets</h2>
          <ul className="mt-3 space-y-4">
            {state.budgets.map((budget) => {
              const spent = buckets.find((b) => b.category === budget.category)?.amount || 0;
              const pct = Math.min(100, budget.limit ? (spent / budget.limit) * 100 : 0);
              return (
                <li key={budget.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{budget.category}</span>
                    <span className="tabular text-[#5c6770]">
                      {formatMoney(spent, { hidden })} / {formatMoney(budget.limit, { hidden })}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eef1f4]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 100 ? "#b42318" : catColor(budget.category) }} />
                  </div>
                  <label className="mt-1 flex items-center gap-2 text-xs text-[#6b7280]">
                    Monthly limit
                    <input
                      className="h-8 w-28 rounded border border-[#d5dbe1] px-2 text-sm"
                      defaultValue={budget.limit}
                      onBlur={(e) => {
                        const n = parseMoney(e.target.value);
                        if (n === null || n < 0) return;
                        setState((s) => ({
                          ...s,
                          budgets: s.budgets.map((b) => (b.category === budget.category ? { ...b, limit: n } : b)),
                        }));
                      }}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <Panel className="mt-4 p-5">
        <h2 className="font-semibold">Home estimate</h2>
        <p className="mt-1 text-sm text-[#5c6770]">1847 N Halsted St, Unit 4B. Used only for the net-worth figure in this preview.</p>
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = parseMoney(home);
            if (n === null || n <= 0) return;
            setState((s) => ({ ...s, homeValue: n }));
          }}
        >
          <input className={`${fieldClass} max-w-xs`} value={home} onChange={(e) => setHome(e.target.value)} />
          <PrimaryButton type="submit">Update</PrimaryButton>
        </form>
        <p className="mt-2 text-sm">Estimated equity {formatMoney(state.homeValue - ledgerBalance(findAccount(state, "mtg")!, state.transactions), { hidden })}</p>
      </Panel>
    </div>
  );
}

function spendingBuckets(state: BankState, since: string) {
  const map = new Map<string, number>();
  for (const t of state.transactions) {
    if (t.date < since) continue;
    const account = findAccount(state, t.accountId);
    if (!account) continue;
    const skip = ["Transfer", "Payment", "Loan payment"];
    if (account.kind === "deposit" && t.amount < 0 && !skip.includes(t.category)) {
      map.set(t.category, (map.get(t.category) || 0) + Math.abs(t.amount));
    }
    if (account.kind === "credit" && t.amount > 0) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);
}

function Donut({ slices }: { slices: { value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#eef1f4" strokeWidth="14" />
      {slices.map((slice) => {
        const len = (slice.value / total) * c;
        const el = <circle key={slice.color + offset} cx="60" cy="60" r={r} fill="none" stroke={slice.color} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
        offset += len;
        return el;
      })}
    </svg>
  );
}

export function SecurityPage({ state, setState, toast }: ViewProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [dest, setDest] = useState(state.travel?.destination || "");
  const [from, setFrom] = useState(state.travel?.from || "");
  const [to, setTo] = useState(state.travel?.to || "");
  const [note, setNote] = useState(state.travel?.note || "");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <h1 className="text-[28px] font-semibold tracking-tight">Security & privacy</h1>
        <p className="mt-1 text-sm text-[#5c6770]">Password, alerts, and trusted devices for this preview profile.</p>
      </div>
      <Panel className="p-5">
        <h2 className="font-semibold">Password</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (current !== state.password) {
              setError("Current password doesn’t match.");
              return;
            }
            if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
              setError("Use at least 8 characters with a letter, a number, and a symbol.");
              return;
            }
            if (next !== confirmPw) {
              setError("New passwords don’t match.");
              return;
            }
            if (next === current) {
              setError("Choose a password you haven’t used here.");
              return;
            }
            setState((s) => ({ ...s, password: next }));
            setCurrent("");
            setNext("");
            setConfirmPw("");
            setError("");
            toast("Password updated for this preview.");
          }}
        >
          <Field label="Current password">
            <input type="password" className={fieldClass} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </Field>
          <Field label="New password">
            <input type="password" className={fieldClass} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" className={fieldClass} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" />
          </Field>
          {error && <p className="text-sm text-[#b42318]">{error}</p>}
          <PrimaryButton type="submit">Update password</PrimaryButton>
        </form>
      </Panel>
      <Panel className="p-5">
        <h2 className="font-semibold">2-step verification</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5c6770]">
          When this is on, the next sign-in asks for a one-time code. The preview code is 739184, sent in the sign-in screen — not to a real phone.
        </p>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#117ACA]"
            checked={state.twoStep}
            onChange={(e) => {
              setState((s) => ({ ...s, twoStep: e.target.checked }));
              toast(e.target.checked ? "2-step verification is on." : "2-step verification is off.");
            }}
          />
          Require a code at sign-in
        </label>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#117ACA]"
            checked={state.overdraftProtection}
            onChange={(e) => setState((s) => ({ ...s, overdraftProtection: e.target.checked }))}
          />
          Overdraft protection from Premier Savings
        </label>
        <div className="mt-5 space-y-2">
          {(
            [
              ["email", "Email alerts"],
              ["push", "Push alerts"],
              ["text", "Text alerts"],
              ["largeWithdrawal", "Large withdrawal"],
              ["international", "International charges"],
              ["login", "New sign-in"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between text-sm">
              {label}
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#117ACA]"
                checked={state.alerts[key]}
                onChange={(e) => setState((s) => ({ ...s, alerts: { ...s.alerts, [key]: e.target.checked } }))}
              />
            </label>
          ))}
        </div>
      </Panel>
      <Panel className="p-5">
        <h2 className="font-semibold">Trusted devices</h2>
        <ul className="mt-3 divide-y divide-[#f0f2f4]">
          {state.devices.map((device) => (
            <li key={device.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="block font-semibold">{device.name}</span>
                <span className="text-xs text-[#6b7280]">{device.meta}</span>
              </span>
              {!device.current && (
                <button className="text-xs font-semibold text-[#9b1c1c]" onClick={() => setState((s) => ({ ...s, devices: s.devices.filter((d) => d.id !== device.id) }))}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel className="p-5">
        <h2 className="font-semibold">Travel notice</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setState((s) => ({ ...s, travel: { destination: dest, from, to, note } }));
            toast("Travel notice saved in this preview.");
          }}
        >
          <Field label="Where">
            <input className={fieldClass} value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Lisbon, Portugal" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <input type="date" className={fieldClass} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <input type="date" className={fieldClass} value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
          <Field label="Note">
            <input className={fieldClass} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <PrimaryButton type="submit">Save notice</PrimaryButton>
        </form>
        {state.travel && <p className="mt-3 text-sm text-[#0b7a3b]">Notice on file for {state.travel.destination || "your trip"}.</p>}
        <button className="mt-6 text-sm font-semibold text-[#9b1c1c]" onClick={() => setResetOpen(true)}>
          Reset demo data
        </button>
      </Panel>
      <Modal open={resetOpen} title="Reset this preview?" onClose={() => setResetOpen(false)}>
        <p className="text-sm leading-relaxed text-[#4b5560]">Balances, messages, the password, and card locks return to the original Jedidiah Cole profile. You’ll stay signed in.</p>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={() => setResetOpen(false)}>Cancel</GhostButton>
          <PrimaryButton
            onClick={() => {
              setState(createInitialState());
              setResetOpen(false);
              toast("Preview data restored. Password is Love@123 again.");
            }}
          >
            Reset
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

export function StatementsPage({ state, go }: ViewProps) {
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Statements</h1>
      <p className="mt-1 text-sm text-[#5c6770]">Paperless delivery is on. Open a month to review or print.</p>
      <div className="mt-5 space-y-4">
        {state.accounts
          .filter((a) => a.kind !== "invest")
          .map((account) => {
            const months = [...new Set(txnsFor(state, account.id).filter((t) => t.status === "posted").map((t) => monthKey(t.date)))].sort().reverse();
            return (
              <Panel key={account.id} className="p-4">
                <h2 className="font-semibold text-[#117ACA]">{account.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {months.map((month) => (
                    <button key={month} onClick={() => go({ name: "statement", accountId: account.id, month })} className="rounded border border-[#e1e6ea] px-3 py-1.5 text-sm font-semibold hover:border-[#117ACA]">
                      {formatMonth(month)}
                    </button>
                  ))}
                </div>
              </Panel>
            );
          })}
      </div>
    </div>
  );
}

export function StatementPage({ state, go, accountId, month }: ViewProps & { accountId: string; month: string }) {
  const account = findAccount(state, accountId);
  if (!account) return null;
  const end = lastDay(month);
  const posted = txnsFor(state, account.id).filter((t) => t.status === "posted");
  const inMonth = posted.filter((t) => monthKey(t.date) === month).sort((a, b) => a.date.localeCompare(b.date));
  const later = posted.filter((t) => t.date > end).reduce((s, t) => s + t.amount, 0);
  const closing = round2(ledgerBalance(account, state.transactions) - later);
  const opening = round2(closing - inMonth.reduce((s, t) => s + t.amount, 0));
  let run = opening;
  const lines = inMonth.map((t) => {
    run = round2(run + t.amount);
    return { ...t, after: run };
  });
  return (
    <div>
      <button className="no-print text-sm font-semibold text-[#117ACA]" onClick={() => go({ name: "statements" })}>
        ← All statements
      </button>
      <article className="print-sheet mt-3 rounded-md border border-[#e6e8eb] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Logo iconClass="h-7 w-7" wordClass="text-[22px]" />
            <h1 className="mt-4 text-2xl font-semibold">{formatMonth(month)} statement</h1>
            <p className="text-sm text-[#5c6770]">{account.name} · •••• {account.mask}</p>
            <p className="text-sm text-[#5c6770]">
              {state.profile.firstName} {state.profile.lastName}
              <br />
              {state.profile.address1}, {state.profile.address2}
              <br />
              {state.profile.city}, {state.profile.state} {state.profile.zip}
            </p>
          </div>
          <button className="no-print h-10 rounded bg-[#117ACA] px-4 text-sm font-semibold text-white" onClick={() => window.print()}>
            Print
          </button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded bg-[#f7f8f9] p-3">
            <p className="text-xs text-[#6b7280]">Opening</p>
            <p className="font-semibold tabular">{formatMoney(opening)}</p>
          </div>
          <div className="rounded bg-[#f7f8f9] p-3">
            <p className="text-xs text-[#6b7280]">Closing</p>
            <p className="font-semibold tabular">{formatMoney(closing)}</p>
          </div>
          <div className="rounded bg-[#f7f8f9] p-3">
            <p className="text-xs text-[#6b7280]">Transactions</p>
            <p className="font-semibold">{lines.length}</p>
          </div>
        </div>
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-[#6b7280]">
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 font-semibold">Description</th>
              <th className="py-2 text-right font-semibold">Amount</th>
              <th className="hidden py-2 text-right font-semibold sm:table-cell">Balance</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-[#f3f4f6]">
                <td className="py-2 pr-2">{formatLong(line.date)}</td>
                <td className="py-2 pr-2">{line.description}</td>
                <td className="py-2 text-right tabular">{formatMoney(line.amount, { sign: true })}</td>
                <td className="hidden py-2 text-right tabular sm:table-cell">{formatMoney(line.after)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-[11px] leading-relaxed text-[#8b939c]">Preview statement generated in the browser. Not an official Chase document.</p>
      </article>
    </div>
  );
}

function lastDay(key: string) {
  const [y, m] = key.split("-").map(Number);
  return isoDate(new Date(y, m, 0));
}

export function MessagesPage({ state, setState, toast }: ViewProps) {
  const [active, setActive] = useState(state.messages[0]?.id || "");
  const [body, setBody] = useState("");
  const message = state.messages.find((m) => m.id === active) || state.messages[0];

  useEffect(() => {
    if (!message || !message.unread) return;
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === message.id ? { ...m, unread: false } : m)),
    }));
  }, [message?.id]);

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Messages</h1>
      <div className="mt-4 grid overflow-hidden rounded-md border border-[#e6e8eb] bg-white lg:grid-cols-[300px_1fr]">
        <div className="max-h-[640px] overflow-auto border-b border-[#eef0f2] lg:border-b-0 lg:border-r">
          {state.messages.map((m) => (
            <button key={m.id} onClick={() => setActive(m.id)} className={cn("block w-full border-b border-[#f4f5f6] px-4 py-3 text-left", active === m.id && "bg-[#f4f8fc]")}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{m.from}</span>
                {m.unread && <span className="h-2 w-2 rounded-full bg-[#117ACA]" />}
              </span>
              <span className="mt-0.5 block truncate text-sm">{m.subject}</span>
              <span className="text-xs text-[#6b7280]">{formatLong(m.date.slice(0, 10))}</span>
            </button>
          ))}
        </div>
        <div className="p-5">
          {message && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7340]">{message.role}</p>
              <h2 className="mt-1 text-xl font-semibold">{message.subject}</h2>
              <p className="text-xs text-[#6b7280]">{message.from} · {formatLong(message.date.slice(0, 10))}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#24303a]">{message.body}</p>
            </>
          )}
          <form
            className="mt-6 border-t border-[#f0f2f4] pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!body.trim()) return;
              const text = body.trim();
              setState((s) => ({
                ...s,
                messages: [
                  {
                    id: uid("sent"),
                    from: "You",
                    role: "Sent",
                    subject: "Note to Maya Chen",
                    body: text,
                    date: todayISO(),
                    unread: false,
                    folder: "sent",
                  },
                  ...s.messages,
                ],
              }));
              setBody("");
              toast("Message sent.");
              window.setTimeout(() => {
                setState((s) => ({
                  ...s,
                  messages: [
                    {
                      id: uid("reply"),
                      from: "Maya Chen",
                      role: "Private Client Banker",
                      subject: "Re: your note",
                      body: `Thanks ${s.profile.firstName} — I have this and will follow up before the Lincoln Park branch closes. — Maya`,
                      date: todayISO(),
                      unread: true,
                      folder: "inbox",
                    },
                    ...s.messages,
                  ],
                }));
              }, 1100);
            }}
          >
            <label className="text-sm font-semibold">Message Maya</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-2 h-24 w-full rounded border border-[#d5dbe1] p-3 text-sm outline-none focus:border-[#117ACA]" placeholder="Ask about the CD, a wire, or your mortgage." />
            <PrimaryButton type="submit" className="mt-2">
              Send
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage({ state, setState, toast }: ViewProps) {
  const [profile, setProfile] = useState(state.profile);
  function set<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <Panel className="flex flex-col items-center p-5 text-center">
        <img
          src="https://images.pexels.com/photos/19098114/pexels-photo-19098114.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400"
          alt="Jedidiah Cole"
          className="h-28 w-28 rounded-full object-cover"
        />
        <h1 className="mt-3 text-lg font-semibold">
          {state.profile.firstName} {state.profile.lastName}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7340]">Private Client since 2016</p>
        <p className="mt-2 text-xs text-[#6b7280]">Username jedidiah1</p>
      </Panel>
      <Panel className="p-5">
        <h2 className="text-xl font-semibold">Profile & settings</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setState((s) => ({ ...s, profile }));
            toast("Profile saved on this device.");
          }}
        >
          {(
            [
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["email", "Email"],
              ["phone", "Mobile"],
              ["address1", "Street"],
              ["address2", "Unit"],
              ["city", "City"],
              ["state", "State"],
              ["zip", "ZIP"],
              ["employer", "Employer"],
              ["job", "Role"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input className={fieldClass} value={profile[key]} onChange={(e) => set(key, e.target.value)} />
            </Field>
          ))}
          <div className="sm:col-span-2">
            <PrimaryButton type="submit">Save profile</PrimaryButton>
          </div>
        </form>
        <p className="mt-4 text-xs leading-relaxed text-[#6b7280]">Customer ID JPC-4492817 · Branch Lincoln Park, 2000 N Halsted. Username can’t be changed. Date of birth on file: {state.profile.dob}.</p>
      </Panel>
    </div>
  );
}

export function ProductsPage({ state, go }: ViewProps) {
  const owned = new Set(["Private Client Checking", "Premier Savings", "Sapphire Preferred", "Freedom Unlimited", "Mortgage", "Auto loan", "Self-Directed"]);
  const products = [
    { name: "Private Client Checking", body: "The account your payroll already uses.", view: { name: "account", id: "chk" } as View },
    { name: "Premier Savings", body: "Linked for overdraft protection.", view: { name: "account", id: "sav" } as View },
    { name: "Sapphire Preferred", body: "Dining and travel points.", view: { name: "cards" } as View },
    { name: "Freedom Unlimited", body: "Everyday cash back.", view: { name: "cards" } as View },
    { name: "9-month CD", body: "Ask Maya before Friday’s sample special ends.", view: { name: "messages" } as View },
    { name: "Self-Directed", body: "ETFs and sweep cash.", view: { name: "account", id: "inv" } as View },
    { name: "Mortgage", body: "1847 N Halsted, 6.125% sample rate.", view: { name: "account", id: "mtg" } as View },
    { name: "Auto loan", body: "2023 BMW X3 payment on the 15th.", view: { name: "account", id: "aut" } as View },
  ];
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Explore products</h1>
      <p className="mt-1 max-w-2xl text-sm text-[#5c6770]">A relationship snapshot for {state.profile.firstName}. Offers are illustrative and not applications.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <button key={product.name} onClick={() => go(product.view)} className="rounded-md border border-[#e6e8eb] bg-white p-4 text-left hover:border-[#117ACA]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#117ACA]">{owned.has(product.name) ? "You have this" : "Available to discuss"}</span>
            <h2 className="mt-1 font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-[#5c6770]">{product.body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

const ARTICLES: { title: string; body: string; view: View }[] = [
  { title: "Transfer between your accounts", body: "Choose From, To, and an amount, then review. Scheduled dates don’t move money until you pay them from Pay bills.", view: { name: "pay", tab: "transfer" } },
  { title: "Send with Zelle", body: "Preview limits are $2,000 per send and $5,000 per day. Add a recipient with a name and email or mobile number.", view: { name: "pay", tab: "zelle" } },
  { title: "Deposit a check", body: "Capture is simulated. Deposits up to $5,000 post as pending and increase the available balance immediately in this preview.", view: { name: "deposit" } },
  { title: "Lock or replace a card", body: "Lock stops new purchases in the preview. Report lost locks the card and files a message. No card is mailed.", view: { name: "cards" } },
  { title: "Dispute a charge", body: "Open an account, choose Dispute on a posted transaction, and submit a reason. Status shows as in review.", view: { name: "accounts" } },
  { title: "Turn on 2-step verification", body: "Security & privacy can require code 739184 at the next sign-in. The code is shown on the verify screen.", view: { name: "security" } },
];

export function HelpPage({ go }: ViewProps) {
  const [q, setQ] = useState("");
  const items = ARTICLES.filter((a) => `${a.title} ${a.body}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[28px] font-semibold tracking-tight">How can we help?</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search help" className={`${fieldClass} mt-4`} />
      <div className="mt-4 space-y-3">
        {items.map((article) => (
          <article key={article.title} className="rounded-md border border-[#e6e8eb] bg-white p-4">
            <h2 className="font-semibold">{article.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#4b5560]">{article.body}</p>
            <button className="mt-2 text-sm font-semibold text-[#117ACA]" onClick={() => go(article.view)}>
              Go there
            </button>
          </article>
        ))}
        {items.length === 0 && <p className="text-sm text-[#6b7280]">No articles match. Try “Zelle” or “card”.</p>}
      </div>
    </div>
  );
}

export function BranchesPage({ branches }: { branches: Branch[] }) {
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">ATMs & branches</h1>
      <p className="mt-1 text-sm text-[#5c6770]">Sample locations near 1847 N Halsted. Hours are illustrative.</p>
      <div className="mt-4 grid gap-3">
        {branches.map((b) => (
          <Panel key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[#117ACA]">{b.name}</h2>
                <p className="text-sm">{b.address}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{b.hours}</p>
              </div>
              <span className="text-sm font-semibold text-[#6b7280]">{b.distance}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
