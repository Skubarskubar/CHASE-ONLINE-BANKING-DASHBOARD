import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon, Modal, Panel, Toast } from "@/components/ui";
import { BRANCHES, HOLDINGS, displayBalance, ledgerBalance, positionsValue, txnsFor } from "@/data";
import { BranchesPage, CardsPage, DepositPage, HelpPage, MessagesPage, PayPage, PlanPage, ProductsPage, ProfilePage, SecurityPage, StatementPage, StatementsPage } from "@/banking/pages";
import { Avatar, Money, ViewProps, balanceCaption, downloadCsv, findAccount, headline } from "@/banking/shared";
import { catColor, daysUntil, formatDateTime, formatLong, formatMoney, greeting, marketOpen, nextDue } from "@/lib/format";
import type { BankState, View } from "@/types";
import { cn } from "@/utils/cn";

const NAV: { label: string; view: View }[] = [
  { label: "Accounts", view: { name: "accounts" } },
  { label: "Pay & transfer", view: { name: "pay", tab: "transfer" } },
  { label: "Collect & deposit", view: { name: "deposit" } },
  { label: "Plan & track", view: { name: "plan" } },
  { label: "Cards", view: { name: "cards" } },
  { label: "Security & privacy", view: { name: "security" } },
  { label: "Explore products", view: { name: "products" } },
];

function activeNav(view: View, item: View) {
  if (item.name === "pay") return view.name === "pay";
  return view.name === item.name;
}

