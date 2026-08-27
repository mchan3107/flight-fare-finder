import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Flight price notifier" },
      {
        name: "description",
        content: "Sign in to manage your San Jose fare watches and target prices.",
      },
      { property: "og:title", content: "Sign in — Flight price notifier" },
      {
        property: "og:description",
        content: "Manage your San Jose fare watches and target prices.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/watches", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/watches", replace: true });
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
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/watches", replace: true });
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

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </main>
    </div>
  );
}
