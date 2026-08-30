import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/use-page-meta";

// All application data (subscriptions) lives in DynamoDB on AWS, written only by
// Lambdas behind this API Gateway — Supabase is auth-only in this product.
const API_BASE = "https://ui1iphgmb4.execute-api.us-east-1.amazonaws.com";

type Plan = {
  name: "tokyo" | "seoul";
  label: string;
  city: string;
  origin: string;
  destination: string;
  route: string;
  hint: number;
};

const PLANS: Plan[] = [
  {
    name: "tokyo",
    label: "台北 ✈ 東京",
    city: "Tokyo",
    origin: "TPE",
    destination: "TYO",
    route: "TPE-TYO",
    hint: 9325,
  },
  {
    name: "seoul",
    label: "台北 ✈ 首爾",
    city: "Seoul",
    origin: "TPE",
    destination: "SEL",
    route: "TPE-SEL",
    hint: 5989,
  },
];

type Subscription = {
  email: string;
  route: string;
  plan_name: string;
  origin: string;
  destination: string;
  target_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

const twd = (v: number | null | undefined) =>
  v == null ? "—" : `NT$${Math.round(Number(v)).toLocaleString()}`;

export default function WatchesPage() {
  usePageMeta({
    title: "My watches — Flight price notifier",
    description: "Track your fare alerts and target prices in one place.",
    ogTitle: "My watches — Flight price notifier",
    ogDescription: "Track your fare alerts and target prices in one place.",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [targets, setTargets] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const subsQuery = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: async (): Promise<Subscription[]> => {
      const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Could not load your subscriptions");
      return (await res.json()) as Subscription[];
    },
    enabled: Boolean(email),
  });

  const subscribe = useMutation({
    mutationFn: async ({ plan, targetPrice }: { plan: Plan; targetPrice: number }) => {
      const res = await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan_name: plan.name, target_price: targetPrice }),
      });
      if (!res.ok) throw new Error("Could not save your target price");
    },
    onSuccess: (_data, { plan }) => {
      setEditing((e) => ({ ...e, [plan.name]: false }));
      queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
      toast.success(`Tracking ${plan.label} — we'll email you when it hits your target.`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/sign-in", { replace: true });
  }

  const byRoute = new Map((subsQuery.data ?? []).map((s) => [s.route, s]));
  const subscribedCount = (subsQuery.data ?? []).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              The app
            </span>
            <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight">
              Your watches, at a glance
            </h1>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">Departs TPE</span>
        </div>

        <div className="overflow-hidden rounded-xl ring-1 ring-line">
          <div className="flex h-12 items-center justify-between border-b border-line bg-background px-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="grid size-6 place-items-center rounded bg-board font-mono text-[10px] font-bold text-board-ink"
              >
                TPE
              </Link>
              <span className="text-[13px] font-semibold">My watches</span>
              <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                <span className="animate-tick size-1.5 rounded-full bg-accent" /> Watching{" "}
                {subscribedCount} route{subscribedCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] text-muted-foreground sm:block">{email}</span>
              <button
                onClick={signOut}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {subsQuery.isLoading && (
              <p className="col-span-2 py-8 text-center font-mono text-[11px] text-muted-foreground">
                Loading…
              </p>
            )}

            {!subsQuery.isLoading &&
              PLANS.map((plan) => {
                const sub = byRoute.get(plan.route);
                const isEditing = editing[plan.name] ?? !sub;
                return (
                  <div key={plan.name} className="rounded-lg border border-line p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tracking-wide">{plan.label}</span>
                      {sub && (
                        <span className="inline-block rounded bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                          已訂閱 · Subscribed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Cheapest around {twd(plan.hint)} right now
                    </p>

                    {sub && !isEditing ? (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-sm tabular-nums text-muted-foreground">
                          Target: {twd(sub.target_price)}
                        </span>
                        <button
                          onClick={() => {
                            setTargets((t) => ({ ...t, [plan.name]: String(sub.target_price) }));
                            setEditing((e) => ({ ...e, [plan.name]: true }));
                          }}
                          className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
                        >
                          更新目標價 · Update
                        </button>
                      </div>
                    ) : (
                      <form
                        className="mt-3 flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const value = Number(targets[plan.name]);
                          if (!value || value <= 0) {
                            toast.error("Enter a valid target price");
                            return;
                          }
                          subscribe.mutate({ plan, targetPrice: value });
                        }}
                      >
                        <input
                          required
                          type="number"
                          min={1}
                          placeholder={`Target price (${plan.hint})`}
                          value={targets[plan.name] ?? ""}
                          onChange={(e) =>
                            setTargets((t) => ({ ...t, [plan.name]: e.target.value }))
                          }
                          className="w-full rounded border border-input bg-card px-2 py-1.5 font-mono text-[13px] outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          type="submit"
                          disabled={subscribe.isPending}
                          className="shrink-0 rounded bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground disabled:opacity-60"
                        >
                          {sub ? "Save" : "開始追蹤"}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
