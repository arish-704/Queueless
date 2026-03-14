import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient, extractErrorMessage } from '../lib/api'
import { tokenStorage, userStorage } from '../lib/storage'
import type { AuthResponse, UserProfile } from '../lib/types'

interface AuthContextValue {
  token: string | null
  user: UserProfile | null
  loading: boolean
  login: (payload: { email: string; password: string }) => Promise<void>
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapAuthResponseToProfile(response: AuthResponse): UserProfile {
  return {
    id: response.userId,
    name: response.name,
    email: response.email,
    phone: response.phone,
    role: response.role,
    active: true,
    createdAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(tokenStorage.get())
  const [user, setUser] = useState<UserProfile | null>(userStorage.get())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      const existingToken = tokenStorage.get()
      if (!existingToken) {
        setLoading(false)
        return
      }

      try {
        const profile = await apiClient.me()
        setUser(profile)
        userStorage.set(profile)
      } catch {
        tokenStorage.clear()
        userStorage.clear()
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void initialize()
  }, [])

  const applySession = async (response: AuthResponse) => {
    tokenStorage.set(response.accessToken)
    setToken(response.accessToken)
    const optimisticProfile = mapAuthResponseToProfile(response)
    setUser(optimisticProfile)
    userStorage.set(optimisticProfile)

    try {
      const profile = await apiClient.me()
      setUser(profile)
      userStorage.set(profile)
    } catch {
      setUser(optimisticProfile)
    }
  }

  const login = async (payload: { email: string; password: string }) => {
    const response = await apiClient.login(payload)
    await applySession(response)
  }

  const register = async (payload: {
    name: string
    email: string
    phone: string
    password: string
  }) => {
    const response = await apiClient.register(payload)
    await applySession(response)
  }

  const logout = () => {
    tokenStorage.clear()
    userStorage.clear()
    setToken(null)
    setUser(null)
  }

  const refreshProfile = async () => {
    try {
      const profile = await apiClient.me()
      setUser(profile)
      userStorage.set(profile)
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
