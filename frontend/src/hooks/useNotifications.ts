import { useEffect, useState } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { apiClient, extractErrorMessage, getApiBaseUrl } from '../lib/api'
import type { NotificationItem } from '../lib/types'

export function useNotifications(token: string | null, adminView = false) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setNotifications([])
      return
    }

    const loadInitial = async () => {
      try {
        const items = adminView
          ? await apiClient.getAdminNotifications()
          : await apiClient.getNotifications()
        setNotifications(items)
      } catch (loadError) {
        setError(extractErrorMessage(loadError))
      }
    }

    void loadInitial()
  }, [adminView, token])

  useEffect(() => {
    if (!token || adminView) {
      return
    }

    const controller = new AbortController()
    void fetchEventSource(`${getApiBaseUrl()}/api/notifications/stream`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(event) {
        if (event.event !== 'notification' || !event.data) {
          return
        }
        try {
          const payload = JSON.parse(event.data) as NotificationItem
          setNotifications((current) => {
            const next = [payload, ...current.filter((item) => item.id !== payload.id)]
            return next.slice(0, 25)
          })
        } catch {
          setError('Realtime notification payload could not be read.')
        }
      },
      onerror(streamError) {
        setError(extractErrorMessage(streamError))
        throw streamError
      },
    })

    return () => controller.abort()
  }, [adminView, token])

  return {
    notifications,
    notificationError: error,
    setNotifications,
  }
}
