import axios, { AxiosError } from 'axios'
import { tokenStorage } from './storage'
import type {
  AnalyticsOverview,
  ApiResponse,
  Appointment,
  AuthResponse,
  Department,
  Doctor,
  DoctorAvailability,
  DoctorQueue,
  NotificationItem,
  QueueToken,
  UserProfile,
  WaitTimePrediction,
} from './types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8082'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function extractErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, string> | ApiResponse<unknown>>
    const data = axiosError.response?.data

    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string') {
        return data.message
      }
      const values = Object.values(data)
      if (values.length > 0 && values.every((value) => typeof value === 'string')) {
        return values.join(' | ')
      }
    }

    if (axiosError.message) {
      return axiosError.message
    }
  }

  return 'Request failed. Please try again.'
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request
  return response.data.data
}

export const apiClient = {
  register(payload: { name: string; email: string; phone: string; password: string }) {
    return unwrap<AuthResponse>(api.post('/api/auth/register', payload))
  },
  login(payload: { email: string; password: string }) {
    return unwrap<AuthResponse>(api.post('/api/auth/login', payload))
  },
  me() {
    return unwrap<UserProfile>(api.get('/api/auth/me'))
  },
  getDepartments() {
    return unwrap<Department[]>(api.get('/api/departments'))
  },
  createDepartment(payload: { name: string; description: string }) {
    return unwrap<Department>(api.post('/api/admin/departments', payload))
  },
  getDoctors() {
    return unwrap<Doctor[]>(api.get('/api/doctors'))
  },
  getDoctorAvailability(doctorId: string) {
    return unwrap<DoctorAvailability[]>(api.get(`/api/doctors/${doctorId}/availability`))
  },
  createDoctor(payload: {
    name: string
    email: string
    phone: string
    password: string
    departmentId: string
    qualification: string
    licenseNumber: string
    experienceYears: number
    averageConsultationMinutes: number
    consultationBufferMinutes: number
  }) {
    return unwrap<Doctor>(api.post('/api/admin/doctors', payload))
  },
  addDoctorAvailability(
    doctorId: string,
    payload: {
      dayOfWeek: string
      startTime: string
      endTime: string
      slotDurationMinutes: number
      maxPatients: number
    },
  ) {
    return unwrap<DoctorAvailability>(api.post(`/api/admin/doctors/${doctorId}/availability`, payload))
  },
  getAppointments() {
    return unwrap<Appointment[]>(api.get('/api/patient/appointments'))
  },
  createAppointment(payload: {
    doctorId: string
    appointmentDate: string
    appointmentTime: string
    priority: string
    symptoms: string
    notes: string
  }) {
    return unwrap<Appointment>(api.post('/api/patient/appointments', payload))
  },
  cancelAppointment(appointmentId: string) {
    return unwrap<Appointment>(api.put(`/api/patient/appointments/${appointmentId}/cancel`))
  },
  checkInAppointment(appointmentId: string) {
    return unwrap<Appointment>(api.post(`/api/patient/appointments/${appointmentId}/check-in`))
  },
  getPatientQueue(tokenId: string) {
    return unwrap<QueueToken>(api.get(`/api/queue/patient/${tokenId}`))
  },
  getDoctorQueue(doctorId: string, queueDate: string) {
    return unwrap<DoctorQueue>(api.get(`/api/queue/doctor/${doctorId}`, { params: { queueDate } }))
  },
  startConsultation(appointmentId: string) {
    return unwrap<QueueToken>(api.post(`/api/doctor/queue/appointments/${appointmentId}/start`))
  },
  completeConsultation(appointmentId: string) {
    return unwrap<QueueToken>(api.post(`/api/doctor/queue/appointments/${appointmentId}/complete`))
  },
  skipConsultation(appointmentId: string) {
    return unwrap<QueueToken>(api.post(`/api/doctor/queue/appointments/${appointmentId}/skip`))
  },
  getPrediction(doctorId: string, appointmentTime?: string) {
    return unwrap<WaitTimePrediction>(
      api.get(`/api/predictions/doctors/${doctorId}/wait-time`, {
        params: appointmentTime ? { appointmentTime } : {},
      }),
    )
  },
  getNotifications() {
    return unwrap<NotificationItem[]>(api.get('/api/notifications'))
  },
  getAdminNotifications() {
    return unwrap<NotificationItem[]>(api.get('/api/admin/notifications'))
  },
  getAnalytics(date?: string) {
    return unwrap<AnalyticsOverview>(
      api.get('/api/admin/analytics/overview', {
        params: date ? { reportDate: date } : {},
      }),
    )
  },
}
