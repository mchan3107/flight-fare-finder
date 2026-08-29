import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/use-page-meta";

type AuthPageProps = {
  mode: "signin" | "signup";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  usePageMeta(
    mode === "signin"
      ? {
          title: "Sign in — Flight price notifier",
          description: "Sign in to manage your San Jose fare watches and target prices.",
          ogTitle: "Sign in — Flight price notifier",
          ogDescription: "Manage your San Jose fare watches and target prices.",
        }
      : {
          title: "Sign up — Flight price notifier",
          description: "Create an account to manage your San Jose fare watches and target prices.",
          ogTitle: "Sign up — Flight price notifier",
          ogDescription: "Manage your San Jose fare watches and target prices.",
        },
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/app", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    // On success the browser is redirected to Google, then back to /app —
    // nothing left to do here.
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded bg-board font-mono text-xs font-bold text-board-ink">
              SJC
            </span>
            <span className="text-[15px] font-bold tracking-tight">Flight price notifier</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-6 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          {mode === "signin" ? "Board your watches" : "Create an account"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in" : "Sign up"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fare alerts from San Jose, straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="mt-3 w-full rounded border border-line bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
        >
          Continue with Google
        </button>

        <Link
          to={mode === "signin" ? "/sign-up" : "/sign-in"}
          className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </Link>
      </main>
    </div>
  );
}
