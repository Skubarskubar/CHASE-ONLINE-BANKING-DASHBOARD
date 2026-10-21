import { useEffect, useState } from "react";
import BankingApp from "@/BankingApp";
import PublicSite from "@/PublicSite";
import { DATA_KEY, DEFAULT_PASSWORD, SESSION_KEY, USERNAME, loadState } from "@/data";
import type { BankState } from "@/types";

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [state, setState] = useState<BankState>(() => loadState());
  const [justSignedOut, setJustSignedOut] = useState(false);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, authed ? "1" : "0");
    if (!authed) document.title = "Chase Online | Banking, Credit Cards & Home Loans";
  }, [authed]);

  if (!authed) {
    return (
      <PublicSite
        twoStep={state.twoStep}
        justSignedOut={justSignedOut}
        preview={() => ({ username: USERNAME, password: state.password || DEFAULT_PASSWORD })}
        validate={(username, password) => username.trim().toLowerCase() === USERNAME && password === state.password}
        onAuthenticated={() => {
          setState((current) => ({ ...current, lastSignIn: new Date().toISOString() }));
          setAuthed(true);
          setJustSignedOut(false);
        }}
      />
    );
  }

  return (
    <BankingApp
      state={state}
      setState={setState}
      onSignOut={() => {
        setAuthed(false);
        setJustSignedOut(true);
      }}
    />
  );
}
