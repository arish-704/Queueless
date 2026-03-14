export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface AuthResponse {
  accessToken: string
  userId: string
  name: string
  email: string
  phone: string
  role: UserRole
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface Department {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface DoctorAvailability {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  slotDurationMinutes: number
  maxPatients: number
}

export interface Doctor {
  id: string
  userId: string
  doctorName: string
  doctorEmail: string
  doctorPhone: string
  departmentId: string
  departmentName: string
  qualification: string
  licenseNumber: string
  experienceYears: number
  averageConsultationMinutes: number
  consultationBufferMinutes: number
  acceptingAppointments: boolean
  availability: DoctorAvailability[]
}

export interface Appointment {
  appointmentId: string
  doctorId: string
  doctorName: string
  departmentName: string
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  status: string
  priority: string
  symptoms: string
  notes: string
  estimatedConsultationMinutes: number
  estimatedStartTime: string
  recommendedArrivalTime: string
  tokenId: string | null
  tokenNumber: number | null
  queueStatus: string | null
  predictedWaitMinutes: number | null
}

export interface QueueToken {
  tokenId: string
  appointmentId: string
  tokenNumber: number
  queueStatus: string
  priority: string
  predictedWaitMinutes: number
  queuePosition: number
  patientName: string
  doctorName: string
  recommendedArrivalTime: string
  startedAt: string | null
  completedAt: string | null
}

export interface DoctorQueue {
  doctorId: string
  doctorName: string
  queueDate: string
  waitingCount: number
  inProgressCount: number
  completedCount: number
  tokens: QueueToken[]
}

export interface WaitTimePrediction {
  doctorId: string
  waitingPatients: number
  emergencyPatientsAhead: number
  predictedWaitMinutes: number
  estimatedConsultationStart: string
  recommendedArrivalTime: string
  predictionMode: string
}

export interface NotificationItem {
  id: string
  type: string
  channel: string
  status: string
  title: string
  message: string
  recipient: string
  createdAt: string
}

export interface AnalyticsOverview {
  date: string
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  waitingTokens: number
  inProgressTokens: number
  completedAppointments: number
  appointmentsByDepartment: Record<string, number>
}
