"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export type ColorFeedback = {
  message: string
  suggestions?: string[]
  harmony: "excellent" | "good" | "fair" | "poor"
}

export type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

// Helper function to analyze colors locally without using OpenAI
function analyzeColorsLocally(colors: string[]): ColorFeedback {
  // Convert hex to RGB
  const rgbColors = colors.map((hex) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  })

  // Calculate average brightness and saturation
  let totalBrightness = 0
  let totalSaturation = 0

  rgbColors.forEach((color) => {
    const max = Math.max(color.r, color.g, color.b)
    const min = Math.min(color.r, color.g, color.b)
    const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
    const saturation = max === 0 ? 0 : (max - min) / max

    totalBrightness += brightness
    totalSaturation += saturation
  })

  const avgBrightness = totalBrightness / colors.length
  const avgSaturation = totalSaturation / colors.length

  // Calculate color variance (how different the colors are from each other)
  let totalVariance = 0
  for (let i = 0; i < rgbColors.length; i++) {
    for (let j = i + 1; j < rgbColors.length; j++) {
      const colorA = rgbColors[i]
      const colorB = rgbColors[j]
      const distance = Math.sqrt(
        Math.pow(colorA.r - colorB.r, 2) + Math.pow(colorA.g - colorB.g, 2) + Math.pow(colorA.b - colorB.b, 2),
      )
      totalVariance += distance
    }
  }
  const avgVariance = totalVariance / ((colors.length * (colors.length - 1)) / 2 || 1)

  // Determine harmony based on metrics
  let harmony: "excellent" | "good" | "fair" | "poor" = "good"
  if (avgVariance > 300) {
    harmony = "fair" // High variance might indicate clashing colors
  } else if (avgVariance < 80) {
    harmony = "fair" // Low variance might indicate too similar colors
  } else if (avgVariance >= 120 && avgVariance <= 250) {
    harmony = "excellent" // Good balance of difference
  }

  // Adjust based on saturation and brightness
  if (avgSaturation > 0.8) {
    harmony = harmony === "excellent" ? "good" : harmony // Too saturated
  } else if (avgSaturation < 0.2 && avgBrightness > 200) {
    harmony = harmony === "excellent" ? "good" : harmony // Too washed out
  }

  // Generate message based on analysis
  let message = ""
  let suggestions: string[] = []

  if (harmony === "excellent") {
    message =
      "Your palette has a wonderful balance! The colors work harmoniously together while maintaining visual interest."
    suggestions = [
      "This palette would work well for both primary and accent colors in a design",
      "Consider using the brighter colors for call-to-action elements",
    ]
  } else if (harmony === "good") {
    if (avgVariance > 250) {
      message = "You have a diverse and vibrant palette with good contrast between colors."
      suggestions = [
        "Consider adding a neutral tone to balance the vibrant colors",
        "This palette would work well for a bold, energetic design",
      ]
    } else {
      message = "Your palette has a nice cohesive feel with colors that complement each other well."
      suggestions = [
        "You might want to add one contrasting accent color for highlights",
        "This palette would work well for a harmonious, balanced design",
      ]
    }
  } else if (harmony === "fair") {
    if (avgVariance > 300) {
      message =
        "Your palette has high contrast between colors, which can create visual interest but might be challenging to balance."
      suggestions = [
        "Consider adding transitional colors to bridge the gap between contrasting hues",
        "Try using the most contrasting colors sparingly as accents",
      ]
    } else if (avgVariance < 80) {
      message =
        "Your colors are quite similar to each other, creating a very cohesive but potentially monotonous palette."
      suggestions = [
        "Consider adding one contrasting color to create focal points",
        "Try varying the brightness or saturation more between colors",
      ]
    } else if (avgSaturation > 0.8) {
      message = "Your palette uses highly saturated colors, which can be vibrant but potentially overwhelming."
      suggestions = [
        "Consider balancing with some less saturated or neutral tones",
        "Use the most saturated colors sparingly for emphasis",
      ]
    } else {
      message = "Your palette has potential but might benefit from some adjustments for better harmony."
      suggestions = [
        "Try exploring related color schemes like analogous or complementary",
        "Consider adjusting the brightness balance between your colors",
      ]
    }
  }

  return {
    message,
    suggestions,
    harmony,
  }
}

