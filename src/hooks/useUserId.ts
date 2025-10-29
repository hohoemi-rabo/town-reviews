'use client'

import { useState, useEffect } from 'react'

const USER_ID_KEY = 'machi_user_id'

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate or retrieve a unique user ID for reaction tracking
 * Uses LocalStorage to persist the ID across sessions
 */
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return

    try {
      // Try to get existing user ID from LocalStorage
      let storedUserId = localStorage.getItem(USER_ID_KEY)

      if (!storedUserId) {
        // Generate new UUID
        storedUserId = generateUUID()
        localStorage.setItem(USER_ID_KEY, storedUserId)
      }

      setUserId(storedUserId)
    } catch (error) {
      console.error('Failed to initialize user ID:', error)
      // Fallback: generate temporary ID (won't persist across sessions)
      setUserId(generateUUID())
    }
  }, [])

  return userId
}
