import { useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight, ContactRound, LockKeyhole, Mail, Phone } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/api'

export function RegisterPage() {
  const { register, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
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
      await register(form)
      navigate('/dashboard')
    } catch (submitError) {
      setError(extractErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-3xl rounded-[2rem] p-8 md:p-10">
        <div className="mb-8">
          <Link to="/" className="text-sm text-emerald-200 transition hover:text-emerald-100">
            Back to home
          </Link>
          <h1 className="section-title mt-4 text-4xl text-white">Create patient account</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            New patient registration is open from the frontend. Doctor and admin access stays controlled through the backend workflow.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
          {[
            { key: 'name', label: 'Full name', icon: ContactRound, type: 'text', placeholder: 'Aarav Singh' },
            { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'patient@queueless.local' },
            { key: 'phone', label: 'Phone', icon: Phone, type: 'text', placeholder: '9876543210' },
            { key: 'password', label: 'Password', icon: LockKeyhole, type: 'password', placeholder: 'At least 8 characters' },
          ].map((field) => (
            <label key={field.key} className="block space-y-2">
              <span className="text-sm text-slate-300">{field.label}</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                <field.icon size={18} className="text-emerald-200" />
                <input
                  required
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  placeholder={field.placeholder}
                />
              </div>
            </label>
          ))}

          {error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">
              <AlertCircle size={18} className="mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-300">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-emerald-200 transition hover:text-emerald-100">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
