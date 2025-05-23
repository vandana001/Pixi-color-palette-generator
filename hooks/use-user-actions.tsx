"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserAction } from "@/components/color-assistant"

export function useUserActions() {
  const [actions, setActions] = useState<UserAction[]>([])
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)

  // Add a new action
  const addAction = useCallback(
    (type: UserAction["type"], data?: any) => {
      const newAction: UserAction = {
        type,
        data,
        timestamp: Date.now(),
      }

      setActions((prev) => [...prev, newAction])

      // Reset idle timer
      if (idleTimer) {
        clearTimeout(idleTimer)
      }

      // Set new idle timer (3 seconds)
      const timer = setTimeout(() => {
        setActions((prev) => [
          ...prev,
          {
            type: "idle",
            timestamp: Date.now(),
          },
        ])
      }, 3000)

      setIdleTimer(timer)

      return newAction
    },
    [idleTimer],
  )

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer)
      }
    }
  }, [idleTimer])

  return { actions, addAction }
}
