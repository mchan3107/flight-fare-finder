import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight price notifier — SJC fare alerts under your budget" },
      {
        name: "description",
        content:
          "Set a route from San Jose and a target price. We watch the cheapest fare all day and email you the moment it drops to or below your number.",
      },
      { property: "og:title", content: "Flight price notifier — SJC fare alerts" },
      {
        property: "og:description",
        content:
          "Set a route and a target price. We email you when the fare drops. Departs San Jose (SJC).",
      },
    ],
  }),
  component: Landing,
});

const board = [
  { route: "SJC → LAX", price: "$128", from: "▼ from $189", delay: "200ms", hit: false },
  { route: "SJC → DEN", price: "$342", from: "▼ from $410", delay: "320ms", hit: false },
  { route: "SJC → SEA", price: "$199", from: "AT YOUR TARGET", delay: "440ms", hit: true },
];

const steps = [
  {
    tag: "(a)",
    title: "Pick a route",
    body: "Any destination from San Jose. We track the cheapest departure we can find, not a fixed flight.",
  },
  {
    tag: "(b)",
    title: "Set your ceiling",
    body: "Type the most you'll pay. That's the line. We re-check fares all day long, silently.",
  },
  {
    tag: "(c)",
    title: "Get the email",
    body: "The instant a fare drops to or below your target, one email lands. That's the signal to act.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded bg-board font-mono text-xs font-bold text-board-ink">
              SJC
            </span>
            <span className="text-[15px] font-bold tracking-tight">Flight price notifier</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#how" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#routes" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              Routes
            </a>
            <Link
              to="/auth"
              className="rounded bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground ring-1 ring-black/5 transition-colors hover:bg-board"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-14 pb-12">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Departs San Jose · SJC
            </p>
            <h1 className="animate-rise mt-4 text-balance text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[0.98] tracking-tight [animation-delay:60ms]">
              Set a route. Set a ceiling.
            </h1>
            <p className="animate-rise mt-5 max-w-[42ch] text-pretty text-[15px] leading-relaxed text-muted-foreground [animation-delay:120ms]">
              We watch the cheapest fare on your route, all day, every day. The moment it falls to
              or below your target price, we email you. You don't book — you just wait for the drop.
            </p>
            <div className="animate-rise mt-7 flex flex-wrap items-center gap-3 [animation-delay:180ms]">
              <Link
                to="/auth"
                className="rounded bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground ring-1 ring-black/5 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Sign in to your watches
              </Link>
              <a
                href="#routes"
                className="px-1 py-2.5 text-sm font-medium transition-colors hover:text-accent"
              >
                See live fares ↓
              </a>
            </div>
            <p className="animate-rise mt-6 font-mono text-[11px] text-muted-foreground [animation-delay:240ms]">
              Email alerts only · No booking · No card required
            </p>
          </div>

          <div id="routes" className="lg:col-span-6">
            <div className="rounded-xl bg-board p-5 ring-1 ring-black/10">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-board-ink/60">
                <span>Now boarding · SJC</span>
                <span className="flex items-center gap-1.5">
                  <span className="animate-tick size-1.5 rounded-full bg-accent" /> Live
                </span>
              </div>
              <div className="mt-4 divide-y divide-board-ink/15">
                {board.map((row) => (
                  <div
                    key={row.route}
                    className="flex items-center justify-between py-3 font-mono text-board-ink"
                  >
                    <div>
                      <div className="text-[15px] font-semibold tracking-wide">{row.route}</div>
                      <div className="text-[10px] text-board-ink/50">Cheapest · 1d</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`animate-flip text-[22px] font-bold tabular-nums ${row.hit ? "text-accent" : ""}`}
                        style={{ animationDelay: row.delay }}
                      >
                        {row.price}
                      </div>
                      <div
                        className={`text-[10px] ${row.hit ? "text-accent/70" : "text-board-ink/50"}`}
                      >
                        {row.from}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-balance text-2xl font-bold tracking-tight">How it works</h2>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Three steps · zero clicking
            </span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl bg-line md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.tag} className="bg-background p-6">
                <span className="font-mono text-[11px] text-accent">{step.tag}</span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded bg-board font-mono text-xs font-bold text-board-ink">
              SJC
            </span>
            <span className="text-sm font-semibold">Flight price notifier</span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            Departs San Jose · Email alerts, not bookings · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
