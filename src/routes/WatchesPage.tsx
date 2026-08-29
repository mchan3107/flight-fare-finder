import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/use-page-meta";

type Watch = {
  id: string;
  destination_code: string;
  destination_city: string;
  target_price: number;
  current_price: number | null;
  is_active: boolean;
};

const money = (v: number | null) => (v == null ? "—" : `$${Math.round(Number(v))}`);

export default function WatchesPage() {
  usePageMeta({
    title: "My watches — Flight price notifier",
    description: "Track your San Jose routes and target prices in one place.",
    ogTitle: "My watches — Flight price notifier",
    ogDescription: "Track your San Jose routes and target prices in one place.",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [city, setCity] = useState("");
  const [target, setTarget] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const watchesQuery = useQuery({
    queryKey: ["fare_watches"],
    queryFn: async (): Promise<Watch[]> => {
      const { data, error } = await supabase
        .from("fare_watches")
        .select("id,destination_code,destination_city,target_price,current_price,is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Watch[];
    },
  });

  const addWatch = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("fare_watches").insert({
        user_id: userId,
        destination_code: code.trim().toUpperCase(),
        destination_city: city.trim(),
        target_price: Number(target),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCode("");
      setCity("");
      setTarget("");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["fare_watches"] });
      toast.success("Watch added — we'll email you on a drop.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add watch"),
  });

  const removeWatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fare_watches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fare_watches"] }),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/sign-in", { replace: true });
  }

  const watches = watchesQuery.data ?? [];
  const atTarget = watches.filter(
    (w) => w.current_price != null && Number(w.current_price) <= Number(w.target_price),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              The app
            </span>
            <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight">
              Your watches, at a glance
            </h1>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">Departs SJC</span>
        </div>

        <div className="overflow-hidden rounded-xl ring-1 ring-line">
          <div className="flex h-12 items-center justify-between border-b border-line bg-background px-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="grid size-6 place-items-center rounded bg-board font-mono text-[10px] font-bold text-board-ink"
              >
                SJC
              </Link>
              <span className="text-[13px] font-semibold">My watches</span>
              <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                <span className="animate-tick size-1.5 rounded-full bg-accent" /> Watching{" "}
                {watches.length} route{watches.length === 1 ? "" : "s"}
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

          <div className="grid md:grid-cols-12">
            <aside className="border-b border-line p-4 md:col-span-3 md:border-b-0 md:border-r">
              <button
                onClick={() => setShowForm((v) => !v)}
                className="w-full rounded bg-primary px-3 py-2 text-left text-[13px] font-semibold text-primary-foreground"
              >
                {showForm ? "− Close" : "+ Add watch"}
              </button>

              {showForm && (
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addWatch.mutate();
                  }}
                >
                  <input
                    required
                    maxLength={3}
                    placeholder="Code (LAX)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded border border-input bg-card px-2 py-1.5 font-mono text-[13px] uppercase outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded border border-input bg-card px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Target price"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full rounded border border-input bg-card px-2 py-1.5 font-mono text-[13px] outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    disabled={addWatch.isPending}
                    className="w-full rounded bg-accent px-3 py-2 text-[13px] font-semibold text-accent-foreground disabled:opacity-60"
                  >
                    Save watch
                  </button>
                </form>
              )}

              <nav className="mt-4 space-y-0.5 text-[13px]">
                <div className="flex items-center justify-between rounded bg-primary/5 px-3 py-2 font-medium">
                  All watches{" "}
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {watches.length}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
                  Active{" "}
                  <span className="font-mono text-[11px]">
                    {watches.filter((w) => w.is_active).length}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
                  At target{" "}
                  <span className="font-mono text-[11px] text-accent">{atTarget.length}</span>
                </div>
              </nav>
            </aside>

            <div className="md:col-span-9">
              <div className="hidden grid-cols-12 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:grid">
                <span className="col-span-4">Route</span>
                <span className="col-span-2">Target</span>
                <span className="col-span-3">Cheapest</span>
                <span className="col-span-3 text-right">Status</span>
              </div>

              {watchesQuery.isLoading && (
                <p className="px-4 py-8 font-mono text-[11px] text-muted-foreground">Loading…</p>
              )}

              {!watchesQuery.isLoading && watches.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
                    Empty board
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your first route and target price. We'll email you when the fare drops.
                  </p>
                </div>
              )}

              {watches.map((w) => {
                const hit =
                  w.current_price != null && Number(w.current_price) <= Number(w.target_price);
                return (
                  <div key={w.id} className="border-b border-line px-4 py-3.5 last:border-b-0">
                    <div className="grid grid-cols-12 items-center text-sm">
                      <span className="col-span-4 pl-1 font-semibold tracking-wide">
                        SJC → {w.destination_code}
                        <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                          {w.destination_city}
                        </span>
                      </span>
                      <span className="col-span-2 font-mono tabular-nums text-muted-foreground">
                        {money(w.target_price)}
                      </span>
                      <span className="col-span-3 font-mono tabular-nums text-muted-foreground">
                        {money(w.current_price)}
                      </span>
                      <span className="col-span-3 flex items-center justify-end gap-2 pl-1 sm:pl-0">
                        <span
                          className={
                            hit
                              ? "inline-block rounded bg-accent px-2 py-1 text-[11px] font-semibold tabular-nums text-accent-foreground"
                              : "inline-block rounded px-2 py-1 text-[11px] font-medium tabular-nums text-muted-foreground"
                          }
                        >
                          {hit ? "At target" : "Watching"}
                        </span>
                        <button
                          onClick={() => removeWatch.mutate(w.id)}
                          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-destructive"
                        >
                          Del
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
