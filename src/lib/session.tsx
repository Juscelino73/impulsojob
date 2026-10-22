import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type SessionState = { ready: boolean; userId: string | null; error: string | null };
const Ctx = createContext<SessionState>({ ready: false, userId: null, error: null });

/**
 * Anonymous workspace session: each browser gets a private anonymous identity.
 * Backend row-level rules scope every row to that identity, so changing an ID in
 * the browser never exposes someone else's data. Real accounts can be linked later.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ ready: false, userId: null, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      let user = data.session?.user ?? null;
      if (!user) {
        const res = await supabase.auth.signInAnonymously();
        if (res.error) {
          if (active) setState({ ready: true, userId: null, error: res.error.message });
          return;
        }
        user = res.data.user;
      }
      if (active) setState({ ready: true, userId: user?.id ?? null, error: null });
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) setState({ ready: true, userId: session.user.id, error: null });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
