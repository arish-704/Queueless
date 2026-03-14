import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BellRing,
  BrainCircuit,
  CalendarPlus2,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Shield,
  Sparkles,
  Stethoscope,
  Timer,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient, extractErrorMessage } from '../lib/api'
import { useNotifications } from '../hooks/useNotifications'
import type {
  AnalyticsOverview,
  Appointment,
  Department,
  Doctor,
  DoctorAvailability,
  DoctorQueue,
  NotificationItem,
  QueueToken,
  WaitTimePrediction,
} from '../lib/types'

function dt(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Not available'
}

function d(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value)) : 'Not available'
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="glass rounded-[1.75rem] p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">{text}</div>
}

export function DashboardPage() {
  const { user, token, logout, refreshProfile } = useAuth()
  const { notifications, notificationError, setNotifications } = useNotifications(token, user?.role === 'ADMIN')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [queue, setQueue] = useState<DoctorQueue | null>(null)
  const [tokenDetails, setTokenDetails] = useState<QueueToken | null>(null)
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null)
  const [availability, setAvailability] = useState<Record<string, DoctorAvailability[]>>({})

  const [departmentForm, setDepartmentForm] = useState({ name: '', description: '' })
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    departmentId: '',
    qualification: '',
    licenseNumber: '',
    experienceYears: 5,
    averageConsultationMinutes: 15,
    consultationBufferMinutes: 5,
  })
  const [availabilityForm, setAvailabilityForm] = useState({
    doctorId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00:00',
    endTime: '13:00:00',
    slotDurationMinutes: 15,
    maxPatients: 16,
  })
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: '10:00:00',
    priority: 'NORMAL',
    symptoms: '',
    notes: '',
  })

  const currentDoctor = useMemo(
    () => doctors.find((doctor) => doctor.userId === user?.id) || null,
    [doctors, user?.id],
  )

  const run = async (action: () => Promise<void>, success?: string) => {
    setError(null)
    setNotice(null)
    try {
      await action()
      if (success) {
        setNotice(success)
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }
    void run(async () => {
      await refreshProfile()
      const [departmentData, doctorData] = await Promise.all([apiClient.getDepartments(), apiClient.getDoctors()])
      setDepartments(departmentData)
      setDoctors(doctorData)
      if (!appointmentForm.doctorId && doctorData[0]) {
        setAppointmentForm((current) => ({ ...current, doctorId: doctorData[0].id }))
      }
      if (!availabilityForm.doctorId && doctorData[0]) {
        setAvailabilityForm((current) => ({ ...current, doctorId: doctorData[0].id }))
      }
      if (!doctorForm.departmentId && departmentData[0]) {
        setDoctorForm((current) => ({ ...current, departmentId: departmentData[0].id }))
      }
      if (user.role === 'PATIENT') {
        setAppointments(await apiClient.getAppointments())
      }
      if (user.role === 'ADMIN') {
        setAnalytics(await apiClient.getAnalytics())
      }
    })
    // role changes define which data to load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role])

  useEffect(() => {
    if (user?.role !== 'DOCTOR' || !currentDoctor) {
      return
    }
    void run(async () => {
      const queueData = await apiClient.getDoctorQueue(currentDoctor.id, new Date().toISOString().slice(0, 10))
      setQueue(queueData)
    })
    // currentDoctor is derived from backend doctor list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDoctor?.id, user?.role])

  useEffect(() => {
    if (!appointmentForm.doctorId) {
      setPrediction(null)
      return
    }
    const timer = window.setTimeout(() => {
      void apiClient
        .getPrediction(appointmentForm.doctorId, appointmentForm.appointmentTime)
        .then(setPrediction)
        .catch(() => setPrediction(null))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [appointmentForm.appointmentTime, appointmentForm.doctorId])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const statCards =
    user.role === 'ADMIN'
      ? [
          ['Doctors', analytics?.totalDoctors ?? doctors.length, <Shield size={18} />],
          ['Patients', analytics?.totalPatients ?? '-', <UserRound size={18} />],
          ['Appointments', analytics?.totalAppointments ?? '-', <ClipboardList size={18} />],
          ['Waiting tokens', analytics?.waitingTokens ?? '-', <Timer size={18} />],
        ]
      : user.role === 'DOCTOR'
        ? [
            ['Waiting now', queue?.waitingCount ?? 0, <Timer size={18} />],
            ['In progress', queue?.inProgressCount ?? 0, <Activity size={18} />],
            ['Completed', queue?.completedCount ?? 0, <CheckCircle2 size={18} />],
            ['Doctor profile', currentDoctor?.doctorName ?? 'Pending', <Stethoscope size={18} />],
          ]
        : [
            ['My appointments', appointments.length, <CalendarPlus2 size={18} />],
            ['Active tokens', appointments.filter((item) => item.tokenId && item.queueStatus !== 'DONE').length, <Activity size={18} />],
            ['Realtime alerts', notifications.length, <BellRing size={18} />],
            ['Prediction mode', prediction?.predictionMode ?? 'HEURISTIC', <BrainCircuit size={18} />],
          ]

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="glass flex flex-col gap-5 rounded-[2rem] px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-emerald-200">QueueLess command center</div>
            <h1 className="section-title mt-2 text-3xl text-white md:text-4xl">
              {user.role === 'ADMIN' ? 'Admin dashboard' : user.role === 'DOCTOR' ? 'Doctor dashboard' : 'Patient dashboard'}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Signed in as {user.name} ({user.email}). This workspace is mapped to your Spring Boot APIs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => void window.location.reload()} className="rounded-full border border-white/12 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-200/60">
              Refresh view
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-rose-400/12 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-400/20">
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        {notice ? <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{notice}</div> : null}
        {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
        {notificationError ? <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{notificationError}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(([label, value, icon]) => (
            <div key={String(label)} className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <span className="text-emerald-200">{icon}</span>
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">{String(value)}</div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {user.role === 'PATIENT' ? (
              <>
                <Panel title="Book appointment" subtitle="Create a hospital visit, preview wait time, then track the token flow.">
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <form
                      className="space-y-4"
                      onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault()
                        void run(async () => {
                          const created = await apiClient.createAppointment(appointmentForm)
                          setAppointments((current) => [created, ...current])
                        }, 'Appointment booked successfully.')
                      }}
                    >
                      <select value={appointmentForm.doctorId} onChange={(event) => setAppointmentForm((current) => ({ ...current, doctorId: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                        <option value="">Select doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.doctorName} - {doctor.departmentName}
                          </option>
                        ))}
                      </select>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input type="date" min={new Date().toISOString().slice(0, 10)} value={appointmentForm.appointmentDate} onChange={(event) => setAppointmentForm((current) => ({ ...current, appointmentDate: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                        <input type="time" step="1" value={appointmentForm.appointmentTime} onChange={(event) => setAppointmentForm((current) => ({ ...current, appointmentTime: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                      </div>
                      <select value={appointmentForm.priority} onChange={(event) => setAppointmentForm((current) => ({ ...current, priority: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                        <option value="NORMAL">NORMAL</option>
                        <option value="PRIORITY">PRIORITY</option>
                        <option value="EMERGENCY">EMERGENCY</option>
                      </select>
                      <textarea rows={3} value={appointmentForm.symptoms} onChange={(event) => setAppointmentForm((current) => ({ ...current, symptoms: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Symptoms" />
                      <textarea rows={3} value={appointmentForm.notes} onChange={(event) => setAppointmentForm((current) => ({ ...current, notes: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Notes for the doctor" />
                      <button className="rounded-full bg-emerald-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200">Book appointment</button>
                    </form>
                    <div className="space-y-4">
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
                        <div className="flex items-center gap-3 text-sm text-emerald-200">
                          <Sparkles size={18} />
                          Live wait prediction
                        </div>
                        {prediction ? (
                          <div className="mt-4 space-y-3 text-sm text-slate-300">
                            <div>Waiting patients: {prediction.waitingPatients}</div>
                            <div>Emergency patients ahead: {prediction.emergencyPatientsAhead}</div>
                            <div>Predicted wait: {prediction.predictedWaitMinutes} minutes</div>
                            <div>Estimated consultation start: {dt(prediction.estimatedConsultationStart)}</div>
                            <div>Recommended arrival: {dt(prediction.recommendedArrivalTime)}</div>
                          </div>
                        ) : (
                          <div className="mt-4 text-sm leading-7 text-slate-400">Choose a doctor and time to preview backend prediction output.</div>
                        )}
                      </div>
                      {doctors.slice(0, 3).map((doctor) => (
                        <div key={doctor.id} className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                          <div className="text-base font-semibold text-white">{doctor.doctorName}</div>
                          <div className="mt-1 text-sm text-slate-400">{doctor.departmentName}</div>
                          <div className="mt-3 text-sm text-slate-300">
                            {doctor.qualification} - {doctor.experienceYears} years - Avg {doctor.averageConsultationMinutes} min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="My appointments" subtitle="Check in, cancel, or inspect queue status for an active token.">
                  <div className="space-y-3">
                    {appointments.length === 0 ? (
                      <EmptyState text="No appointments booked yet." />
                    ) : (
                      appointments.map((appointment) => (
                        <div key={appointment.appointmentId} className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                            <div>
                              <div className="text-base font-semibold text-white">{appointment.doctorName}</div>
                              <div className="mt-1 text-sm text-slate-400">
                                {appointment.departmentName} - {d(appointment.appointmentDate)} - {appointment.appointmentTime}
                              </div>
                              <div className="mt-2 text-sm text-slate-300">
                                Status: {appointment.status} {appointment.queueStatus ? ` - Queue: ${appointment.queueStatus}` : ''}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {appointment.tokenId ? (
                                <button
                                  onClick={() =>
                                    void run(async () => {
                                      setTokenDetails(await apiClient.getPatientQueue(appointment.tokenId!))
                                    }, 'Queue status refreshed.')
                                  }
                                  className="rounded-full border border-white/12 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-200/60"
                                >
                                  Track token
                                </button>
                              ) : null}
                              <button
                                onClick={() =>
                                  void run(async () => {
                                    const updated = await apiClient.checkInAppointment(appointment.appointmentId)
                                    setAppointments((current) => current.map((item) => (item.appointmentId === updated.appointmentId ? updated : item)))
                                  }, 'Appointment checked in successfully.')
                                }
                                className="rounded-full border border-emerald-300/20 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-200/50"
                              >
                                Check in
                              </button>
                              <button
                                onClick={() =>
                                  void run(async () => {
                                    const updated = await apiClient.cancelAppointment(appointment.appointmentId)
                                    setAppointments((current) => current.map((item) => (item.appointmentId === updated.appointmentId ? updated : item)))
                                  }, 'Appointment cancelled successfully.')
                                }
                                className="rounded-full border border-rose-400/20 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Panel>

                <Panel title="Queue tracker" subtitle="Selected patient token from the queue endpoint.">
                  {tokenDetails ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4"><div className="text-sm text-slate-400">Queue position</div><div className="mt-2 text-3xl font-semibold text-white">{tokenDetails.queuePosition}</div></div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4"><div className="text-sm text-slate-400">Predicted wait</div><div className="mt-2 text-3xl font-semibold text-white">{tokenDetails.predictedWaitMinutes} min</div></div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4"><div className="text-sm text-slate-400">Queue status</div><div className="mt-2 text-xl font-semibold text-white">{tokenDetails.queueStatus}</div></div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4"><div className="text-sm text-slate-400">Recommended arrival</div><div className="mt-2 text-xl font-semibold text-white">{dt(tokenDetails.recommendedArrivalTime)}</div></div>
                    </div>
                  ) : (
                    <EmptyState text="Choose Track token on an appointment to load queue details here." />
                  )}
                </Panel>
              </>
            ) : null}
            {user.role === 'ADMIN' ? (
              <>
                <Panel title="Departments" subtitle="Create and review hospital departments.">
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <form
                      className="space-y-4"
                      onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault()
                        void run(async () => {
                          const created = await apiClient.createDepartment(departmentForm)
                          setDepartments((current) => [created, ...current])
                          setDepartmentForm({ name: '', description: '' })
                        }, 'Department created successfully.')
                      }}
                    >
                      <input value={departmentForm.name} onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Department name" />
                      <textarea rows={4} value={departmentForm.description} onChange={(event) => setDepartmentForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Department description" />
                      <button className="rounded-full bg-emerald-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200">Create department</button>
                    </form>
                    <div className="space-y-3">
                      {departments.length === 0 ? <EmptyState text="No departments available yet." /> : departments.map((department) => (
                        <div key={department.id} className="rounded-[1.25rem] border border-white/8 bg-white/5 p-4">
                          <div className="text-base font-semibold text-white">{department.name}</div>
                          <div className="mt-2 text-sm leading-7 text-slate-300">{department.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Doctor management" subtitle="Create doctors, then attach schedule blocks.">
                  <div className="grid gap-6 xl:grid-cols-2">
                    <form
                      className="grid gap-4"
                      onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault()
                        void run(async () => {
                          const created = await apiClient.createDoctor(doctorForm)
                          setDoctors((current) => [created, ...current])
                        }, 'Doctor profile created successfully.')
                      }}
                    >
                      <input value={doctorForm.name} onChange={(event) => setDoctorForm((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Doctor name" />
                      <input type="email" value={doctorForm.email} onChange={(event) => setDoctorForm((current) => ({ ...current, email: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="doctor@queueless.local" />
                      <input value={doctorForm.phone} onChange={(event) => setDoctorForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Phone" />
                      <input type="password" value={doctorForm.password} onChange={(event) => setDoctorForm((current) => ({ ...current, password: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Temporary password" />
                      <select value={doctorForm.departmentId} onChange={(event) => setDoctorForm((current) => ({ ...current, departmentId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                        <option value="">Select department</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                      <input value={doctorForm.qualification} onChange={(event) => setDoctorForm((current) => ({ ...current, qualification: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Qualification" />
                      <input value={doctorForm.licenseNumber} onChange={(event) => setDoctorForm((current) => ({ ...current, licenseNumber: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="License number" />
                      <div className="grid gap-4 md:grid-cols-3">
                        <input type="number" min="0" max="60" value={doctorForm.experienceYears} onChange={(event) => setDoctorForm((current) => ({ ...current, experienceYears: Number(event.target.value) }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="Experience" />
                        <input type="number" min="5" max="120" value={doctorForm.averageConsultationMinutes} onChange={(event) => setDoctorForm((current) => ({ ...current, averageConsultationMinutes: Number(event.target.value) }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="Avg min" />
                        <input type="number" min="0" max="60" value={doctorForm.consultationBufferMinutes} onChange={(event) => setDoctorForm((current) => ({ ...current, consultationBufferMinutes: Number(event.target.value) }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="Buffer" />
                      </div>
                      <button className="rounded-full bg-emerald-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200">Create doctor</button>
                    </form>

                    <div className="space-y-4">
                      <form
                        className="grid gap-4 rounded-[1.35rem] border border-white/8 bg-white/5 p-4"
                        onSubmit={(event: FormEvent<HTMLFormElement>) => {
                          event.preventDefault()
                          void run(async () => {
                            const created = await apiClient.addDoctorAvailability(availabilityForm.doctorId, availabilityForm)
                            setAvailability((current) => ({ ...current, [availabilityForm.doctorId]: [created, ...(current[availabilityForm.doctorId] || [])] }))
                          }, 'Doctor availability added successfully.')
                        }}
                      >
                        <div className="text-base font-semibold text-white">Add availability block</div>
                        <select value={availabilityForm.doctorId} onChange={(event) => setAvailabilityForm((current) => ({ ...current, doctorId: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none">
                          <option value="">Select doctor</option>
                          {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.doctorName}
                            </option>
                          ))}
                        </select>
                        <div className="grid gap-4 md:grid-cols-2">
                          <select value={availabilityForm.dayOfWeek} onChange={(event) => setAvailabilityForm((current) => ({ ...current, dayOfWeek: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none">
                            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((dayName) => (
                              <option key={dayName} value={dayName}>
                                {dayName}
                              </option>
                            ))}
                          </select>
                          <input type="number" min="1" max="100" value={availabilityForm.maxPatients} onChange={(event) => setAvailabilityForm((current) => ({ ...current, maxPatients: Number(event.target.value) }))} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" placeholder="Max patients" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <input type="time" step="1" value={availabilityForm.startTime} onChange={(event) => setAvailabilityForm((current) => ({ ...current, startTime: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
                          <input type="time" step="1" value={availabilityForm.endTime} onChange={(event) => setAvailabilityForm((current) => ({ ...current, endTime: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
                          <input type="number" min="5" max="60" value={availabilityForm.slotDurationMinutes} onChange={(event) => setAvailabilityForm((current) => ({ ...current, slotDurationMinutes: Number(event.target.value) }))} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" placeholder="Slot min" />
                        </div>
                        <button className="rounded-full border border-emerald-300/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/50">Add availability</button>
                      </form>
                      <div className="space-y-3">
                        {doctors.map((doctor) => (
                          <div key={doctor.id} className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                            <div className="text-base font-semibold text-white">{doctor.doctorName}</div>
                            <div className="mt-1 text-sm text-slate-400">{doctor.departmentName}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(availability[doctor.id] || doctor.availability || []).map((item) => (
                                <span key={item.id} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-200">
                                  {item.dayOfWeek} {item.startTime.slice(0, 5)}-{item.endTime.slice(0, 5)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel title="Operational analytics" subtitle="Overview data from the analytics endpoint.">
                  {analytics ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(analytics.appointmentsByDepartment).map(([name, count]) => (
                        <div key={name} className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                          <div className="text-sm text-slate-400">{name}</div>
                          <div className="mt-2 text-2xl font-semibold text-white">{count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Analytics will appear here after the backend responds." />
                  )}
                </Panel>
              </>
            ) : null}
          </div>

          <div className="space-y-6">
            <Panel title="Notifications" subtitle="Realtime feed plus stored notification history from the backend.">
              <div className="max-h-[580px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <EmptyState text="No notifications have arrived yet." />
                ) : (
                  notifications.map((item: NotificationItem) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-white">{item.title}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                            {item.type} - {item.channel} - {item.status}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">{dt(item.createdAt)}</div>
                      </div>
                      <div className="mt-3 text-sm leading-7 text-slate-300">{item.message}</div>
                    </motion.div>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Testing cues" subtitle="Useful checks while you finish backend and frontend validation.">
              <ul className="space-y-3 text-sm leading-7 text-slate-300">
                <li>Login with each role and confirm the dashboard changes based on backend role data.</li>
                <li>Book or manage appointments, then refresh notifications to verify realtime or stored event delivery.</li>
                <li>Use the prediction panel before booking to confirm the AI-ready wait endpoint responds correctly.</li>
                <li>Keep MySQL running on the configured port and ensure CORS points to the frontend dev server.</li>
              </ul>
            </Panel>

            <Panel title="Session controls" subtitle="Local session is stored in browser storage for smooth dashboard reloads.">
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
                  <Shield size={18} className="text-emerald-200" />
                  JWT token is attached automatically to protected API calls.
                </div>
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
                  <CheckCircle2 size={18} className="text-emerald-200" />
                  Current backend origin: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}
                </div>
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
                  <XCircle size={18} className="text-amber-200" />
                  Email and external SMS depend on backend service configuration when you test notifications fully.
                </div>
                <button onClick={() => setNotifications([])} className="w-full rounded-full border border-white/12 px-4 py-3 text-sm text-slate-100 transition hover:border-emerald-200/60">
                  Clear notification feed
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
