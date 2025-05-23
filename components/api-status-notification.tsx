"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"

export default function ApiStatusNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasApiIssue, setHasApiIssue] = useState(false)

  useEffect(() => {
    // Check if we've shown this notification before
    const hasShownNotification = localStorage.getItem("api-notification-shown")

    if (!hasShownNotification) {
      // Show notification after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
        localStorage.setItem("api-notification-shown", "true")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 max-w-md z-50 animate-fade-in">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-amber-800">API Usage Notice</h3>
            <div className="mt-1 text-sm text-amber-700">
              <p>
                The AI color assistant is using a fallback mode due to API limitations. Some advanced features may be
                limited, but basic color analysis is still available.
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} className="ml-4 flex-shrink-0 text-amber-500 hover:text-amber-700">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
