import { Suspense, lazy } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Activity, ArrowRight, BellRing, BrainCircuit, CalendarClock, ShieldCheck, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
const HeroScene = lazy(async () => ({ default: (await import('../components/HeroScene')).HeroScene }))

const highlights = [
  {
    icon: CalendarClock,
    title: 'Smart appointment orchestration',
    description: 'Patients book digitally, receive live token data, and arrive closer to their actual consultation window.',
  },
  {
    icon: BellRing,
    title: 'Realtime patient nudges',
    description: 'In-app alerts and email support keep patients, doctors, and staff informed as the queue changes.',
  },
  {
    icon: BrainCircuit,
    title: 'Delay prediction engine',
    description: 'AI-ready wait estimation turns raw queue flow into useful arrival guidance and hospital insight.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based hospital workspace',
    description: 'Separate patient, doctor, and admin experiences run on a secured JWT backend with audit-ready flows.',
  },
]

export function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroGlow = useTransform(scrollYProgress, [0, 0.55], [1, 0.3])
  const backdropY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          opacity: heroGlow,
          y: backdropY,
          background:
            'radial-gradient(circle at 20% 20%, rgba(28, 211, 162, 0.24), transparent 32%), radial-gradient(circle at 80% 15%, rgba(255, 122, 89, 0.2), transparent 24%), radial-gradient(circle at 50% 80%, rgba(85, 144, 255, 0.12), transparent 28%)',
        }}
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 text-sm text-slate-200 md:px-10">
        <Link to="/" className="flex items-center gap-3 text-base font-semibold tracking-wide text-white">
          <span className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-emerald-200">QL</span>
          QueueLess
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-slate-300 transition hover:text-white">
            Features
          </a>
          <a href="#workflow" className="text-slate-300 transition hover:text-white">
            Workflow
          </a>
          <a href="#roles" className="text-slate-300 transition hover:text-white">
            Roles
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link className="rounded-full border border-white/15 px-4 py-2 text-slate-100 transition hover:border-white/35" to="/login">
            Sign in
          </Link>
          <Link className="rounded-full bg-emerald-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-200" to="/register">
            Launch QueueLess
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-24 px-6 pb-24 md:px-10">
        <section className="grid items-center gap-12 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200"
            >
              Hospital queue intelligence
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="space-y-6"
            >
              <h1 className="section-title max-w-4xl text-5xl font-semibold leading-[0.98] text-white md:text-7xl">
                Turn hospital waiting into a guided, realtime digital flow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                QueueLess connects booking, queue tracking, analytics, prediction, and alerts into one calm operational surface for patients,
                doctors, and hospital administrators.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 py-3 text-base font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-emerald-200"
              >
                Enter the workspace
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-base text-slate-100 transition hover:border-emerald-200/60 hover:text-white"
              >
                Connect to your dashboard
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              {[
                ['Queue visibility', 'Live token state for patients and doctors'],
                ['Predictive timing', 'Arrival recommendations powered by queue context'],
                ['Operational control', 'Admin tools for capacity, load, and staffing'],
              ].map(([title, description]) => (
                <div key={title} className="glass rounded-3xl p-4">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{description}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.7 }}
            className="glass relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(28,211,162,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,122,89,0.18),transparent_30%)]" />
            <Suspense fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(28,211,162,0.18),transparent_52%)]" />}>
              <HeroScene />
            </Suspense>
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-lg">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Activity size={18} className="text-emerald-200" />
                Queue signal stabilized
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Waiting</div>
                  <div className="mt-2 text-2xl font-semibold text-white">12</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Predicted delay</div>
                  <div className="mt-2 text-2xl font-semibold text-white">18 min</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Alerts pushed</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Live</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="space-y-6">
          <div className="max-w-2xl space-y-4">
            <span className="text-sm uppercase tracking-[0.28em] text-emerald-200">Platform capabilities</span>
            <h2 className="section-title text-3xl text-white md:text-5xl">Built for real hospital queue pressure, not demo-only workflows.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((highlight, index) => (
              <motion.article
                key={highlight.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.08 }}
                className="glass rounded-[1.75rem] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200">
                  <highlight.icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{highlight.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{highlight.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="workflow" className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="glass rounded-[2rem] p-8">
            <span className="text-sm uppercase tracking-[0.28em] text-emerald-200">Workflow</span>
            <h2 className="section-title mt-4 text-3xl text-white md:text-4xl">One flow, three experiences, constant visibility.</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Patients see when to arrive, doctors control consultation state, and admins understand operational demand without relying on paper
              queues or guesswork.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Patient', 'Book digitally, get a token, track queue movement, and receive reminders before your turn.'],
              ['Doctor', 'Open the queue, start consultations, finish or skip visits, and keep the line moving with less chaos.'],
              ['Admin', 'Create departments, configure doctors, monitor hospital load, and review notification activity.'],
            ].map(([title, description], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.06 }}
                className="glass rounded-[1.75rem] p-6"
              >
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">0{index + 1}</div>
                <div className="mt-4 text-xl font-semibold text-white">{title}</div>
                <div className="mt-3 text-sm leading-7 text-slate-300">{description}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="roles" className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center gap-3 text-sm text-emerald-200">
              <Stethoscope size={18} />
              QueueLess frontend goals
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <li>Modern motion-driven patient experience without slowing down critical actions.</li>
              <li>Role-specific dashboards with secure API integration and room for backend expansion.</li>
              <li>Realtime notification streaming designed for the notification service you already built.</li>
            </ul>
          </div>
          <div className="glass rounded-[2rem] p-8">
            <div className="text-sm uppercase tracking-[0.28em] text-emerald-200">Ready for integration</div>
            <div className="mt-4 text-2xl font-semibold text-white">Frontend will connect directly to your Spring Boot backend on port 8082.</div>
            <div className="mt-4 text-base leading-7 text-slate-300">
              JWT auth, department CRUD, doctor creation, appointments, queue actions, analytics, prediction, and notifications are all mapped into
              the app shell.
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