// Function to get color names (simplified)
function getColorName(hex: string): string {
  // Convert hex to RGB
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  // Calculate hue, saturation, lightness
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    if (max === r / 255) {
      h = (g / 255 - b / 255) / d + (g < b ? 6 : 0)
    } else if (max === g / 255) {
      h = (b / 255 - r / 255) / d + 2
    } else {
      h = (r / 255 - g / 255) / d + 4
    }
    h *= 60
  }

  // Determine color name based on HSL
  let colorName = ""

  // Lightness-based names
  if (l < 0.15) return "Black"
  if (l > 0.85) return "White"

  // Saturation-based names
  if (s < 0.15) {
    if (l < 0.3) return "Dark Gray"
    if (l < 0.7) return "Gray"
    return "Light Gray"
  }

  // Hue-based names
  if (h < 30 || h >= 330) colorName = "Red"
  else if (h < 60) colorName = "Orange"
  else if (h < 90) colorName = "Yellow"
  else if (h < 150) colorName = "Green"
  else if (h < 210) colorName = "Cyan"
  else if (h < 270) colorName = "Blue"
  else if (h < 330) colorName = "Purple"

  // Add lightness modifier
  if (l < 0.3) return "Dark " + colorName
  if (l > 0.7) return "Light " + colorName

  return colorName
}

// Function to analyze colors using OpenAI with fallback
export async function getColorFeedback(colors: string[]): Promise<ColorFeedback> {
  try {
    const colorString = colors.join(", ")

    try {
      // Try to use OpenAI first
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `
        You are a color expert assistant for a web application called PIXI that helps users create color palettes.
        
        Analyze this color palette: ${colorString}
        
        Provide feedback in JSON format with these fields:
        - message: A friendly, helpful message about the palette (100 words max)
        - suggestions: An array of 0-3 specific suggestions to improve the palette if needed
        - harmony: Rate the color harmony as one of: "excellent", "good", "fair", or "poor"
        
        Keep your tone friendly and supportive, like you're chatting with a designer friend.
        `,
        temperature: 0.7,
        maxTokens: 500,
      })

      try {
        // Parse the JSON response
        return JSON.parse(text) as ColorFeedback
      } catch (parseError) {
        // If parsing fails, create a structured response from the text
        console.error("Error parsing JSON response:", parseError)
        return {
          message: text.slice(0, 200), // Limit message length
          suggestions: [],
          harmony: "good", // Default harmony
        }
      }
    } catch (apiError) {
      console.log("OpenAI API error, using fallback mechanism:", apiError)
      // If OpenAI fails, use our local analysis
      return analyzeColorsLocally(colors)
    }
  } catch (error) {
    console.error("Error getting color feedback:", error)
    // Final fallback for any other errors
    return analyzeColorsLocally(colors)
  }
}

// Generate a response based on user actions and colors without using OpenAI
function generateLocalResponse(messageType: string, colors: string[], data?: any): string {
  // Get color names for reference
  const colorNames = colors.map((c) => getColorName(c.toLowerCase()))

  // Responses for different action types
  switch (messageType) {
    case "palette_feedback":
      return [
        `I like this combination! The ${colorNames[0]} works nicely with the ${colorNames[colorNames.length - 1]}.`,
        `This palette has a nice balance of tones. The ${colorNames[1]} adds a good focal point.`,
        `Nice palette! The contrast between ${colorNames[0]} and ${colorNames[2]} creates visual interest.`,
        `These colors work well together. I particularly like the ${colorNames[Math.floor(Math.random() * colorNames.length)]}.`,
      ][Math.floor(Math.random() * 4)]

    case "image_extraction":
      return [
        `Nice colors from that image! Images are a great source of harmonious color combinations.`,
        `I like these extracted colors! Images often have naturally balanced color relationships.`,
        `Great palette from your image! These colors already have a natural harmony to them.`,
        `These extracted colors capture the essence of your image nicely.`,
      ][Math.floor(Math.random() * 4)]

    case "scheme_change":
      const scheme = data?.scheme || "custom"
      const schemeMessages: Record<string, string[]> = {
        monochromatic: [
          "Monochromatic schemes create a cohesive look with different shades of the same color.",
          "Monochromatic palettes are elegant and create a sense of harmony and stability.",
          "This monochromatic approach will give your design a sophisticated, unified feel.",
        ],
        analogous: [
          "Analogous colors sit next to each other on the color wheel, creating a harmonious feel.",
          "Analogous schemes like this one create a serene and comfortable design.",
          "These analogous colors flow nicely from one to the next, creating visual comfort.",
        ],
        complementary: [
          "Complementary colors create strong contrast and visual vibrance.",
          "This complementary scheme balances warm and cool tones for visual interest.",
          "Complementary colors like these create energy through their natural contrast.",
        ],
        triadic: [
          "Triadic color schemes use three colors equally spaced on the color wheel for balance and richness.",
          "This triadic palette gives you good contrast while maintaining color harmony.",
          "Triadic schemes like this offer vibrant contrast even when using paler or unsaturated colors.",
        ],
        tetradic: [
          "Tetradic schemes use four colors arranged in two complementary pairs for rich, balanced designs.",
          "This tetradic palette gives you plenty of colors to work with while maintaining harmony.",
          "Tetradic color schemes like this one work well when you let one color dominate and use the others as accents.",
        ],
        random: [
          "This custom palette gives you flexibility to create your own unique look.",
          "I like this custom color combination - it has an interesting character.",
          "Custom palettes like this one let you express your unique design vision.",
        ],
      }

      return (
        schemeMessages[scheme]?.[Math.floor(Math.random() * 3)] ||
        "This color scheme has a really interesting visual quality to it."
      )

    case "color_change":
      return [
        "I like where you're going with these color adjustments!",
        "These color modifications are coming together nicely.",
        "Good eye for detail! These adjustments are refining your palette.",
        "Nice tweaking of the colors. Small changes can make a big difference.",
      ][Math.floor(Math.random() * 4)]

    case "idle_analysis":
      // More detailed analysis based on the actual colors
      const feedback = analyzeColorsLocally(colors)
      return feedback.message

    default:
      return "Your palette is looking good! The colors work well together."
  }
}

