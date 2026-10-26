import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-neutral-border bg-neutral-card/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-focus inline-block"></span>
            <span className="font-semibold text-lg tracking-tight">FoCient</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-text hover:text-focus transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/today"
              className="text-sm font-semibold bg-focus hover:bg-focus-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-efficient-subtle border border-efficient-border text-efficient-text text-xs font-semibold uppercase tracking-wider mb-8">
          Focus & Efficient • Guilt-Free Productivity
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-text max-w-3xl leading-tight">
          Achieve daily cognitive clarity without punitive pressure.
        </h1>

        <p className="mt-6 text-lg text-neutral-text/80 max-w-2xl font-normal leading-relaxed">
          FoCient isolates your Top 3 daily priorities, places tasks quietly into your timeline,
          and automatically reschedules downstream delays with zero guilt.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/today"
            className="px-6 py-3 bg-focus hover:bg-focus-hover text-white font-semibold rounded-lg shadow-focient-2 transition-all"
          >
            Start Today Plan
          </Link>
          <Link
            href="/onboarding"
            className="px-6 py-3 bg-neutral-card hover:bg-neutral-muted border border-neutral-border text-neutral-text font-medium rounded-lg shadow-focient-1 transition-all"
          >
            Customize Working Hours
          </Link>
        </div>

        {/* 3 Pillars Matrix */}
        <section className="mt-24 grid md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-6 bg-neutral-card rounded-xl border border-neutral-border shadow-focient-1">
            <div className="w-8 h-8 rounded-lg bg-focus-subtle text-focus font-semibold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-neutral-text mb-2">Top 3 Focus Isolation</h3>
            <p className="text-sm text-neutral-text/75 font-normal leading-relaxed">
              Shield yourself from overwhelming backlogs by locking in exactly three critical priorities per day.
            </p>
          </div>

          <div className="p-6 bg-neutral-card rounded-xl border border-neutral-border shadow-focient-1">
            <div className="w-8 h-8 rounded-lg bg-efficient-subtle text-efficient font-semibold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-neutral-text mb-2">Silent Slot Placement</h3>
            <p className="text-sm text-neutral-text/75 font-normal leading-relaxed">
              Deterministic background scheduling fits your tasks seamlessly between existing meetings and events.
            </p>
          </div>

          <div className="p-6 bg-neutral-card rounded-xl border border-neutral-border shadow-focient-1">
            <div className="w-8 h-8 rounded-lg bg-warning-subtle text-warning font-semibold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-neutral-text mb-2">Guilt-Free Rescheduling</h3>
            <p className="text-sm text-neutral-text/75 font-normal leading-relaxed">
              When meetings overrun or life happens, downstream tasks shift adaptively without shame or red alerts.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-border py-8 bg-neutral-card text-center text-xs text-neutral-text/60">
        © 2026 FoCient. Single Typeface (100% Inter) • Monorepo Architecture.
      </footer>
    </div>
  );
}