export default function BankingApp({
  state,
  setState,
  onSignOut,
}: {
  state: BankState;
  setState: React.Dispatch<React.SetStateAction<BankState>>;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<View>({ name: "accounts" });
  const [hidden, setHidden] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }

  function go(next: View) {
    setView(next);
    setProfileOpen(false);
    setAlertsOpen(false);
    setSearchOpen(false);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const titles: Record<string, string> = {
      accounts: "Accounts",
      account: "Account details",
      pay: "Pay & transfer",
      deposit: "Deposit",
      cards: "Cards",
      plan: "Plan & track",
      security: "Security & privacy",
      statements: "Statements",
      statement: "Statement",
      messages: "Messages",
      profile: "Profile & settings",
      products: "Explore products",
      help: "Help",
      branches: "ATMs & branches",
    };
    document.title = `${titles[view.name] || "Accounts"} | Chase Online`;
  }, [view]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setAlertsOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unread = state.messages.filter((m) => m.unread && m.folder === "inbox").length;
  const props: ViewProps = { state, setState, go, toast: notify, hidden };
  const viewKey =
    view.name === "account"
      ? `account-${view.id}`
      : view.name === "statement"
        ? `statement-${view.accountId}-${view.month}`
        : view.name === "pay"
          ? `pay-${view.tab || "transfer"}`
          : view.name;

  return (
    <div className="min-h-screen bg-[#f3f5f7] text-[#1b1e22]">
      <div className="no-print h-1 bg-gradient-to-r from-[#8a7340] via-[#e4cf8a] to-[#8a7340]" />
      <header className="no-print sticky top-0 z-40 border-b border-[#e6e8eb] bg-white">
        {(profileOpen || alertsOpen) && (
          <button className="fixed inset-0 z-30 cursor-default" aria-label="Close menu" onClick={() => { setProfileOpen(false); setAlertsOpen(false); }} />
        )}
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4">
          <button onClick={() => go({ name: "accounts" })} aria-label="Accounts home">
            <Logo iconClass="h-7 w-7" wordClass="text-[22px]" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-2 hidden h-10 flex-1 items-center gap-2 rounded-full border border-[#d5dbe1] bg-[#f7f8f9] px-4 text-left text-sm text-[#6b7280] md:flex md:max-w-md"
          >
            <Icon.search className="h-4 w-4" />
            How can we help?
            <span className="ml-auto hidden text-[11px] font-semibold text-[#98a2ab] lg:inline">Ctrl K</span>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <IconButton label="Search" className="md:hidden" onClick={() => setSearchOpen(true)}>
              <Icon.search className="h-5 w-5" />
            </IconButton>
            <IconButton label="Help" onClick={() => go({ name: "help" })}>
              <Icon.help className="h-5 w-5" />
            </IconButton>
            <IconButton label="Messages" onClick={() => go({ name: "messages" })}>
              <Icon.mail className="h-5 w-5" />
              {unread > 0 && <Badge n={unread} />}
            </IconButton>
            <div className="relative">
              <IconButton
                label="Alerts"
                onClick={() => {
                  setAlertsOpen((v) => !v);
                  setProfileOpen(false);
                }}
              >
                <Icon.bell className="h-5 w-5" />
                {unread > 0 && <Badge n={unread} />}
              </IconButton>
              {alertsOpen && (
                <div className="pop absolute right-0 top-11 z-50 w-80 rounded-md border border-[#e6e8eb] bg-white p-2 shadow-2xl">
                  <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Alerts</p>
                  {state.messages.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      className="block w-full rounded px-2 py-2 text-left hover:bg-[#f4f8fc]"
                      onClick={() => go({ name: "messages" })}
                    >
                      <span className="block text-sm font-semibold">{m.subject}</span>
                      <span className="block text-xs text-[#6b7280]">{m.from} · {formatLong(m.date)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-[#f4f6f8]"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setAlertsOpen(false);
                }}
              >
                <Avatar className="h-8 w-8 rounded-full" />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-tight">{state.profile.firstName} C.</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8a7340]">Private Client</span>
                </span>
                <Icon.down className="h-4 w-4 text-[#5c6770]" />
              </button>
              {profileOpen && (
                <div className="pop absolute right-0 top-12 z-50 w-60 rounded-md border border-[#e6e8eb] bg-white p-1.5 shadow-2xl">
                  {[
                    ["Profile & settings", { name: "profile" } as View],
                    ["Statements", { name: "statements" } as View],
                    ["Security & privacy", { name: "security" } as View],
                    ["Messages", { name: "messages" } as View],
                    ["ATMs & branches", { name: "branches" } as View],
                  ].map(([label, target]) => (
                    <button key={label as string} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#f4f8fc]" onClick={() => go(target as View)}>
                      {label as string}
                    </button>
                  ))}
                  <button className="mt-1 block w-full rounded px-3 py-2 text-left text-sm font-semibold text-[#9b1c1c] hover:bg-[#fdf2f2]" onClick={() => setSignOutOpen(true)}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
            <IconButton label="Menu" className="lg:hidden" onClick={() => setNavOpen((v) => !v)}>
              <Icon.menu className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
        <div className="bg-[#117ACA] text-white">
          <div className="nav-scroll mx-auto flex h-11 max-w-[1180px] items-stretch gap-1 overflow-x-auto px-2">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.view)}
                className={cn(
                  "shrink-0 border-b-2 border-transparent px-3 text-sm font-semibold hover:bg-white/10",
                  activeNav(view, item.view) && "border-white bg-white/10",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {navOpen && (
          <div className="border-t border-[#e8eef5] bg-white p-3 lg:hidden">
            {NAV.map((item) => (
              <button key={item.label} className="block w-full py-2 text-left text-sm font-semibold" onClick={() => go(item.view)}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-6">
        <div key={viewKey} className="rise">
          {view.name === "accounts" && <Dashboard {...props} setHidden={setHidden} />}
          {view.name === "account" && <AccountDetail {...props} id={view.id} />}
          {view.name === "pay" && <PayPage {...props} initialTab={view.tab} />}
          {view.name === "deposit" && <DepositPage {...props} />}
          {view.name === "cards" && <CardsPage {...props} />}
          {view.name === "plan" && <PlanPage {...props} />}
          {view.name === "security" && <SecurityPage {...props} />}
          {view.name === "statements" && <StatementsPage {...props} />}
          {view.name === "statement" && <StatementPage {...props} accountId={view.accountId} month={view.month} />}
          {view.name === "messages" && <MessagesPage {...props} />}
          {view.name === "profile" && <ProfilePage {...props} />}
          {view.name === "products" && <ProductsPage {...props} />}
          {view.name === "help" && <HelpPage {...props} />}
          {view.name === "branches" && <BranchesPage branches={BRANCHES} />}
        </div>
      </main>

      <footer className="no-print border-t border-[#e6e8eb] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-[#6b7280]">
          <span>Chase Online preview · {state.profile.firstName} {state.profile.lastName}</span>
          <span>Independent demo. Not JPMorgan Chase. No payment leaves this browser.</span>
        </div>
      </footer>

      {searchOpen && (
        <SearchModal
          state={state}
          query={query}
          setQuery={setQuery}
          onClose={() => setSearchOpen(false)}
          go={go}
        />
      )}
      <Modal open={signOutOpen} title="Sign out?" onClose={() => setSignOutOpen(false)}>
        <p className="text-sm leading-relaxed text-[#4b5560]">You’ll return to the Chase.com preview. Your balances stay on this device until you reset demo data.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="h-10 rounded px-4 text-sm font-semibold text-[#117ACA]" onClick={() => setSignOutOpen(false)}>
            Cancel
          </button>
          <button
            className="h-10 rounded bg-[#117ACA] px-4 text-sm font-semibold text-white"
            onClick={() => {
              setSignOutOpen(false);
              onSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      </Modal>
      <Toast message={toast} />
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button aria-label={label} onClick={onClick} className={cn("relative rounded-full p-2 text-[#33404c] hover:bg-[#f2f5f7]", className)}>
      {children}
    </button>
  );
}

function Badge({ n }: { n: number }) {
  return <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c41230] px-1 text-[10px] font-bold text-white">{n}</span>;
}

function Dashboard({ setHidden, ...props }: ViewProps & { setHidden: (value: boolean) => void }) {
  const { state, go, hidden, setState, toast } = props;
  const groups = ["Bank accounts", "Credit cards", "Loans", "Investments"] as const;
  const open = marketOpen();
  const day = HOLDINGS.reduce((s, h) => s + h.shares * (h.price - h.prevClose), 0);
  const [offerOpen, setOfferOpen] = useState(false);
  const sapphire = findAccount(state, "sap")!;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101820]">
              {greeting()}, {state.profile.firstName}
            </h1>
            <p className="mt-1 text-sm text-[#5c6770]">
              {state.lastSignIn ? `Last sign-in ${formatDateTime(state.lastSignIn)}` : "First visit in this browser session"}
              {" · "}
              Lincoln Park
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#117ACA]"
          >
            {hidden ? <Icon.eye className="h-4 w-4" /> : <Icon.eyeOff className="h-4 w-4" />}
            {hidden ? "Show balances" : "Hide balances"}
          </button>
        </div>
        <Panel>
          {groups.map((group) => {
            const accounts = state.accounts.filter((a) => a.group === group);
            return (
              <div key={group}>
                <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b7280]">{group}</h2>
                  <span className="text-xs font-semibold text-[#8b939c]">{group === "Credit cards" ? "Current balance" : group === "Loans" ? "Remaining" : group === "Investments" ? "Market value" : "Available balance"}</span>
                </div>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => go({ name: "account", id: account.id })}
                    className="flex w-full items-center gap-4 border-b border-[#f2f4f6] px-5 py-4 text-left hover:bg-[#f5f9fc]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f3fb] text-[#117ACA]">
                      {account.id === "aut" ? <Icon.car className="h-5 w-5" /> : account.kind === "credit" ? <Icon.card className="h-5 w-5" /> : account.kind === "invest" ? <Icon.chart className="h-5 w-5" /> : <Icon.home className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[#117ACA]">
                        {account.nickname || account.name} <span className="font-medium text-[#6b7280]">(...{account.mask})</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-[#6b7280]">
                        {balanceCaption(account)}
                        {account.kind === "credit" && account.dueDay ? ` · Due ${formatLong(nextDue(account.dueDay))}` : ""}
                        {account.kind === "loan" && account.dueDay ? ` · Payment due ${formatLong(nextDue(account.dueDay))}` : ""}
                        {account.kind === "invest" ? ` · ${open ? "Market open" : "Market closed"}` : ""}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-lg font-semibold">
                        <Money value={headline(account, state)} hidden={hidden} />
                      </span>
                      {account.kind === "invest" && (
                        <span className={cn("text-xs font-semibold", day >= 0 ? "text-[#0b7a3b]" : "text-[#b42318]")}>
                          {formatMoney(day, { sign: true, hidden })} today
                        </span>
                      )}
                      {account.kind === "credit" && (
                        <span className="text-xs text-[#6b7280]">of {formatMoney(account.limit || 0, { hidden })}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </Panel>
      </div>
      <aside className="space-y-4">
        <Panel className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#102033] to-[#1d4e89] p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e4cf8a]">Your banker</p>
            <p className="mt-2 text-lg font-semibold">Maya Chen</p>
            <p className="text-sm text-white/75">Private Client · Lincoln Park</p>
            <button onClick={() => go({ name: "messages" })} className="mt-4 h-9 rounded bg-white px-3 text-sm font-semibold text-[#102033]">
              Message Maya
            </button>
          </div>
        </Panel>
        <Panel className="p-4">
          <h2 className="text-sm font-semibold">Coming up</h2>
          <ul className="mt-3 space-y-3">
            {state.scheduled
              .slice()
              .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
              .map((item) => {
                const days = daysUntil(item.nextDate);
                return (
                  <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-[#6b7280]">
                        {formatLong(item.nextDate)} · {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                      </p>
                    </div>
                    <span className="tabular font-semibold">{formatMoney(item.amount, { hidden })}</span>
                  </li>
                );
              })}
          </ul>
          <button onClick={() => go({ name: "pay", tab: "bill" })} className="mt-3 text-sm font-semibold text-[#117ACA]">
            Pay a bill
          </button>
        </Panel>
        <Panel className="p-4">
          <h2 className="text-sm font-semibold">Things you can do</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["Transfer", { name: "pay", tab: "transfer" } as View],
              ["Zelle", { name: "pay", tab: "zelle" } as View],
              ["Deposit", { name: "deposit" } as View],
              ["Statements", { name: "statements" } as View],
            ].map(([label, target]) => (
              <button key={label as string} onClick={() => go(target as View)} className="rounded border border-[#e1e6ea] px-2 py-2.5 text-sm font-semibold text-[#117ACA] hover:bg-[#f4f8fc]">
                {label as string}
              </button>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7340]">For you</p>
          <h3 className="mt-1 font-semibold">Raise your Sapphire limit</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#5c6770]">
            Based on this preview profile, a line of {formatMoney(28000)} is available. Current limit {formatMoney(sapphire.limit || 0)}.
          </p>
          <button onClick={() => setOfferOpen(true)} className="mt-3 text-sm font-semibold text-[#117ACA]">
            Review offer
          </button>
        </Panel>
      </aside>
      <Modal open={offerOpen} title="Credit line increase" onClose={() => setOfferOpen(false)}>
        <p className="text-sm leading-relaxed text-[#4b5560]">
          This preview can raise Sapphire Preferred from {formatMoney(sapphire.limit || 0)} to $28,000. No credit bureau is contacted.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="h-10 px-3 text-sm font-semibold text-[#117ACA]" onClick={() => setOfferOpen(false)}>
            Not now
          </button>
          <button
            className="h-10 rounded bg-[#117ACA] px-4 text-sm font-semibold text-white"
            onClick={() => {
              setState((s) => ({
                ...s,
                accounts: s.accounts.map((a) => (a.id === "sap" ? { ...a, limit: 28000 } : a)),
              }));
              setOfferOpen(false);
              toast("Sapphire Preferred limit is now $28,000 in this preview.");
            }}
          >
            Accept increase
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SearchModal({
  state,
  query,
  setQuery,
  onClose,
  go,
}: {
  state: BankState;
  query: string;
  setQuery: (v: string) => void;
  onClose: () => void;
  go: (view: View) => void;
}) {
  const q = query.trim().toLowerCase();
  const actions: { label: string; hint: string; view: View }[] = [
    { label: "Transfer money", hint: "Between your accounts", view: { name: "pay", tab: "transfer" } },
    { label: "Pay a bill", hint: "ComEd, rent, and more", view: { name: "pay", tab: "bill" } },
    { label: "Send with Zelle", hint: "People you know", view: { name: "pay", tab: "zelle" } },
    { label: "Deposit a check", hint: "Mobile deposit preview", view: { name: "deposit" } },
    { label: "Lock a card", hint: "Debit, Sapphire, Freedom", view: { name: "cards" } },
    { label: "Spending plan", hint: "Last 30 days", view: { name: "plan" } },
    { label: "Statements", hint: "Download activity", view: { name: "statements" } },
    { label: "Security center", hint: "Password and alerts", view: { name: "security" } },
  ];
  const accounts = state.accounts.filter((a) => `${a.name} ${a.mask}`.toLowerCase().includes(q));
  const txns = state.transactions.filter((t) => t.description.toLowerCase().includes(q)).slice(0, 6);
  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q));
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[#101820]/45 p-4 pt-[12vh]">
      <button className="absolute inset-0" aria-label="Close search" onClick={onClose} />
      <div className="pop relative z-10 w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#eef0f2] px-4">
          <Icon.search className="h-5 w-5 text-[#6b7280]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts, activity, or actions"
            className="h-12 w-full text-sm outline-none"
          />
        </div>
        <div className="max-h-[420px] overflow-auto p-2">
          {(q ? filteredActions : actions.slice(0, 5)).map((action) => (
            <button key={action.label} className="flex w-full items-center justify-between rounded px-3 py-2.5 text-left hover:bg-[#f4f8fc]" onClick={() => go(action.view)}>
              <span>
                <span className="block text-sm font-semibold">{action.label}</span>
                <span className="text-xs text-[#6b7280]">{action.hint}</span>
              </span>
              <Icon.chevron className="h-4 w-4 text-[#98a2ab]" />
            </button>
          ))}
          {q && accounts.length > 0 && <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-[#8b939c]">Accounts</p>}
          {q &&
            accounts.map((a) => (
              <button key={a.id} className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-[#f4f8fc]" onClick={() => go({ name: "account", id: a.id })}>
                <span className="font-semibold text-[#117ACA]">{a.name}</span>
                <span className="tabular">{formatMoney(displayBalance(a, state))}</span>
              </button>
            ))}
          {q && txns.length > 0 && <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-[#8b939c]">Activity</p>}
          {q &&
            txns.map((t) => (
              <button key={t.id} className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-[#f4f8fc]" onClick={() => go({ name: "account", id: t.accountId })}>
                <span>
                  <span className="block font-medium">{t.description}</span>
                  <span className="text-xs text-[#6b7280]">{formatLong(t.date)}</span>
                </span>
                <span className="tabular">{formatMoney(t.amount, { sign: true })}</span>
              </button>
            ))}
          {q && !accounts.length && !txns.length && !filteredActions.length && (
            <p className="px-3 py-6 text-sm text-[#6b7280]">No matches. Try “Zelle”, “Whole Foods”, or “Sapphire”.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountDetail({ id, state, setState, go, toast, hidden }: ViewProps & { id: string }) {
  const account = findAccount(state, id);
  const [q, setQ] = useState("");
  const [range, setRange] = useState<"30" | "90" | "365" | "all">("90");
  const [filter, setFilter] = useState<"all" | "in" | "out" | "pending">("all");
  const [showNumber, setShowNumber] = useState(false);
  const [nick, setNick] = useState(account?.nickname || "");
  const [editing, setEditing] = useState(false);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [reason, setReason] = useState("I don’t recognize this");
  const [detail, setDetail] = useState("");

  if (!account) {
    return (
      <Panel className="p-8">
        <p>We can’t find that account.</p>
        <button className="mt-3 text-sm font-semibold text-[#117ACA]" onClick={() => go({ name: "accounts" })}>
          Back to accounts
        </button>
      </Panel>
    );
  }

  const rows = txnsFor(state, account.id).filter((t) => {
    if (range !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(range));
      const [y, m, d] = t.date.split("-").map(Number);
      if (new Date(y, m - 1, d) < cutoff) return false;
    }
    if (q && !t.description.toLowerCase().includes(q.toLowerCase())) return false;
    const inflow = account.kind === "credit" || account.kind === "loan" ? t.amount < 0 : t.amount > 0;
    if (filter === "in" && !inflow) return false;
    if (filter === "out" && inflow) return false;
    if (filter === "pending" && t.status !== "pending") return false;
    return true;
  });

  let running = account.kind === "invest" ? 0 : headline(account, state);
  const withBal = rows.map((t) => {
    const after = running;
    if (account.kind !== "invest") running = Math.round((running - t.amount) * 100) / 100;
    return { ...t, after };
  });

  const disputed = new Set(state.disputes.map((d) => d.txnId));

  return (
    <div>
      <button onClick={() => go({ name: "accounts" })} className="text-sm font-semibold text-[#117ACA]">
        ← Accounts
      </button>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7340]">{account.product}</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#101820]">{account.nickname || account.name}</h1>
          <p className="text-sm text-[#6b7280]">
            ...{account.mask} · Opened {account.opened}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{balanceCaption(account)}</p>
          <p className="text-4xl font-semibold tracking-tight tabular">
            <Money value={headline(account, state)} hidden={hidden} />
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
        {account.kind === "invest" && (
          <Panel className="overflow-x-auto p-4">
            <h2 className="px-1 font-semibold">Holdings</h2>
            <table className="mt-2 w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[#6b7280]">
                <tr>
                  <th className="py-2 font-semibold">Symbol</th>
                  <th className="py-2 font-semibold">Shares</th>
                  <th className="py-2 text-right font-semibold">Price</th>
                  <th className="py-2 text-right font-semibold">Value</th>
                  <th className="py-2 text-right font-semibold">Today</th>
                </tr>
              </thead>
              <tbody>
                {HOLDINGS.map((h) => {
                  const change = (h.price - h.prevClose) * h.shares;
                  return (
                    <tr key={h.symbol} className="border-t border-[#f3f4f6]">
                      <td className="py-2">
                        <span className="font-semibold">{h.symbol}</span>
                        <span className="mt-0.5 block text-xs text-[#6b7280]">{h.name}</span>
                      </td>
                      <td className="py-2 tabular">{h.shares}</td>
                      <td className="py-2 text-right tabular">{formatMoney(h.price)}</td>
                      <td className="py-2 text-right font-semibold tabular">{formatMoney(h.shares * h.price, { hidden })}</td>
                      <td className={cn("py-2 text-right font-semibold tabular", change >= 0 ? "text-[#0b7a3b]" : "text-[#b42318]")}>{formatMoney(change, { sign: true, hidden })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        )}
        <Panel className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity" className="h-10 flex-1 rounded border border-[#d5dbe1] px-3 text-sm outline-none focus:border-[#117ACA]" />
            <select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="h-10 rounded border border-[#d5dbe1] px-2 text-sm">
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">12 months</option>
              <option value="all">All</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["all", "in", "out", "pending"] as const).map((key) => (
              <button key={key} onClick={() => setFilter(key)} className={cn("h-8 rounded-full px-3 text-xs font-semibold", filter === key ? "bg-[#117ACA] text-white" : "bg-[#f2f4f6] text-[#3c4450]")}>
                {key === "all" ? "All" : key === "in" ? "Money in" : key === "out" ? "Money out" : "Pending"}
              </button>
            ))}
            <button
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#117ACA]"
              onClick={() => {
                downloadCsv(`${account.mask}-activity.csv`, [
                  ["Date", "Description", "Amount", "Category", "Status"],
                  ...withBal.map((t) => [t.date, t.description, t.amount.toFixed(2), t.category, t.status]),
                ]);
                toast("Activity download started.");
              }}
            >
              <Icon.download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <div className="mt-2">
            {withBal.length === 0 && <p className="py-10 text-center text-sm text-[#6b7280]">No activity matches those filters.</p>}
            {withBal.map((t) => {
              const inflow = account.kind === "credit" || account.kind === "loan" ? t.amount < 0 : t.amount > 0;
              return (
                <div key={t.id} className="grid grid-cols-[88px_1fr_auto] items-center gap-3 border-b border-[#f3f4f6] py-3 text-sm md:grid-cols-[110px_1fr_120px_110px]">
                  <div className="text-xs text-[#6b7280]">{formatLong(t.date)}</div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.description}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: catColor(t.category) }} />
                      {t.category}
                      {t.status === "pending" && <span className="rounded bg-[#fff6e8] px-1.5 py-0.5 font-semibold text-[#9a6700]">Pending</span>}
                      {disputed.has(t.id) && <span className="rounded bg-[#fdecec] px-1.5 py-0.5 font-semibold text-[#9b1c1c]">In review</span>}
                      {t.status === "posted" && account.kind !== "invest" && (
                        <button className="font-semibold text-[#117ACA]" onClick={() => setDisputeId(t.id)}>
                          Dispute
                        </button>
                      )}
                    </p>
                  </div>
                  <div className={cn("text-right font-semibold tabular", inflow ? "text-[#0b7a3b]" : "text-[#1b1e22]")}>
                    {formatMoney(t.amount, { sign: true })}
                  </div>
                  <div className="hidden text-right text-[#5c6770] tabular md:block">{account.kind === "invest" ? "—" : formatMoney(t.after)}</div>
                </div>
              );
            })}
          </div>
        </Panel>
        </div>
        <div className="space-y-4">
          <Panel className="p-4 text-sm">
            <h2 className="font-semibold">Account tools</h2>
            {account.kind === "deposit" && (
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between"><dt className="text-[#6b7280]">Routing</dt><dd className="font-semibold tabular">{account.routing}</dd></div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#6b7280]">Account</dt>
                  <dd className="font-semibold tabular">{showNumber ? account.number : `••••${account.mask}`}</dd>
                </div>
                <button className="font-semibold text-[#117ACA]" onClick={() => setShowNumber((v) => !v)}>
                  {showNumber ? "Hide number" : "Show number"}
                </button>
                <p className="text-xs leading-relaxed text-[#6b7280]">Sample routing and account numbers for this preview. They are not live deposit instructions.</p>
              </dl>
            )}
            {account.kind === "credit" && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between"><span className="text-[#6b7280]">Available credit</span><span className="font-semibold tabular">{formatMoney((account.limit || 0) - ledgerBalance(account, state.transactions), { hidden })}</span></div>
                <div className="flex justify-between"><span className="text-[#6b7280]">Credit limit</span><span className="font-semibold tabular">{formatMoney(account.limit || 0, { hidden })}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#eef1f4]">
                  <div className="h-full rounded-full bg-[#117ACA]" style={{ width: `${Math.min(100, (ledgerBalance(account, state.transactions) / (account.limit || 1)) * 100)}%` }} />
                </div>
                <p className="text-xs text-[#6b7280]">APR {account.apr} · Min due {formatMoney(account.minPayment || 0)} on {account.dueDay ? formatLong(nextDue(account.dueDay)) : "—"}</p>
                <button className="font-semibold text-[#117ACA]" onClick={() => go({ name: "pay", tab: "transfer" })}>Make a payment</button>
              </div>
            )}
            {account.kind === "loan" && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between"><span className="text-[#6b7280]">Rate</span><span className="font-semibold">{account.apr}</span></div>
                <div className="flex justify-between"><span className="text-[#6b7280]">Next payment</span><span className="font-semibold tabular">{formatMoney(account.payment || 0)}</span></div>
                {account.id === "mtg" && <p className="text-xs leading-relaxed text-[#6b7280]">Sample split: $812.40 principal, $2,034.71 interest, $367.44 escrow.</p>}
                {account.id === "aut" && <p className="text-xs leading-relaxed text-[#6b7280]">2023 BMW X3 xDrive30i. Sample split: $314.80 principal, $174.53 interest.</p>}
                <button className="font-semibold text-[#117ACA]" onClick={() => go({ name: "pay", tab: "transfer" })}>Pay this loan</button>
              </div>
            )}
            {account.kind === "invest" && <InvestSide state={state} hidden={hidden} />}
            <div className="mt-4 border-t border-[#f0f2f4] pt-3">
              {editing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setState((s) => ({
                      ...s,
                      accounts: s.accounts.map((a) => (a.id === account.id ? { ...a, nickname: nick.trim() || undefined } : a)),
                    }));
                    setEditing(false);
                    toast("Nickname saved.");
                  }}
                >
                  <input value={nick} onChange={(e) => setNick(e.target.value)} className="h-10 w-full rounded border border-[#d5dbe1] px-3 text-sm" placeholder="Nickname" />
                  <button className="mt-2 text-sm font-semibold text-[#117ACA]">Save nickname</button>
                </form>
              ) : (
                <button className="text-sm font-semibold text-[#117ACA]" onClick={() => setEditing(true)}>
                  {account.nickname ? "Edit nickname" : "Add a nickname"}
                </button>
              )}
            </div>
          </Panel>
          <Panel className="p-4 text-sm">
            <button className="font-semibold text-[#117ACA]" onClick={() => go({ name: "statements" })}>See statements</button>
            <p className="mt-2 text-xs text-[#6b7280]">{account.detail}</p>
          </Panel>
        </div>
      </div>

      <Modal open={!!disputeId} title="Dispute a transaction" onClose={() => setDisputeId(null)}>
        <p className="text-sm text-[#4b5560]">Tell us what looks wrong. This stays inside the preview and marks the transaction as in review.</p>
        <label className="mt-4 block text-sm font-semibold">Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-11 w-full rounded border border-[#c5ccd3] px-2 text-sm">
          {["I don’t recognize this", "I was charged more than once", "I didn’t receive the merchandise", "The amount is wrong"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <label className="mt-3 block text-sm font-semibold">Details</label>
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="mt-1 h-24 w-full rounded border border-[#c5ccd3] p-2 text-sm" placeholder="Optional context" />
        <button
          className="mt-4 h-11 w-full rounded bg-[#117ACA] text-sm font-semibold text-white"
          onClick={() => {
            if (!disputeId) return;
            setState((s) => ({
              ...s,
              disputes: [...s.disputes, { id: `dsp-${Date.now()}`, txnId: disputeId, reason, detail, status: "In review", created: new Date().toISOString() }],
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  from: "Chase Disputes",
                  role: "Servicing",
                  subject: "We received your dispute",
                  body: `Your dispute (${reason}) is in review. A provisional credit is not issued in this preview. Reference DSP-${disputeId.slice(-4).toUpperCase()}.`,
                  date: new Date().toISOString().slice(0, 10),
                  unread: true,
                  folder: "inbox",
                },
                ...s.messages,
              ],
            }));
            setDisputeId(null);
            setDetail("");
            toast("Dispute submitted for review.");
          }}
        >
          Submit dispute
        </button>
      </Modal>
    </div>
  );
}

function InvestSide({ state, hidden }: { state: BankState; hidden: boolean }) {
  const value = positionsValue();
  const day = HOLDINGS.reduce((s, h) => s + h.shares * (h.price - h.prevClose), 0);
  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Positions</span><span className="font-semibold tabular">{formatMoney(value, { hidden })}</span></div>
      <div className="flex justify-between text-sm"><span className="text-[#6b7280]">Sweep cash</span><span className="font-semibold tabular">{formatMoney(state.investCash, { hidden })}</span></div>
      <div className={cn("text-sm font-semibold", day >= 0 ? "text-[#0b7a3b]" : "text-[#b42318]")}>
        {marketOpen() ? "Market open" : "Market closed"} · {formatMoney(day, { sign: true, hidden })} today
      </div>
      <ul className="mt-2 space-y-2">
        {HOLDINGS.map((h) => {
          const ch = h.price - h.prevClose;
          return (
            <li key={h.symbol} className="flex items-center justify-between text-xs">
              <span>
                <span className="font-bold">{h.symbol}</span>
                <span className="ml-1 text-[#6b7280]">{h.shares} sh</span>
              </span>
              <span className={cn("tabular font-semibold", ch >= 0 ? "text-[#0b7a3b]" : "text-[#b42318]")}>{formatMoney(h.shares * h.price, { hidden })}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] leading-relaxed text-[#8b939c]">Quotes are sample figures, not a live market data feed and not a recommendation.</p>
    </div>
  );
}