// Function to chat with the AI assistant with local fallback
export async function chatWithAssistant(
  messages: ChatMessage[],
  colors: string[],
  userActions: any[] = [],
  systemPrompt?: string,
): Promise<{ text: string }> {
  try {
    // Try to use OpenAI
    try {
      // Create a system message with context about colors and user actions
      const colorContext =
        colors.length > 0
          ? `Current color palette: ${colors.join(", ")}. These are hex color codes.`
          : "No colors selected yet."

      // Extract recent user actions for context
      const recentActions = userActions
        .map((action) => `User ${action.type.replace(/_/g, " ")} ${action.data ? JSON.stringify(action.data) : ""}`)
        .join("\n")

      const actionsContext =
        userActions.length > 0 ? `Recent user actions:\n${recentActions}` : "No recent user actions."

      const defaultSystemPrompt = `
        You are PIXI, a friendly and helpful color assistant for a web application that helps users create color palettes.
        
        ${colorContext}
        
        ${actionsContext}
        
        Your personality:
        - You're enthusiastic about colors and design
        - You provide helpful, concise advice about color theory and palette creation
        - You're supportive and encouraging, never critical
        - You speak in a casual, friendly tone like you're chatting with a designer friend
        - You occasionally use emoji to express enthusiasm
        - You're knowledgeable about color theory, design principles, and accessibility
        
        When discussing colors:
        - You can analyze harmony, contrast, and balance
        - You can suggest improvements or alternatives
        - You can explain color relationships (complementary, analogous, etc.)
        - You can comment on accessibility and readability
        
        Keep responses concise (under 100 words) and conversational.
      `

      // Generate response using the AI model
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: systemPrompt || defaultSystemPrompt,
        messages: messages,
        temperature: 0.7,
        maxTokens: 250,
      })

      return { text }
    } catch (apiError) {
      console.log("OpenAI API error in chatWithAssistant, using fallback:", apiError)

      // Extract the message type from the system prompt if available
      let messageType = "palette_feedback"
      let data = undefined

      if (systemPrompt) {
        if (systemPrompt.includes("just generated a new color palette")) {
          messageType = "palette_feedback"
        } else if (systemPrompt.includes("extracted colors from an image")) {
          messageType = "image_extraction"
        } else if (systemPrompt.includes("changed to a")) {
          messageType = "scheme_change"
          // Try to extract the scheme name
          const schemeMatch = systemPrompt.match(/changed to a (\w+) color scheme/)
          if (schemeMatch && schemeMatch[1]) {
            data = { scheme: schemeMatch[1] }
          }
        } else if (systemPrompt.includes("modifying their color palette")) {
          messageType = "color_change"
        } else if (systemPrompt.includes("looking at their current palette")) {
          messageType = "idle_analysis"
        }
      }

      // Generate a local response based on the message type
      const localResponse = generateLocalResponse(messageType, colors, data)
      return { text: localResponse }
    }
  } catch (error) {
    console.error("Error in chatWithAssistant:", error)
    return {
      text: "Your palette has some interesting colors! I like how they work together.",
    }
  }
}
