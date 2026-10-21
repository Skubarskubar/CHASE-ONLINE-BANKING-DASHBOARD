import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { GhostButton, Icon, PrimaryButton, fieldClass } from "@/components/ui";
import { BRANCHES, PREVIEW_CODE } from "@/data";
import { cn } from "@/utils/cn";

type Page =
  | "home"
  | "checking"
  | "cards"
  | "savings"
  | "mortgage"
  | "auto"
  | "investing"
  | "education"
  | "business"
  | "commercial"
  | "branches"
  | "forgot"
  | "enroll"
  | "open";

type Lang = "en" | "es";

const COPY = {
  en: {
    personal: "Personal",
    business: "Business",
    commercial: "Commercial",
    atms: "ATMs / branches",
    lang: "Español",
    signIn: "Sign in",
    welcome: "Welcome",
    welcomeSub: "Sign in to manage your accounts",
    username: "Username",
    password: "Password",
    remember: "Remember me",
    token: "Use token",
    forgot: "Forgot username/password?",
    enroll: "Not enrolled? Sign up now",
    heroKicker: "New checking customers",
    heroTitle: "Earn $300",
    heroBody: "Open a Chase checking account, set up direct deposit, and complete the preview bonus steps. Offers shown here are illustrative.",
    open: "Open an account",
    seeDetails: "See details",
    signingIn: "Signing you in securely…",
    preview: "Use preview sign-in",
    signedOut: "You securely signed out.",
    passwordless: "Passwordless sign in",
    show: "Show",
    hide: "Hide",
  },
  es: {
    personal: "Personal",
    business: "Negocios",
    commercial: "Comercial",
    atms: "Cajeros / sucursales",
    lang: "English",
    signIn: "Iniciar sesión",
    welcome: "Bienvenido",
    welcomeSub: "Inicie sesión para administrar sus cuentas",
    username: "Nombre de usuario",
    password: "Contraseña",
    remember: "Recordarme",
    token: "Usar token",
    forgot: "¿Olvidó su usuario o contraseña?",
    enroll: "¿No está inscrito? Regístrese",
    heroKicker: "Nuevos clientes de cheques",
    heroTitle: "Gane $300",
    heroBody: "Abra una cuenta de cheques, configure el depósito directo y complete los pasos de esta vista previa. Las ofertas son ilustrativas.",
    open: "Abrir una cuenta",
    seeDetails: "Ver detalles",
    signingIn: "Iniciando sesión de forma segura…",
    preview: "Usar acceso de vista previa",
    signedOut: "Cerró sesión de forma segura.",
    passwordless: "Ingreso sin contraseña",
    show: "Mostrar",
    hide: "Ocultar",
  },
} as const;

const NAV: { id: Page; label: string; links: { title: string; detail: string }[] }[] = [
  {
    id: "checking",
    label: "Checking",
    links: [
      { title: "Total Checking", detail: "Everyday banking with a waivable monthly fee" },
      { title: "Secure Banking", detail: "No overdraft fees, no paper checks" },
      { title: "Premier Plus Checking", detail: "Built for higher everyday balances" },
      { title: "Private Client Checking", detail: "A banker who knows your name" },
    ],
  },
  {
    id: "cards",
    label: "Credit cards",
    links: [
      { title: "Sapphire Reserve", detail: "Premium travel and dining rewards" },
      { title: "Sapphire Preferred", detail: "75,000 bonus points illustration" },
      { title: "Freedom Unlimited", detail: "Cash back on every purchase" },
      { title: "Freedom Flex", detail: "Rotating quarterly categories" },
    ],
  },
  {
    id: "savings",
    label: "Savings & CDs",
    links: [
      { title: "Chase Savings", detail: "A place for your reserve cash" },
      { title: "Premier Savings", detail: "Linked to your checking relationship" },
      { title: "Certificates of deposit", detail: "Lock a rate for a set term" },
    ],
  },
  {
    id: "mortgage",
    label: "Home loans",
    links: [
      { title: "Buy a home", detail: "Get a sample rate and payment" },
      { title: "Refinance", detail: "Compare a new term in this preview" },
      { title: "Home equity", detail: "Borrow against illustrative equity" },
    ],
  },
  {
    id: "auto",
    label: "Auto",
    links: [
      { title: "Auto loans", detail: "Finance a new or used vehicle" },
      { title: "Lease-end options", detail: "See what a payoff could look like" },
    ],
  },
  {
    id: "investing",
    label: "Investing",
    links: [
      { title: "Self-Directed", detail: "Trade ETFs, stocks, and cash" },
      { title: "J.P. Morgan Advisors", detail: "Advice for longer-term plans" },
    ],
  },
  {
    id: "education",
    label: "Education",
    links: [
      { title: "College planning", detail: "529s and savings goals" },
      { title: "Student resources", detail: "Banking basics, no jargon" },
    ],
  },
];

