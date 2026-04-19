import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import notificationsData from '@/data/notifications'
import storage from '@/utils/storage'

const NotificationContext = createContext(null)

const NOTIFICATION_READ_STATE_KEY = 'notification_read_states'

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const savedReadStates = storage.getItem(NOTIFICATION_READ_STATE_KEY, {})

    return notificationsData.map((notification) => {
      const savedState = savedReadStates[notification.id]
      return {
        ...notification,
        isRead: savedState !== undefined ? savedState : notification.isRead,
      }
    })
  })

  const persistReadStates = useCallback((updatedNotifications) => {
    const readStates = {}
    updatedNotifications.forEach((notification) => {
      readStates[notification.id] = notification.isRead
    })
    storage.setItem(NOTIFICATION_READ_STATE_KEY, readStates)
  }, [])

  useEffect(() => {
    persistReadStates(notifications)
  }, [notifications, persistReadStates])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  )

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((notification) => {
        if (notification.id === notificationId) {
          return { ...notification, isRead: true }
        }
        return notification
      })
      return updated
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    )
  }, [])

  const markAsUnread = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === notificationId) {
          return { ...notification, isRead: false }
        }
        return notification
      }),
    )
  }, [])

  const getNotificationById = useCallback(
    (notificationId) => notifications.find((n) => n.id === notificationId) || null,
    [notifications],
  )

  const getNotificationsByType = useCallback(
    (type) => notifications.filter((n) => n.type === type),
    [notifications],
  )

  const getUnreadNotifications = useCallback(
    () => notifications.filter((n) => !n.isRead),
    [notifications],
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllRead,
      markAsUnread,
      getNotificationById,
      getNotificationsByType,
      getUnreadNotifications,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAllRead,
      markAsUnread,
      getNotificationById,
      getNotificationsByType,
      getUnreadNotifications,
    ],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }

  return context
}

export default NotificationContext