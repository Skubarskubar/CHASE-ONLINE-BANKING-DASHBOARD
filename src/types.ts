export type AccountKind = "deposit" | "credit" | "loan" | "invest";

export interface Account {
  id: string;
  group: "Bank accounts" | "Credit cards" | "Loans" | "Investments";
  kind: AccountKind;
  name: string;
  product: string;
  mask: string;
  number: string;
  routing?: string;
  opening: number;
  limit?: number;
  apr?: string;
  apy?: string;
  dueDay?: number;
  minPayment?: number;
  payment?: number;
  opened: string;
  nickname?: string;
  detail?: string;
}

export interface Txn {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: "pending" | "posted";
}

export interface Message {
  id: string;
  from: string;
  role: string;
  subject: string;
  body: string;
  date: string;
  unread: boolean;
  folder: "inbox" | "sent";
}

export interface Payee {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  lastAmount: number;
}

export interface ZelleContact {
  id: string;
  name: string;
  handle: string;
  color: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  employer: string;
  job: string;
  dob: string;
}

export interface Alerts {
  email: boolean;
  push: boolean;
  text: boolean;
  largeWithdrawal: boolean;
  international: boolean;
  login: boolean;
}

export interface Dispute {
  id: string;
  txnId: string;
  reason: string;
  detail: string;
  status: string;
  created: string;
}

export interface Scheduled {
  id: string;
  name: string;
  amount: number;
  fromId: string;
  nextDate: string;
  kind: "transfer" | "bill" | "loan";
}

export interface TravelNotice {
  destination: string;
  from: string;
  to: string;
  note: string;
}

export interface Device {
  id: string;
  name: string;
  meta: string;
  current?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  prevClose: number;
  cost: number;
}

export interface BankState {
  accounts: Account[];
  transactions: Txn[];
  investCash: number;
  investActivity: Txn[];
  cardsLocked: Record<string, boolean>;
  messages: Message[];
  payees: Payee[];
  contacts: ZelleContact[];
  profile: Profile;
  password: string;
  twoStep: boolean;
  alerts: Alerts;
  disputes: Dispute[];
  scheduled: Scheduled[];
  travel: TravelNotice | null;
  devices: Device[];
  budgets: Budget[];
  homeValue: number;
  overdraftProtection: boolean;
  lastSignIn: string | null;
  rewards: { sapphire: number; freedom: number };
}

export type View =
  | { name: "accounts" }
  | { name: "account"; id: string }
  | { name: "pay"; tab?: "transfer" | "bill" | "zelle" | "wire" }
  | { name: "deposit" }
  | { name: "cards" }
  | { name: "plan" }
  | { name: "security" }
  | { name: "statements" }
  | { name: "statement"; accountId: string; month: string }
  | { name: "messages" }
  | { name: "profile" }
  | { name: "products" }
  | { name: "help" }
  | { name: "branches" };

export interface Branch {
  id: string;
  name: string;
  address: string;
  distance: string;
  hours: string;
  atm: boolean;
  branch: boolean;
  services: string[];
}