const OFFERS = [
  {
    amount: "$300",
    title: "Checking bonus",
    body: "New checking customers can preview a $300 bonus after qualifying direct deposits.",
    page: "checking" as Page,
    image:
      "https://images.pexels.com/photos/25811902/pexels-photo-25811902.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100",
  },
  {
    amount: "75,000",
    title: "Bonus points",
    body: "Sapphire Preferred illustration: earn bonus points after meeting a sample spend requirement.",
    page: "cards" as Page,
    image:
      "https://images.pexels.com/photos/6633806/pexels-photo-6633806.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100",
  },
  {
    amount: "$200",
    title: "Savings bonus",
    body: "Open a savings account in this preview and see how a relationship bonus is tracked.",
    page: "savings" as Page,
    image:
      "https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100",
  },
];

export default function PublicSite({
  validate,
  preview,
  twoStep,
  justSignedOut,
  onAuthenticated,
}: {
  validate: (username: string, password: string) => boolean;
  preview: () => { username: string; password: string };
  twoStep: boolean;
  justSignedOut: boolean;
  onAuthenticated: () => void;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [page, setPage] = useState<Page>("home");
  const [menu, setMenu] = useState<Page | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needCode, setNeedCode] = useState(false);
  const [code, setCode] = useState("");
  const [tokenMode, setTokenMode] = useState(false);
  const [token, setToken] = useState("");
  const [signOpen, setSignOpen] = useState(false);
  const t = COPY[lang];

  useEffect(() => {
    const saved = localStorage.getItem("chase-preview-user");
    if (saved) setUsername(saved);
  }, []);

  useEffect(() => {
    document.title =
      page === "home"
        ? "Chase Online | Banking, Credit Cards & Home Loans"
        : `${page[0].toUpperCase()}${page.slice(1)} | Chase Online`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  function fillPreview() {
    const creds = preview();
    setUsername(creds.username);
    setPassword(creds.password);
    setError("");
    setPaused(false);
  }

  function finish() {
    if (remember) localStorage.setItem("chase-preview-user", username.trim());
    setBusy(true);
    window.setTimeout(() => onAuthenticated(), 900);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (paused) return;
    setError("");
    if (tokenMode) {
      if (token.trim() !== PREVIEW_CODE) {
        setError("That token doesn’t match. Use the preview token shown below.");
        setShake(true);
        window.setTimeout(() => setShake(false), 450);
        return;
      }
    }
    if (!validate(username, password)) {
      const next = attempts + 1;
      setAttempts(next);
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      if (next >= 6) {
        setPaused(true);
        setError("Sign-in is paused after several tries. Reset the pause to continue this preview.");
      } else {
        setError("The username or password doesn’t match our records. Please try again.");
      }
      return;
    }
    if (twoStep) {
      setNeedCode(true);
      return;
    }
    finish();
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() !== PREVIEW_CODE) {
      setError("That code doesn’t match. Use the preview code for this device.");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      return;
    }
    finish();
  }

  const heroImage =
    "https://images.pexels.com/photos/25811901/pexels-photo-25811901.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800";

  return (
    <div className="min-h-screen bg-white text-[#1b1e22]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[70] focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="border-b border-[#eceff2] bg-[#f7f8f9] text-[13px]">
        <div className="mx-auto flex h-9 max-w-[1180px] items-center justify-between px-4">
          <div className="flex items-center gap-4 font-semibold">
            <button className={cn(page !== "business" && page !== "commercial" ? "text-[#117ACA]" : "text-[#3c4450]")} onClick={() => setPage("home")}>
              {t.personal}
            </button>
            <button className={cn(page === "business" && "text-[#117ACA]")} onClick={() => setPage("business")}>
              {t.business}
            </button>
            <button className={cn(page === "commercial" && "text-[#117ACA]")} onClick={() => setPage("commercial")}>
              {t.commercial}
            </button>
          </div>
          <div className="flex items-center gap-4 text-[#3c4450]">
            <button className="hidden hover:underline sm:inline" onClick={() => setPage("branches")}>
              {t.atms}
            </button>
            <button className="font-semibold text-[#117ACA]" onClick={() => setLang(lang === "en" ? "es" : "en")}>
              {t.lang}
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#e6e8eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center gap-4 px-4">
          <button onClick={() => setPage("home")} aria-label="Chase home" className="shrink-0">
            <Logo />
          </button>
          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <div key={item.id} className="relative" onMouseEnter={() => setMenu(item.id)} onMouseLeave={() => setMenu(null)}>
                <button
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-2 text-[14px] font-semibold text-[#1c1c1c] hover:text-[#117ACA]",
                    page === item.id && "text-[#117ACA]",
                  )}
                  onClick={() => setPage(item.id)}
                >
                  {item.label}
                  <Icon.down className="h-3.5 w-3.5" />
                </button>
                {menu === item.id && (
                  <div className="absolute left-0 top-full z-50 w-[340px] rounded-md border border-[#e6e8eb] bg-white p-3 shadow-xl">
                    {item.links.map((link) => (
                      <button
                        key={link.title}
                        className="block w-full rounded px-3 py-2.5 text-left hover:bg-[#f4f8fc]"
                        onClick={() => {
                          setPage(item.id);
                          setMenu(null);
                        }}
                      >
                        <span className="block text-sm font-semibold text-[#117ACA]">{link.title}</span>
                        <span className="mt-0.5 block text-xs text-[#5c6770]">{link.detail}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden items-center gap-1 text-sm font-semibold text-[#117ACA] md:inline-flex" onClick={() => setPage("branches")}>
              <Icon.pin className="h-4 w-4" />
              ATMs
            </button>
            <div className="relative">
              <button
                className="h-10 rounded bg-[#117ACA] px-4 text-sm font-semibold text-white hover:bg-[#0d6eb5]"
                onClick={() => {
                  if (page !== "home") setSignOpen((v) => !v);
                  else document.getElementById("signin")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                {t.signIn}
              </button>
              {signOpen && page !== "home" && (
                <div className="pop absolute right-0 top-12 z-50 w-[320px] rounded-md border border-[#e6e8eb] bg-white p-4 shadow-2xl">
                  <SignForm
                    t={t}
                    username={username}
                    password={password}
                    showPassword={showPassword}
                    remember={remember}
                    error={error}
                    shake={shake}
                    paused={paused}
                    tokenMode={tokenMode}
                    token={token}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    setShowPassword={setShowPassword}
                    setRemember={setRemember}
                    setTokenMode={setTokenMode}
                    setToken={setToken}
                    onSubmit={submit}
                    onFill={fillPreview}
                    onForgot={() => {
                      setSignOpen(false);
                      setPage("forgot");
                    }}
                    onEnroll={() => {
                      setSignOpen(false);
                      setPage("enroll");
                    }}
                    onResetPause={() => {
                      setPaused(false);
                      setAttempts(0);
                      setError("");
                    }}
                  />
                </div>
              )}
            </div>
            <button className="rounded p-2 lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <Icon.close className="h-6 w-6" /> : <Icon.menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-[#eef0f2] bg-white px-4 py-3 lg:hidden">
            {NAV.map((item) => (
              <button
                key={item.id}
                className="block w-full py-2.5 text-left text-sm font-semibold"
                onClick={() => {
                  setPage(item.id);
                  setMobileOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main id="main">
        {justSignedOut && page === "home" && (
          <div className="bg-[#e8f6ee] px-4 py-2 text-center text-sm text-[#0f6b38]">You securely signed out of the preview.</div>
        )}

        {page === "home" && (
          <>
            <section className="relative overflow-hidden bg-[#073e73]">
              <img src={heroImage} alt="Chicago river and downtown skyline" className="absolute inset-0 h-full w-full object-cover opacity-55" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#06284d]/92 via-[#0a3d73]/78 to-[#0a3d73]/35" />
              <div className="relative mx-auto grid min-h-[560px] max-w-[1180px] items-center gap-8 px-4 py-12 lg:grid-cols-[1.15fr_.85fr]">
                <div className="rise max-w-xl text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#d6ebfa]">{t.heroKicker}</p>
                  <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">{t.heroTitle}</h1>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-white/90">{t.heroBody}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button className="h-11 rounded bg-[#128842] px-5 text-sm font-semibold text-white hover:bg-[#0f7338]" onClick={() => setPage("open")}>
                      {t.open}
                    </button>
                    <button className="h-11 rounded border border-white/70 px-5 text-sm font-semibold text-white hover:bg-white/10" onClick={() => setPage("checking")}>
                      {t.seeDetails}
                    </button>
                  </div>
                  <p className="mt-6 max-w-md text-xs leading-relaxed text-white/70">
                    Illustrative preview offer. Not a live Chase promotion and not an offer of deposit, credit, or investment products.
                  </p>
                </div>
                <div id="signin" className="rise rounded-md bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-7">
                  {needCode ? (
                    <form onSubmit={submitCode} className={shake ? "shake" : ""}>
                      <h2 className="text-2xl font-semibold text-[#101820]">Verify it’s you</h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#5c6770]">
                        Enter the code sent to (•••) •••-0186. For this preview the code is{" "}
                        <span className="font-semibold text-[#117ACA]">{PREVIEW_CODE}</span>.
                      </p>
                      <label className="mt-5 block text-[13px] font-semibold">One-time code</label>
                      <input className={`${fieldClass} mt-1.5 tracking-[0.3em]`} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6 digits" />
                      {error && <p className="mt-3 text-sm text-[#b42318]" role="alert">{error}</p>}
                      <PrimaryButton type="submit" className="mt-4 w-full">Continue</PrimaryButton>
                      <button type="button" className="mt-3 text-sm font-semibold text-[#117ACA]" onClick={() => setNeedCode(false)}>
                        Back
                      </button>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-[28px] font-semibold leading-none text-[#101820]">{t.welcome}</h2>
                      <p className="mt-2 text-sm text-[#5c6770]">{t.welcomeSub}</p>
                      <div className="mt-5">
                        <SignForm
                          t={t}
                          username={username}
                          password={password}
                          showPassword={showPassword}
                          remember={remember}
                          error={error}
                          shake={shake}
                          paused={paused}
                          tokenMode={tokenMode}
                          token={token}
                          setUsername={setUsername}
                          setPassword={setPassword}
                          setShowPassword={setShowPassword}
                          setRemember={setRemember}
                          setTokenMode={setTokenMode}
                          setToken={setToken}
                          onSubmit={submit}
                          onFill={fillPreview}
                          onForgot={() => setPage("forgot")}
                          onEnroll={() => setPage("enroll")}
                          onResetPause={() => {
                            setPaused(false);
                            setAttempts(0);
                            setError("");
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-[1180px] px-4 py-12">
              <div className="grid gap-5 md:grid-cols-3">
                {OFFERS.map((offer) => (
                  <button
                    key={offer.title}
                    onClick={() => setPage(offer.page)}
                    className="group overflow-hidden rounded-md border border-[#e6e8eb] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative h-40 overflow-hidden bg-[#0a3d73]">
                      <img src={offer.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06284d]/80 to-transparent" />
                      <p className="absolute bottom-3 left-4 text-4xl font-semibold tracking-tight text-white">{offer.amount}</p>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#5c6770]">{offer.body}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#117ACA]">
                        Learn more <Icon.chevron className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-[#f5f7f8]">
              <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-14 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#117ACA]">Chase Mobile preview</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#101820]">Banking that feels like a conversation</h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#4b5560]">
                    Balances, Zelle, card lock, and a banker message — the same snapshot you’ll see after you sign in. Built for a Private Client customer in Lincoln Park.
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-[#1b1e22]">
                    {["See every account on one screen", "Move money between your own accounts", "Lock a card before you call", "Message your banker, Maya Chen"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#117ACA] text-white">
                          <Icon.check className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <PhoneMock />
              </div>
            </section>

            <section className="mx-auto max-w-[1180px] px-4 py-14">
              <h2 className="text-3xl font-semibold tracking-tight">Find the right fit</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Checking", body: "Fee-free paths and Private Client service.", page: "checking" as Page, icon: Icon.home },
                  { title: "Credit cards", body: "Points, cash back, and a metal-card look.", page: "cards" as Page, icon: Icon.card },
                  { title: "Home loans", body: "A sample payment on a Chicago condo.", page: "mortgage" as Page, icon: Icon.home },
                  { title: "Investing", body: "Self-directed ETFs with live-style quotes.", page: "investing" as Page, icon: Icon.chart },
                ].map((item) => (
                  <button key={item.title} onClick={() => setPage(item.page)} className="rounded-md border border-[#e6e8eb] p-5 text-left hover:border-[#117ACA] hover:shadow-md">
                    <item.icon className="h-6 w-6 text-[#117ACA]" />
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#5c6770]">{item.body}</p>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {page !== "home" && page !== "forgot" && page !== "enroll" && page !== "open" && page !== "branches" && page !== "business" && page !== "commercial" && (
          <ProductPage id={page} onOpen={() => setPage("open")} onBranches={() => setPage("branches")} />
        )}
        {page === "business" && <SimpleStory title="Chase for Business" kicker="Business" lede="Business Complete Banking, cards, and payroll tools — presented here as a preview, not a live application." points={["Monthly fee waiver illustration with qualifying activity", "Employee cards with spend controls", "Same preview sign-in as Jedidiah’s personal profile"]} onOpen={() => setPage("open")} />}
        {page === "commercial" && <SimpleStory title="Commercial banking" kicker="Commercial" lede="Treasury, credit, and industry coverage for companies that have outgrown a small-business account. This page is a design preview only." points={["Connect-style sign-in is not a separate live portal here", "Sample liquidity and credit conversations", "No client data is collected or transmitted"]} onOpen={() => setPage("home")} />}
        {page === "branches" && <BranchFinder onBack={() => setPage("home")} />}
        {page === "forgot" && <ForgotPage onBack={() => setPage("home")} />}
        {page === "enroll" && <EnrollPage onBack={() => setPage("home")} onSignIn={() => setPage("home")} />}
        {page === "open" && <OpenAccount onBack={() => setPage("home")} />}
      </main>
      <SiteFooter onNav={setPage} />
      {busy && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-white">
          <Logo />
          <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-[#e5eef5]">
            <div className="loadbar h-full w-1/3 rounded-full bg-[#117ACA]" />
          </div>
          <p className="mt-4 text-sm text-[#5c6770]">{t.signingIn}</p>
        </div>
      )}
    </div>
  );
}

function SignForm({
  t,
  username,
  password,
  showPassword,
  remember,
  error,
  shake,
  paused,
  tokenMode,
  token,
  setUsername,
  setPassword,
  setShowPassword,
  setRemember,
  setTokenMode,
  setToken,
  onSubmit,
  onFill,
  onForgot,
  onEnroll,
  onResetPause,
}: {
  t: (typeof COPY)[Lang];
  username: string;
  password: string;
  showPassword: boolean;
  remember: boolean;
  error: string;
  shake: boolean;
  paused: boolean;
  tokenMode: boolean;
  token: string;
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  setShowPassword: (v: boolean) => void;
  setRemember: (v: boolean) => void;
  setTokenMode: (v: boolean) => void;
  setToken: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onFill: () => void;
  onForgot: () => void;
  onEnroll: () => void;
  onResetPause: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className={shake ? "shake" : ""}>
      <label className="text-[13px] font-semibold text-[#3c4450]" htmlFor="username">
        {t.username}
      </label>
      <input
        id="username"
        autoComplete="username"
        className={`${fieldClass} mt-1.5`}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={paused}
      />
      <div className="mt-3 flex items-center justify-between">
        <label className="text-[13px] font-semibold text-[#3c4450]" htmlFor="password">
          {t.password}
        </label>
        <button type="button" className="text-xs font-semibold text-[#117ACA]" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? t.hide : t.show}
        </button>
      </div>
      <input
        id="password"
        autoComplete="current-password"
        type={showPassword ? "text" : "password"}
        className={`${fieldClass} mt-1.5`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={paused}
      />
      {tokenMode && (
        <div className="mt-3">
          <label className="text-[13px] font-semibold" htmlFor="token">
            Security token
          </label>
          <input id="token" className={`${fieldClass} mt-1.5`} value={token} onChange={(e) => setToken(e.target.value)} placeholder="6-digit token" />
          <p className="mt-1 text-xs text-[#5c6770]">Preview token: {PREVIEW_CODE}</p>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#117ACA]" />
          {t.remember}
        </label>
        <button type="button" className="font-semibold text-[#117ACA]" onClick={() => setTokenMode(!tokenMode)}>
          {tokenMode ? "Use password" : t.token}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm leading-relaxed text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      {paused ? (
        <GhostButton className="mt-4 w-full" onClick={onResetPause}>
          Reset sign-in pause
        </GhostButton>
      ) : (
        <PrimaryButton type="submit" className="mt-4 w-full">
          {t.signIn}
        </PrimaryButton>
      )}
      <button type="button" onClick={onFill} className="mt-3 w-full text-center text-sm font-semibold text-[#117ACA] hover:underline">
        {t.preview}
      </button>
      <div className="mt-4 space-y-1.5 text-sm">
        <button type="button" className="block font-semibold text-[#117ACA] hover:underline" onClick={onForgot}>
          {t.forgot}
        </button>
        <button type="button" className="block text-[#3c4450] hover:underline" onClick={onEnroll}>
          {t.enroll}
        </button>
      </div>
    </form>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto h-[520px] w-[260px]">
      <div className="absolute -left-8 top-16 h-40 w-40 rounded-full bg-[#117ACA]/20 blur-2xl" />
      <div className="relative h-full w-full rounded-[36px] border-[8px] border-[#16181c] bg-white shadow-2xl">
        <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-[#16181c]" />
        <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[#f4f6f8]">
          <div className="bg-gradient-to-b from-[#117ACA] to-[#0c5ea8] px-4 pb-4 pt-9 text-white">
            <p className="text-xs text-white/80">Good afternoon</p>
            <p className="text-lg font-semibold">Jedidiah</p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-white/70">Total cash</p>
            <p className="text-2xl font-semibold tabular">$65,860.73</p>
          </div>
          <div className="-mt-2 flex-1 space-y-2 overflow-hidden rounded-t-2xl bg-white px-3 py-3">
            {[
              ["Private Client Checking", "$18,642.18"],
              ["Premier Savings", "$47,218.55"],
              ["Sapphire Preferred", "$2,184.62"],
              ["Freedom Unlimited", "$486.10"],
            ].map(([name, bal]) => (
              <div key={name} className="flex items-center justify-between border-b border-[#f0f2f4] py-2 text-[11px]">
                <span className="font-semibold text-[#117ACA]">{name}</span>
                <span className="tabular font-semibold">{bal}</span>
              </div>
            ))}
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px] font-semibold text-[#117ACA]">
              {["Transfer", "Zelle", "Lock card"].map((label) => (
                <div key={label} className="rounded bg-[#f3f8fc] px-1 py-2">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPage({ id, onOpen, onBranches }: { id: Page; onOpen: () => void; onBranches: () => void }) {
  const content = useMemo(() => {
    const map: Record<string, { kicker: string; title: string; lede: string; points: string[]; table?: [string, string, string][] }> = {
      checking: {
        kicker: "Checking",
        title: "Checking that stays out of the way",
        lede: "From a simple everyday account to Private Client, compare how a monthly fee can be waived — using sample figures, not live Chase pricing.",
        points: ["Direct deposit from Northline Studio already lands in this preview", "Overdraft protection can pull from savings", "Debit card lock is one tap after sign-in"],
        table: [
          ["Total Checking", "$12 sample fee", "Waived with $500 direct deposit"],
          ["Premier Plus", "$25 sample fee", "Waived with a $15,000 balance"],
          ["Private Client", "$0", "Relationship banking with a dedicated banker"],
        ],
      },
      cards: {
        kicker: "Credit cards",
        title: "Points for the way you already spend",
        lede: "Sapphire for travel and dining. Freedom for everyday cash back. Bonus amounts below are illustrations inside this preview.",
        points: ["75,000-point sample bonus on Sapphire Preferred", "3x sample earn on dining and travel", "Lock, replace, or pay a card after you sign in"],
        table: [
          ["Sapphire Preferred", "$95 sample annual fee", "3x dining & travel"],
          ["Sapphire Reserve", "$550 sample annual fee", "Premium travel credit illustration"],
          ["Freedom Unlimited", "$0 annual fee", "1.5% cash back illustration"],
        ],
      },
      savings: {
        kicker: "Savings & CDs",
        title: "Give your reserve a name",
        lede: "Premier Savings in this preview holds $47,218.55 and is linked to checking for overdraft protection. Rates shown are samples.",
        points: ["Interest posts monthly in the activity feed", "Move $500 on a schedule", "A banker can discuss a CD without leaving messages"],
        table: [
          ["Chase Savings", "0.01% sample APY", "No minimum to open in this preview"],
          ["Premier Savings", "0.02% sample APY", "Relationship pricing conversation"],
          ["9-month CD", "Sample special", "Ask Maya from the message center"],
        ],
      },
      mortgage: {
        kicker: "Home loans",
        title: "A Chicago condo, a clear payment",
        lede: "Jedidiah’s sample mortgage on 1847 N Halsted is a 30-year fixed at 6.125% with a $3,214.55 monthly payment including escrow.",
        points: ["See principal versus interest on the loan page", "Estimated home value can be updated after sign-in", "This is not a credit decision or a rate lock"],
        table: [
          ["30-year fixed", "6.125% sample", "$3,214.55 payment"],
          ["15-year fixed", "5.625% sample", "Higher payment, faster equity"],
          ["Home equity", "Sample line", "Based on a $685,000 estimate"],
        ],
      },
      auto: {
        kicker: "Auto",
        title: "The BMW payment, already scheduled",
        lede: "A 2023 BMW X3 xDrive30i with a 4.99% sample rate and a $489.33 payment due on the 15th.",
        points: ["Principal reduction shows on the loan ledger", "Pay from checking in Pay & transfer", "No credit pull happens in this preview"],
      },
      investing: {
        kicker: "Investing by J.P. Morgan",
        title: "A self-directed book you can actually open",
        lede: "ETFs and a few single stocks, plus sweep cash. Quotes tick while the market is open. Nothing here is a recommendation.",
        points: ["VTI, AAPL, MSFT, VXUS, SCHD, and JPM", "Day change calculated from prior close", "Transfer cash from checking into the brokerage"],
      },
      education: {
        kicker: "Education & goals",
        title: "Goals before products",
        lede: "Name a goal, pick an account, and watch the plan page compare spending with the budgets you set.",
        points: ["Spending categories from real preview activity", "Editable monthly budgets", "No student-loan application is submitted"],
      },
    };
    return map[id] || map.checking;
  }, [id]);

  return (
    <article>
      <section className="bg-gradient-to-br from-[#073e73] via-[#0c5ea8] to-[#117ACA] text-white">
        <div className="mx-auto max-w-[1180px] px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#d6ebfa]">{content.kicker}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{content.lede}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="h-11 rounded bg-white px-5 text-sm font-semibold text-[#0c5ea8]" onClick={onOpen}>
              Start an application
            </button>
            <button className="h-11 rounded border border-white/60 px-5 text-sm font-semibold" onClick={onBranches}>
              Find a branch
            </button>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1180px] gap-8 px-4 py-12 lg:grid-cols-[1.1fr_.9fr]">
        <ul className="space-y-3">
          {content.points.map((point) => (
            <li key={point} className="flex gap-3 rounded-md border border-[#e6e8eb] bg-white p-4 text-sm leading-relaxed">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f3fb] text-[#117ACA]">
                <Icon.check className="h-4 w-4" />
              </span>
              {point}
            </li>
          ))}
        </ul>
        {content.table && (
          <div className="overflow-hidden rounded-md border border-[#e6e8eb]">
            <div className="bg-[#f7f8f9] px-4 py-3 text-sm font-semibold">Sample comparison — not live pricing</div>
            <table className="w-full text-sm">
              <tbody>
                {content.table.map((row) => (
                  <tr key={row[0]} className="border-t border-[#eef0f2]">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </article>
  );
}

function SimpleStory({
  title,
  kicker,
  lede,
  points,
  onOpen,
}: {
  title: string;
  kicker: string;
  lede: string;
  points: string[];
  onOpen: () => void;
}) {
  return (
    <article className="mx-auto max-w-[900px] px-4 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#117ACA]">{kicker}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-[#4b5560]">{lede}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <Icon.check className="mt-0.5 h-4 w-4 text-[#117ACA]" /> {p}
          </li>
        ))}
      </ul>
      <PrimaryButton className="mt-8" onClick={onOpen}>
        Continue
      </PrimaryButton>
    </article>
  );
}

function BranchFinder({ onBack }: { onBack: () => void }) {
  const [q, setQ] = useState("60614");
  const [kind, setKind] = useState<"all" | "atm" | "branch">("all");
  const results = BRANCHES.filter((b) => {
    const hay = `${b.name} ${b.address}`.toLowerCase();
    const matches = !q || hay.includes(q.toLowerCase()) || b.address.includes(q) || q === "60614";
    if (kind === "atm") return matches && b.atm;
    if (kind === "branch") return matches && b.branch;
    return matches;
  });
  return (
    <section className="mx-auto max-w-[1180px] px-4 py-10">
      <button onClick={onBack} className="text-sm font-semibold text-[#117ACA]">
        ← Home
      </button>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">ATMs & branches</h1>
      <p className="mt-2 max-w-2xl text-[#5c6770]">Sample Chicago locations around Lincoln Park. Hours are illustrative for this preview.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input className={fieldClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ZIP, neighborhood, or street" />
        <div className="flex rounded border border-[#d5d9de] p-1">
          {(["all", "branch", "atm"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={cn("h-9 rounded px-3 text-sm font-semibold capitalize", kind === k ? "bg-[#117ACA] text-white" : "text-[#3c4450]")}>
              {k === "all" ? "All" : k === "atm" ? "ATMs" : "Branches"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {results.map((b) => (
            <article key={b.id} className="rounded-md border border-[#e6e8eb] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#117ACA]">{b.name}</h2>
                  <p className="text-sm text-[#3c4450]">{b.address}</p>
                  <p className="mt-1 text-sm text-[#5c6770]">{b.hours}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {b.services.map((s) => (
                      <span key={s} className="rounded-full bg-[#f3f8fc] px-2 py-0.5 text-xs font-semibold text-[#0c5ea8]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#5c6770]">{b.distance}</span>
              </div>
            </article>
          ))}
          {results.length === 0 && <p className="text-sm text-[#5c6770]">No sample locations match that search. Try 60614.</p>}
        </div>
        <aside className="relative hidden min-h-[420px] overflow-hidden rounded-md bg-[#d7e6f2] lg:block">
          <img
            src="https://images.pexels.com/photos/25811901/pexels-photo-25811901.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700"
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[#0a3d73]/25" />
          {results.slice(0, 4).map((b, i) => (
            <div key={b.id} className="absolute" style={{ top: `${18 + i * 16}%`, left: `${22 + (i % 3) * 18}%` }}>
              <div className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold shadow">
                <Icon.pin className="h-3.5 w-3.5 text-[#117ACA]" />
                {b.name}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function ForgotPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"user" | "pass">("pass");
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-lg px-4 py-14">
      <button onClick={onBack} className="text-sm font-semibold text-[#117ACA]">
        ← Back
      </button>
      <h1 className="mt-3 text-3xl font-semibold">Forgot username or password?</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5c6770]">
        We’ll show the same confirmation either way, so this preview never reveals whether an email is enrolled. Nothing is emailed.
      </p>
      <div className="mt-5 flex gap-2">
        <button className={cn("h-9 rounded px-3 text-sm font-semibold", mode === "pass" ? "bg-[#117ACA] text-white" : "bg-[#f2f4f6]")} onClick={() => setMode("pass")}>
          Password
        </button>
        <button className={cn("h-9 rounded px-3 text-sm font-semibold", mode === "user" ? "bg-[#117ACA] text-white" : "bg-[#f2f4f6]")} onClick={() => setMode("user")}>
          Username
        </button>
      </div>
      {done ? (
        <div className="mt-6 rounded-md border border-[#d7eadf] bg-[#f3fbf6] p-4 text-sm leading-relaxed">
          If we find a matching preview profile, reset instructions would appear here. Your preview username remains <span className="font-semibold">jedidiah1</span>.
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <label className="block text-sm font-semibold">{mode === "pass" ? "Username or email" : "Email"}</label>
          <input className={fieldClass} value={value} onChange={(e) => setValue(e.target.value)} required placeholder="jedidiah.cole@pm.me" />
          <PrimaryButton type="submit">Continue</PrimaryButton>
        </form>
      )}
    </section>
  );
}

function EnrollPage({ onBack, onSignIn }: { onBack: () => void; onSignIn: () => void }) {
  return (
    <section className="mx-auto max-w-lg px-4 py-14">
      <button onClick={onBack} className="text-sm font-semibold text-[#117ACA]">
        ← Back
      </button>
      <h1 className="mt-3 text-3xl font-semibold">Enroll in online banking</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5c6770]">
        The preview profile is already enrolled. We don’t collect a Social Security number, card number, or date of birth on this screen.
      </p>
      <div className="mt-6 rounded-md border border-[#e6e8eb] p-5">
        <p className="text-sm font-semibold">Jedidiah Cole</p>
        <p className="text-sm text-[#5c6770]">Username jedidiah1 · Private Client</p>
        <p className="mt-3 text-sm">This username is already active. Sign in instead of creating a second profile.</p>
        <PrimaryButton className="mt-4" onClick={onSignIn}>
          Go to sign in
        </PrimaryButton>
      </div>
    </section>
  );
}

function OpenAccount({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState("Chase Private Client Checking");
  const [name, setName] = useState("Jedidiah Cole");
  const [email, setEmail] = useState("jedidiah.cole@pm.me");
  const [zip, setZip] = useState("60614");
  const ref = "APC-104928";
  return (
    <section className="mx-auto max-w-xl px-4 py-14">
      <button onClick={onBack} className="text-sm font-semibold text-[#117ACA]">
        ← Home
      </button>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#117ACA]">Application preview · step {Math.min(step + 1, 3)} of 3</p>
      <h1 className="mt-2 text-3xl font-semibold">Open an account</h1>
      {step === 0 && (
        <div className="mt-6 space-y-3">
          {["Chase Private Client Checking", "Chase Premier Savings", "Sapphire Preferred", "Auto loan inquiry"].map((item) => (
            <button
              key={item}
              onClick={() => setProduct(item)}
              className={cn("block w-full rounded-md border px-4 py-3 text-left text-sm font-semibold", product === item ? "border-[#117ACA] bg-[#f3f8fc]" : "border-[#e6e8eb]")}
            >
              {item}
            </button>
          ))}
          <PrimaryButton className="mt-2" onClick={() => setStep(1)}>
            Continue
          </PrimaryButton>
        </div>
      )}
      {step === 1 && (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <label className="block text-sm font-semibold">Name</label>
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="block text-sm font-semibold">Email</label>
          <input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="block text-sm font-semibold">ZIP code</label>
          <input className={fieldClass} value={zip} onChange={(e) => setZip(e.target.value)} required />
          <p className="text-xs leading-relaxed text-[#6b7280]">Identity verification would happen in a branch or the official app. This preview does not ask for a Social Security number.</p>
          <PrimaryButton type="submit">Review</PrimaryButton>
        </form>
      )}
      {step === 2 && (
        <div className="mt-6 rounded-md border border-[#d7eadf] bg-[#f4fbf7] p-5">
          <Icon.check className="h-8 w-8 text-[#128842]" />
          <h2 className="mt-3 text-xl font-semibold">Application {ref} saved</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3c4450]">
            {name} started a preview application for {product} in {zip}. A confirmation would go to {email}. No account was opened and no credit was pulled.
          </p>
          <GhostButton className="mt-4" onClick={onBack}>
            Back to Chase.com
          </GhostButton>
        </div>
      )}
    </section>
  );
}

function SiteFooter({ onNav }: { onNav: (page: Page) => void }) {
  const cols = [
    { title: "Checking", page: "checking" as Page },
    { title: "Credit cards", page: "cards" as Page },
    { title: "Savings", page: "savings" as Page },
    { title: "Home loans", page: "mortgage" as Page },
    { title: "Auto", page: "auto" as Page },
    { title: "Investing", page: "investing" as Page },
    { title: "ATMs", page: "branches" as Page },
    { title: "Education", page: "education" as Page },
  ];
  return (
    <footer className="bg-[#1b1e22] text-white">
      <div className="mx-auto max-w-[1180px] px-4 py-12">
        <Logo light wordClass="text-[24px]" />
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {cols.map((col) => (
            <button key={col.title} onClick={() => onNav(col.page)} className="text-left text-white/80 hover:text-white hover:underline">
              {col.title}
            </button>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-white/55">
          Independent interface preview for demonstration. Not affiliated with, endorsed by, or sponsored by JPMorgan Chase & Co. or JPMorgan Chase Bank, N.A. “Chase,” the octagon symbol, and product names are used here only to recreate a familiar banking experience. No deposits are held, no payments are sent, and sign-in never leaves this browser. Rates, bonuses, and APYs are illustrative samples, not live offers. Member FDIC references are visual only.
        </p>
        <p className="mt-4 text-xs text-white/40">© {new Date().getFullYear()} Preview interface. Equal Housing Lender mark shown for layout only.</p>
      </div>
    </footer>
  );
}
