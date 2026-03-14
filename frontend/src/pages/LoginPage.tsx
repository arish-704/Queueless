import { useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/api'

export function LoginPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(form)
      navigate((location.state as { from?: string } | null)?.from || '/dashboard')
    } catch (submitError) {
      setError(extractErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass grid w-full max-w-5xl overflow-hidden rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="hidden bg-[radial-gradient(circle_at_top,rgba(28,211,162,0.24),transparent_34%),linear-gradient(180deg,rgba(11,23,34,0.95),rgba(8,17,28,0.88))] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-emerald-200">QueueLess secure access</div>
            <h1 className="section-title mt-6 text-5xl leading-tight text-white">Step into the live hospital workspace.</h1>
          </div>
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>Use your patient, doctor, or admin credentials to access the correct dashboard and protected actions.</p>
            <p>JWT tokens are stored locally and attached automatically to API requests.</p>
          </div>
        </div>
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <Link to="/" className="text-sm text-emerald-200 transition hover:text-emerald-100">
              Back to home
            </Link>
            <h2 className="section-title mt-4 text-4xl text-white">Sign in</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Connect to your QueueLess account and continue exactly where the queue stands.</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                <Mail size={18} className="text-emerald-200" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  placeholder="patient1@queueless.local"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                <LockKeyhole size={18} className="text-emerald-200" />
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  placeholder="Your password"
                />
              </div>
            </label>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                <AlertCircle size={18} className="mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            Need a patient account?{' '}
            <Link to="/register" className="font-medium text-emerald-200 transition hover:text-emerald-100">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
