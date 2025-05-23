"use client"

import { useState, useEffect, useRef } from "react"
import { getColorFeedback, chatWithAssistant, type ColorFeedback } from "@/app/api/color-assistant/action"
import { cn } from "@/lib/utils"
import { Loader2, MessageSquare, X, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getColorName } from "@/utils/color-utils"

interface ColorAssistantProps {
  colors: string[]
  isVisible?: boolean
  onClose?: () => void
  userActions?: UserAction[]
}

export type UserAction = {
  type:
    | "generate_palette"
    | "lock_color"
    | "unlock_color"
    | "change_color"
    | "extract_from_image"
    | "change_scheme"
    | "change_count"
    | "copy_color"
    | "download_palette"
    | "idle"
  data?: any
  timestamp: number
}

type Message = {
  id: string
  content: string
  sender: "assistant"
  timestamp: number
  feedback?: ColorFeedback
  liked?: boolean
}

export default function ColorAssistant({ colors, isVisible = true, onClose, userActions = [] }: ColorAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hi there! I'm your color assistant. I'll watch what you're doing and offer suggestions as you work. I'll chime in when I notice something interesting about your palette!",
      sender: "assistant",
      timestamp: Date.now(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [lastActionTimestamp, setLastActionTimestamp] = useState(0)
  const [lastColorsString, setLastColorsString] = useState("")
  const [lastMessageTime, setLastMessageTime] = useState(Date.now())
  const [consecutiveActions, setConsecutiveActions] = useState(0)
  const [apiErrorShown, setApiErrorShown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Process user actions to generate contextual responses
  useEffect(() => {
    if (!userActions.length || !showChat) return

    const latestAction = userActions[userActions.length - 1]

    // Only process if this is a new action
    if (latestAction.timestamp <= lastActionTimestamp) return

    // Update last action timestamp
    setLastActionTimestamp(latestAction.timestamp)

    // Check if this is a rapid sequence of actions (don't respond to every single one)
    const now = Date.now()
    const timeSinceLastMessage = now - lastMessageTime

    if (timeSinceLastMessage < 5000) {
      // If less than 5 seconds since last message, increment consecutive actions
      setConsecutiveActions((prev) => prev + 1)

      // Only respond if we've accumulated enough actions or it's been a while
      if (consecutiveActions < 3 && latestAction.type !== "idle") {
        return
      }
    }

    // Reset consecutive actions counter if we're going to respond
    setConsecutiveActions(0)
    setLastMessageTime(now)

    // Handle different action types
    switch (latestAction.type) {
      case "generate_palette":
        if (colors.length >= 3) {
          // Only comment on new palettes occasionally to avoid being annoying
          if (Math.random() > 0.4 || latestAction.data?.complete) {
            sendProactiveMessage("palette_feedback")
          }
        }
        break

      case "lock_color":
        if (latestAction.data && typeof latestAction.data.color === "string" && Math.random() > 0.5) {
          const colorName = getColorName(latestAction.data.color)
          addAssistantMessage(
            `Good choice locking that ${colorName.toLowerCase()}! It's a strong anchor for your palette.`,
          )
        }
        break

      case "extract_from_image":
        sendProactiveMessage("image_extraction")
        break

      case "change_scheme":
        if (latestAction.data && typeof latestAction.data.scheme === "string") {
          const scheme = latestAction.data.scheme
          sendProactiveMessage("scheme_change", { scheme })
        }
        break

      case "change_count":
        if (Math.random() > 0.7) {
          if (latestAction.data && latestAction.data.count > 5) {
            addAssistantMessage(
              "Adding more colors gives you flexibility, but can make a palette harder to balance. Make sure each color has a clear purpose in your design.",
            )
          } else if (latestAction.data && latestAction.data.count < 4) {
            addAssistantMessage(
              "A minimal palette can be very elegant! With fewer colors, each one becomes more important to your overall design.",
            )
          }
        }
        break

      case "idle":
        // If the user has been idle for a while and we have colors to analyze
        if (colors.length >= 3) {
          const colorsString = colors.join(",")
          // Only analyze if the colors have changed since last analysis
          if (colorsString !== lastColorsString && Math.random() > 0.3) {
            setLastColorsString(colorsString)
            sendProactiveMessage("idle_analysis")
          }
        }
        break
    }
  }, [userActions, showChat, colors, lastActionTimestamp, lastMessageTime, consecutiveActions])

  // Check for significant color changes
  useEffect(() => {
    if (colors.length >= 3 && showChat) {
      const colorsString = colors.join(",")
      if (colorsString !== lastColorsString && Math.random() > 0.7) {
        // Only comment on color changes occasionally
        setLastColorsString(colorsString)

        // Wait a moment before responding to seem more natural
        const timer = setTimeout(() => {
          sendProactiveMessage("color_change")
        }, 1500)

        return () => clearTimeout(timer)
      }
    }
  }, [colors, showChat, lastColorsString])

  const analyzeCurrentPalette = async () => {
    if (colors.length === 0) return

    setLoading(true)

    try {
      const result = await getColorFeedback(colors)
      addAssistantMessage(result.message, result)
    } catch (err) {
      console.error("Error in color assistant:", err)
      addAssistantMessage("I notice you've been working on this palette. The colors are coming together nicely!")

      // Show API error notification if not already shown
      if (!apiErrorShown && err?.toString().includes("quota")) {
        setApiErrorShown(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const sendProactiveMessage = async (messageType: string, data?: any) => {
    setLoading(true)

    try {
      // Create a prompt based on the message type
      let prompt = ""

      switch (messageType) {
        case "palette_feedback":
          prompt =
            "The user just generated a new color palette. Give a brief, friendly opinion on the harmony and feel of these colors. Keep it conversational and short (max 2 sentences)."
          break
        case "image_extraction":
          prompt =
            "The user just extracted colors from an image. Comment on the extracted palette in a brief, encouraging way. Mention something about how colors from images can inspire designs."
          break
        case "scheme_change":
          const scheme = data?.scheme || "custom"
          prompt = `The user just changed to a ${scheme} color scheme. Briefly explain one interesting characteristic or best use case for this type of color scheme. Keep it conversational and helpful.`
          break
        case "color_change":
          prompt =
            "The user has been modifying their color palette. Give a brief, encouraging comment about their color choices or suggest a small tip about color harmony. Keep it very brief and conversational."
          break
        case "idle_analysis":
          prompt =
            "The user has been looking at their current palette for a while. Provide a thoughtful observation about the current palette's mood, potential use cases, or harmony. Be specific about the actual colors they're using."
          break
        default:
          prompt =
            "Provide a brief, helpful comment about the user's current color palette. Keep it conversational and short."
      }

      // Format messages for the API - just include the last few messages for context
      const recentMessages = messages.slice(-3).map((msg) => ({
        role: "assistant" as const,
        content: msg.content,
      }))

      const response = await chatWithAssistant(recentMessages, colors, userActions.slice(-5), prompt)
      addAssistantMessage(response.text)
    } catch (error) {
      console.error("Error sending proactive message:", error)

      // Show API error notification if not already shown
      if (!apiErrorShown && error?.toString().includes("quota")) {
        setApiErrorShown(true)
      }

      // Fallback messages based on type
      const fallbackMessages = {
        palette_feedback: "Those colors work well together! I like the balance you've created.",
        image_extraction: "Nice palette from that image! Images are a great source of color inspiration.",
        scheme_change: "This color scheme has a really nice visual flow to it.",
        color_change: "I like where you're going with these color adjustments!",
        idle_analysis: "Your palette has a nice balance of tones. It would work well for a modern interface.",
      }

      addAssistantMessage(
        fallbackMessages[messageType as keyof typeof fallbackMessages] || "Your palette is looking good!",
      )
    } finally {
      setLoading(false)
    }
  }

  const addAssistantMessage = (content: string, feedback?: ColorFeedback) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content,
        sender: "assistant",
        timestamp: Date.now(),
        feedback,
      },
    ])

    // Update last message time
    setLastMessageTime(Date.now())
  }

  const handleFeedback = (messageId: string, liked: boolean) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, liked } : msg)))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-8 z-50 flex items-end">
      {/* Assistant Character */}
      <div className="mr-3 flex-shrink-0">
        <img src="/pixiassistant.svg" alt="PIXI Assistant" width={80} height={80} className="drop-shadow-md" />
      </div>

      {/* Chat Bubble */}
      {showChat && (
        <div className="relative mb-4 max-w-xs sm:max-w-sm md:max-w-md animate-fade-in">
          <div className="bg-navy-900 text-white p-4 rounded-2xl rounded-bl-none shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">PIXI Assistant</span>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/70 hover:text-white"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* API Error Notice */}
            {apiErrorShown && (
              <div className="mb-3 p-2 bg-amber-900/30 border border-amber-700/50 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <p className="font-medium">Using offline mode</p>
                  <p>I'm currently working with limited capabilities due to API limitations.</p>
                </div>
              </div>
            )}

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 mb-3">
              {messages.map((message) => (
                <div key={message.id} className="bg-navy-800 text-white p-2 rounded-lg">
                  <p>{message.content}</p>

                  {/* Show feedback data if available */}
                  {message.feedback && message.feedback.suggestions && message.feedback.suggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-xs font-medium mb-1">Suggestions:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {message.feedback.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-xs">
                            {suggestion}
                          </li>
                        ))}
                      </ul>

                      {message.feedback.harmony && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs mr-2">Harmony:</span>
                          <span
                            className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded",
                              message.feedback.harmony === "excellent" && "bg-green-500/20 text-green-200",
                              message.feedback.harmony === "good" && "bg-blue-500/20 text-blue-200",
                              message.feedback.harmony === "fair" && "bg-yellow-500/20 text-yellow-200",
                              message.feedback.harmony === "poor" && "bg-red-500/20 text-red-200",
                            )}
                          >
                            {message.feedback.harmony.charAt(0).toUpperCase() + message.feedback.harmony.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback buttons */}
                  {message.id !== "welcome" && (
                    <div className="flex justify-end mt-1 space-x-2">
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className={cn(
                          "p-1 rounded-full transition-colors",
                          message.liked === true ? "text-green-400" : "text-white/40 hover:text-white/60",
                        )}
                        aria-label="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false)}
                        className={cn(
                          "p-1 rounded-full transition-colors",
                          message.liked === false ? "text-red-400" : "text-white/40 hover:text-white/60",
                        )}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 bg-navy-800 text-white p-2 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Analyze button instead of input field */}
            <Button
              onClick={analyzeCurrentPalette}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
              disabled={loading || colors.length < 2}
            >
              Analyze Current Palette
            </Button>
          </div>

          {/* Chat bubble pointer */}
          <div className="absolute -bottom-2 left-0 w-4 h-4 overflow-hidden">
            <div className="absolute bg-navy-900 w-4 h-4 rotate-45 transform origin-bottom-left"></div>
          </div>
        </div>
      )}

      {/* Chat toggle button (when chat is closed) */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="bg-navy-900 text-white p-3 rounded-full shadow-lg hover:bg-navy-800 transition-colors"
          aria-label="Open assistant chat"
        >
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  )
}
