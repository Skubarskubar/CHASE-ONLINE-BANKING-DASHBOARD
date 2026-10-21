import { daysAgo, round2, uid } from "@/lib/format";
import type {
  Account,
  BankState,
  Branch,
  Holding,
  Txn,
} from "@/types";

export const USERNAME = "jedidiah1";
export const DEFAULT_PASSWORD = "Love@123";
export const PREVIEW_CODE = "739184";
export const DATA_KEY = "chase-preview-data-v1";
export const SESSION_KEY = "chase-preview-session";

export const HOLDINGS: Holding[] = [
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", shares: 142.5, price: 278.42, prevClose: 278.0, cost: 214.2 },
  { symbol: "AAPL", name: "Apple Inc.", shares: 28, price: 228.16, prevClose: 227.04, cost: 176.4 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 12, price: 428.55, prevClose: 429.39, cost: 342.1 },
  { symbol: "VXUS", name: "Vanguard Total Intl Stock ETF", shares: 80, price: 68.41, prevClose: 68.23, cost: 59.8 },
  { symbol: "SCHD", name: "Schwab US Dividend Equity ETF", shares: 72, price: 83.22, prevClose: 82.91, cost: 71.15 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", shares: 18, price: 248.6, prevClose: 247.15, cost: 168.4 },
];

export const BRANCHES: Branch[] = [
  {
    id: "lp",
    name: "Lincoln Park",
    address: "2000 N Halsted St, Chicago, IL 60614",
    distance: "0.3 mi",
    hours: "Lobby open until 6:00 p.m. · ATM 24 hours",
    atm: true,
    branch: true,
    services: ["Private Client", "Notary", "Instant debit card"],
  },
  {
    id: "gc",
    name: "Gold Coast",
    address: "1200 N State Pkwy, Chicago, IL 60610",
    distance: "1.1 mi",
    hours: "Lobby open until 5:00 p.m. · ATM 24 hours",
    atm: true,
    branch: true,
    services: ["Safe deposit", "Medallion signature"],
  },
  {
    id: "ot",
    name: "Old Town",
    address: "1600 N Wells St, Chicago, IL 60614",
    distance: "0.8 mi",
    hours: "Lobby open until 6:00 p.m. · ATM 24 hours",
    atm: true,
    branch: true,
    services: ["Business banker", "Coin machine"],
  },
  {
    id: "loop",
    name: "Chase Tower",
    address: "10 S Dearborn St, Chicago, IL 60603",
    distance: "3.4 mi",
    hours: "Lobby open until 5:00 p.m. · ATM 24 hours",
    atm: true,
    branch: true,
    services: ["Private Client", "International wires"],
  },
  {
    id: "wp",
    name: "Wicker Park",
    address: "1275 N Milwaukee Ave, Chicago, IL 60622",
    distance: "1.6 mi",
    hours: "ATM only · 24 hours",
    atm: true,
    branch: false,
    services: ["Deposit-taking ATM", "Cardless cash"],
  },
  {
    id: "rv",
    name: "River North",
    address: "444 N Wells St, Chicago, IL 60654",
    distance: "2.2 mi",
    hours: "Lobby open until 6:00 p.m. · ATM 24 hours",
    atm: true,
    branch: true,
    services: ["Home lending specialist"],
  },
];

const ACCOUNTS: Account[] = [
  {
    id: "chk",
    group: "Bank accounts",
    kind: "deposit",
    name: "Chase Private Client Checking",
    product: "Private Client Checking",
    mask: "4821",
    number: "000048217739",
    routing: "071000013",
    opening: 0,
    apy: "0.01%",
    opened: "March 12, 2016",
    detail: "Everyday spending, direct deposit, and bill pay",
  },
  {
    id: "sav",
    group: "Bank accounts",
    kind: "deposit",
    name: "Chase Premier Savings",
    product: "Premier Savings",
    mask: "9034",
    number: "000090348812",
    routing: "071000013",
    opening: 0,
    apy: "0.02%",
    opened: "March 12, 2016",
    detail: "Reserve cash, linked for overdraft protection",
  },
  {
    id: "sap",
    group: "Credit cards",
    kind: "credit",
    name: "Sapphire Preferred",
    product: "Sapphire Preferred",
    mask: "7712",
    number: "4000000000007712",
    opening: 0,
    limit: 22000,
    apr: "21.24% variable",
    dueDay: 3,
    minPayment: 40,
    opened: "June 2, 2019",
    detail: "3x points on dining and travel",
  },
  {
    id: "fre",
    group: "Credit cards",
    kind: "credit",
    name: "Freedom Unlimited",
    product: "Freedom Unlimited",
    mask: "2290",
    number: "4000000000002290",
    opening: 0,
    limit: 8500,
    apr: "20.49% variable",
    dueDay: 8,
    minPayment: 25,
    opened: "January 18, 2021",
    detail: "1.5% cash back on every purchase",
  },
  {
    id: "mtg",
    group: "Loans",
    kind: "loan",
    name: "Mortgage — 1847 N Halsted",
    product: "30-year fixed",
    mask: "6610",
    number: "000066109904",
    opening: 0,
    apr: "6.125%",
    dueDay: 1,
    payment: 3214.55,
    opened: "August 9, 2021",
    detail: "Unit 4B · Original balance $480,000",
  },
  {
    id: "aut",
    group: "Loans",
    kind: "loan",
    name: "Auto — 2023 BMW X3",
    product: "Auto loan",
    mask: "1184",
    number: "000011846620",
    opening: 0,
    apr: "4.99%",
    dueDay: 15,
    payment: 489.33,
    opened: "April 3, 2023",
    detail: "xDrive30i · 48 months remaining",
  },
  {
    id: "inv",
    group: "Investments",
    kind: "invest",
    name: "J.P. Morgan Self-Directed",
    product: "Self-Directed brokerage",
    mask: "5502",
    number: "000055029911",
    opening: 0,
    opened: "November 4, 2018",
    detail: "Taxable brokerage",
  },
];

type Seed = Omit<Txn, "id">;

function seed(rows: Seed[]): Txn[] {
  return rows.map((row, i) => ({ ...row, id: `seed-${row.accountId}-${i}` }));
}

function buildTransactions(): Txn[] {
  const c = (
    accountId: string,
    d: number,
    description: string,
    amount: number,
    category: string,
    status: Txn["status"] = "posted",
  ): Seed => ({
    accountId,
    date: daysAgo(d),
    description,
    amount,
    category,
    status,
  });

  return seed([
    c("chk", 0, "UBER TRIP", -18.4, "Transport", "pending"),
    c("chk", 0, "STARBUCKS LINCOLN PARK", -6.75, "Dining", "pending"),
    c("chk", 1, "WHOLE FOODS HALSTED", -86.22, "Groceries"),
    c("chk", 1, "ZELLE FROM AMARA COLE", 120, "Zelle"),
    c("chk", 2, "SHELL OIL 5741 N BROADWAY", -52.4, "Transport"),
    c("chk", 3, "CHIPOTLE 1842 N CLYBOURN", -14.85, "Dining"),
    c("chk", 4, "SPOTIFY USA", -11.99, "Entertainment"),
    c("chk", 5, "ONLINE TRANSFER TO SAVINGS ...9034", -500, "Transfer"),
    c("chk", 6, "NETFLIX.COM", -15.49, "Entertainment"),
    c("chk", 8, "TRADER JOE'S #688", -67.48, "Groceries"),
    c("chk", 8, "LYFT RIDE", -22.15, "Transport"),
    c("chk", 9, "COMCAST XFINITY", -89.99, "Bills & utilities"),
    c("chk", 11, "ATM WITHDRAWAL 2000 N HALSTED", -80, "Cash"),
    c("chk", 12, "CHASE CREDIT CRD AUTOPAY ...7712", -450, "Payment"),
    c("chk", 12, "CHASE CREDIT CRD AUTOPAY ...2290", -125, "Payment"),
    c("chk", 14, "LINCOLN PARK CONDO ASSOC RENT", -2450, "Housing"),
    c("chk", 15, "CHASE AUTO FINANCE PAYMENT", -489.33, "Loan payment"),
    c("chk", 16, "NORTHLINE STUDIO PAYROLL", 4286.55, "Income"),
    c("chk", 18, "CVS/PHARMACY #2910", -18.76, "Health"),
    c("chk", 20, "APPLE.COM/BILL", -9.99, "Bills & utilities"),
    c("chk", 22, "PELOTON MEMBERSHIP", -44, "Health"),
    c("chk", 24, "ZELLE TO DAVID OKONKWO", -75, "Zelle"),
    c("chk", 26, "HOME DEPOT LINCOLN PARK", -62.4, "Shopping"),
    c("chk", 28, "VENMO PAYMENT", -40, "Other"),
    c("chk", 30, "NORTHLINE STUDIO PAYROLL", 4286.55, "Income"),
    c("chk", 32, "CHASE HOME LENDING PAYMENT", -3214.55, "Loan payment"),
    c("chk", 33, "INTEREST PAYMENT", 1.18, "Income"),
    c("chk", 35, "DIVVY BIKE SHARE", -4.85, "Transport"),
    c("chk", 40, "WHOLE FOODS HALSTED", -92.1, "Groceries"),
    c("chk", 44, "NORTHLINE STUDIO PAYROLL", 4286.55, "Income"),
    c("chk", 46, "LINCOLN PARK CONDO ASSOC RENT", -2450, "Housing"),
    c("chk", 48, "CHASE CREDIT CRD AUTOPAY ...7712", -700, "Payment"),
    c("chk", 50, "ONLINE TRANSFER TO SAVINGS ...9034", -1000, "Transfer"),
    c("chk", 60, "CHASE HOME LENDING PAYMENT", -3214.55, "Loan payment"),
    c("chk", 62, "NORTHLINE STUDIO PAYROLL", 4286.55, "Income"),
    c("chk", 74, "ATM WITHDRAWAL CHASE TOWER", -100, "Cash"),

    c("sav", 5, "ONLINE TRANSFER FROM CHECKING ...4821", 500, "Transfer"),
    c("sav", 33, "INTEREST PAYMENT", 18.44, "Income"),
    c("sav", 50, "ONLINE TRANSFER FROM CHECKING ...4821", 1000, "Transfer"),
    c("sav", 64, "INTEREST PAYMENT", 17.02, "Income"),

    c("sap", 1, "UBER EATS", 42.18, "Dining"),
    c("sap", 3, "GIRL & THE GOAT", 186.4, "Dining"),
    c("sap", 6, "UNITED AIRLINES", 428.6, "Travel"),
    c("sap", 7, "MARRIOTT CHICAGO MAGNIFICENT", 612.33, "Travel"),
    c("sap", 9, "STARBUCKS RESERVE ROASTERY", 8.45, "Dining"),
    c("sap", 12, "AUTOPAY PAYMENT THANK YOU", -450, "Payment"),
    c("sap", 19, "APPLE STORE MICHIGAN AVE", 129, "Shopping"),
    c("sap", 27, "DELTA AIR LINES", 286.4, "Travel"),
    c("sap", 36, "AVANT GARDEN", 94.2, "Dining"),
    c("sap", 48, "PAYMENT THANK YOU", -700, "Payment"),
    c("sap", 55, "ANNUAL MEMBERSHIP FEE", 95, "Fees"),
    c("sap", 58, "LYFT", 34.1, "Transport"),

    c("fre", 2, "AMAZON.COM*NK42H1", 64.18, "Shopping"),
    c("fre", 4, "TARGET CHICAGO", 43.11, "Shopping"),
    c("fre", 10, "DOORDASH*DASHPASS", 28.9, "Dining"),
    c("fre", 12, "AUTOPAY PAYMENT THANK YOU", -125, "Payment"),
    c("fre", 13, "WALGREENS", 22.4, "Health"),
    c("fre", 21, "BEST BUY LINCOLN PARK", 88, "Shopping"),
    c("fre", 34, "AMAZON.COM*Q19PL", 41.22, "Shopping"),
    c("fre", 45, "SPOTIFY USA", 11.99, "Entertainment"),
    c("fre", 52, "PAYMENT THANK YOU", -200, "Payment"),

    c("mtg", 32, "PAYMENT RECEIVED — PRINCIPAL", -812.4, "Loan payment"),
    c("mtg", 60, "PAYMENT RECEIVED — PRINCIPAL", -808.22, "Loan payment"),
    c("mtg", 92, "PAYMENT RECEIVED — PRINCIPAL", -804.05, "Loan payment"),

    c("aut", 15, "AUTO PAYMENT RECEIVED — PRINCIPAL", -314.8, "Loan payment"),
    c("aut", 45, "AUTO PAYMENT RECEIVED — PRINCIPAL", -312.1, "Loan payment"),
    c("aut", 75, "AUTO PAYMENT RECEIVED — PRINCIPAL", -309.55, "Loan payment"),
  ]);
}

const TARGETS: Record<string, number> = {
  chk: 18642.18,
  sav: 47218.55,
  sap: 2184.62,
  fre: 486.1,
  mtg: 412880.14,
  aut: 21640.77,
  inv: 0,
};

function accountsWithOpenings(txns: Txn[]): Account[] {
  return ACCOUNTS.map((account) => {
    const sum = txns
      .filter((t) => t.accountId === account.id)
      .reduce((s, t) => s + t.amount, 0);
    const target = TARGETS[account.id] ?? 0;
    return { ...account, opening: round2(target - sum) };
  });
}

export function createInitialState(): BankState {
  const transactions = buildTransactions();
  return {
    accounts: accountsWithOpenings(transactions),
    transactions,
    investCash: 2140.18,
    investActivity: seed([
      {
        accountId: "inv",
        date: daysAgo(8),
        description: "DIVIDEND — VTI",
        amount: 42.18,
        category: "Income",
        status: "posted",
      },
      {
        accountId: "inv",
        date: daysAgo(21),
        description: "BUY AAPL 2 SHARES",
        amount: -456.32,
        category: "Transfer",
        status: "posted",
      },
      {
        accountId: "inv",
        date: daysAgo(40),
        description: "DIVIDEND — SCHD",
        amount: 28.4,
        category: "Income",
        status: "posted",
      },
      {
        accountId: "inv",
        date: daysAgo(55),
        description: "CASH CONTRIBUTION",
        amount: 1000,
        category: "Transfer",
        status: "posted",
      },
    ]),
    cardsLocked: { debit: false, sap: false, fre: false },
    messages: [
      {
        id: "m1",
        from: "Maya Chen",
        role: "Private Client Banker",
        subject: "A CD special is still open for you",
        body: "Jedidiah — a 9-month relationship CD is available through Friday if you want to park a portion of savings. I can open it from the funds already at the bank. Reply here and I’ll take care of the paperwork.",
        date: daysAgo(0),
        unread: true,
        folder: "inbox",
      },
      {
        id: "m2",
        from: "Chase Security",
        role: "Security",
        subject: "New browser sign-in",
        body: "We noticed a sign-in from a Chrome browser in Chicago. If this was you, no action is needed. If not, change your password and call the number on your card.",
        date: daysAgo(1),
        unread: true,
        folder: "inbox",
      },
      {
        id: "m3",
        from: "Chase Statements",
        role: "Documents",
        subject: "Your statements are ready",
        body: "Monthly statements for checking, savings, and both credit cards are ready to view or download. Paperless delivery is on for every account.",
        date: daysAgo(3),
        unread: false,
        folder: "inbox",
      },
      {
        id: "m4",
        from: "Sapphire Rewards",
        role: "Rewards",
        subject: "You earned 3x on dining this month",
        body: "Girl & the Goat, Uber Eats, and a few neighborhood spots added bonus points to your Sapphire Preferred. You have 48,220 points available.",
        date: daysAgo(6),
        unread: false,
        folder: "inbox",
      },
      {
        id: "m5",
        from: "Chase Auto",
        role: "Loans",
        subject: "BMW payment is scheduled",
        body: "Your $489.33 auto payment is scheduled from Private Client Checking. Principal, interest, and the remaining term are on the loan page.",
        date: daysAgo(9),
        unread: false,
        folder: "inbox",
      },
    ],
    payees: [
      { id: "p1", name: "ComEd", subtitle: "Electric · account 4482019", category: "Bills & utilities", lastAmount: 142.8 },
      { id: "p2", name: "Comcast Xfinity", subtitle: "Internet · account 99281", category: "Bills & utilities", lastAmount: 89.99 },
      { id: "p3", name: "Lincoln Park Condo Assoc", subtitle: "Rent · Unit 4B", category: "Housing", lastAmount: 2450 },
      { id: "p4", name: "State Farm", subtitle: "Auto policy 338-221", category: "Bills & utilities", lastAmount: 168.4 },
      { id: "p5", name: "City of Chicago", subtitle: "Water · account 771203", category: "Bills & utilities", lastAmount: 64.22 },
      { id: "p6", name: "AT&T Wireless", subtitle: "Wireless · 312-555-0186", category: "Bills & utilities", lastAmount: 95.4 },
    ],
    contacts: [
      { id: "z1", name: "Amara Cole", handle: "amara.cole@email.com", color: "#117ACA" },
      { id: "z2", name: "David Okonkwo", handle: "312-555-0144", color: "#0f9d8a" },
      { id: "z3", name: "Priya Shah", handle: "priya.shah@email.com", color: "#7c5cbf" },
      { id: "z4", name: "Marcus Hale", handle: "773-555-0190", color: "#e07a3d" },
    ],
    profile: {
      firstName: "Jedidiah",
      lastName: "Cole",
      email: "jedidiah.cole@pm.me",
      phone: "(312) 555-0186",
      address1: "1847 N Halsted St",
      address2: "Unit 4B",
      city: "Chicago",
      state: "IL",
      zip: "60614",
      employer: "Northline Studio",
      job: "Senior Product Designer",
      dob: "March 14, 1992",
    },
    password: DEFAULT_PASSWORD,
    twoStep: false,
    alerts: {
      email: true,
      push: true,
      text: false,
      largeWithdrawal: true,
      international: true,
      login: true,
    },
    disputes: [],
    scheduled: [
      {
        id: "s1",
        name: "Monthly savings transfer",
        amount: 500,
        fromId: "chk",
        nextDate: daysAgo(-6),
        kind: "transfer",
      },
      {
        id: "s2",
        name: "ComEd",
        amount: 142.8,
        fromId: "chk",
        nextDate: daysAgo(-3),
        kind: "bill",
      },
      {
        id: "s3",
        name: "Mortgage — 1847 N Halsted",
        amount: 3214.55,
        fromId: "chk",
        nextDate: daysAgo(-12),
        kind: "loan",
      },
      {
        id: "s4",
        name: "Auto — 2023 BMW X3",
        amount: 489.33,
        fromId: "chk",
        nextDate: daysAgo(-9),
        kind: "loan",
      },
    ],
    travel: null,
    devices: [
      { id: "d1", name: "Chrome on Mac", meta: "Chicago, IL · This browser", current: true },
      { id: "d2", name: "iPhone 15 Pro", meta: "Chase Mobile · Last used yesterday", current: false },
      { id: "d3", name: "iPad Air", meta: "Chase Mobile · Last used 12 days ago", current: false },
    ],
    budgets: [
      { category: "Groceries", limit: 500 },
      { category: "Dining", limit: 400 },
      { category: "Transport", limit: 180 },
      { category: "Shopping", limit: 250 },
      { category: "Travel", limit: 600 },
      { category: "Entertainment", limit: 80 },
      { category: "Bills & utilities", limit: 350 },
      { category: "Health", limit: 120 },
    ],
    homeValue: 685000,
    overdraftProtection: true,
    lastSignIn: null,
    rewards: { sapphire: 48220, freedom: 126.4 },
  };
}

export function loadState(): BankState {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as BankState;
    if (!parsed?.accounts?.length || !parsed.profile?.firstName) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function ledgerBalance(account: Account, txns: Txn[]) {
  const sum = txns.filter((t) => t.accountId === account.id).reduce((s, t) => s + t.amount, 0);
  return round2(account.opening + sum);
}

export function positionsValue(holdings: Holding[] = HOLDINGS) {
  return round2(holdings.reduce((s, h) => s + h.shares * h.price, 0));
}

export function displayBalance(account: Account, state: BankState, holdings = HOLDINGS) {
  if (account.kind === "invest") return round2(positionsValue(holdings) + state.investCash);
  return ledgerBalance(account, state.transactions);
}

export function availableCredit(account: Account, state: BankState) {
  if (account.kind !== "credit") return 0;
  return round2((account.limit || 0) - ledgerBalance(account, state.transactions));
}

export function presentBalance(account: Account, state: BankState) {
  const bal = ledgerBalance(account, state.transactions);
  const pending = state.transactions
    .filter((t) => t.accountId === account.id && t.status === "pending")
    .reduce((s, t) => s + t.amount, 0);
  return round2(bal - pending);
}

export function txnsFor(state: BankState, accountId: string) {
  const list = accountId === "inv" ? state.investActivity : state.transactions.filter((t) => t.accountId === accountId);
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function pushTxn(state: BankState, txn: Omit<Txn, "id">, bucket: "transactions" | "investActivity" = "transactions"): BankState {
  const next: Txn = { ...txn, id: uid("tx") };
  return { ...state, [bucket]: [next, ...state[bucket]] };
}

export function netWorth(state: BankState, holdings = HOLDINGS) {
  const assets =
    displayBalance(state.accounts.find((a) => a.id === "chk")!, state) +
    displayBalance(state.accounts.find((a) => a.id === "sav")!, state) +
    displayBalance(state.accounts.find((a) => a.id === "inv")!, state, holdings) +
    state.homeValue;
  const liabilities = ["sap", "fre", "mtg", "aut"].reduce((s, id) => {
    const account = state.accounts.find((a) => a.id === id)!;
    return s + ledgerBalance(account, state.transactions);
  }, 0);
  return { assets: round2(assets), liabilities: round2(liabilities), net: round2(assets - liabilities) };
}
