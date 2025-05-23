"use client"

import { useState, useCallback, useEffect } from "react"
import { generatePaletteByScheme, type ColorScheme, getContrastRatio } from "@/utils/color-utils"

export type PaletteColor = {
  hex: string
  locked: boolean
}

export function usePaletteGenerator(initialCount = 5) {
  const [colors, setColors] = useState<PaletteColor[]>([])
  const [scheme, setScheme] = useState<ColorScheme>("random")
  const [count, setCount] = useState(initialCount)

  // Initialize palette
  useEffect(() => {
    generateNewPalette()
  }, [])

  // Generate a completely new palette
  const generateNewPalette = useCallback(() => {
    const newColors = generatePaletteByScheme(scheme, count)
    setColors(newColors.map((hex) => ({ hex, locked: false })))
  }, [scheme, count])

  // Regenerate palette but keep locked colors
  const regeneratePalette = useCallback(() => {
    // If all colors are locked, do nothing
    if (colors.every((c) => c.locked)) return

    // Get the first locked color as a base for harmony (if any)
    const baseColor = colors.find((c) => c.locked)?.hex

    // Generate new colors
    const newPalette = generatePaletteByScheme(scheme, count, baseColor)

    // Replace only the unlocked colors
    setColors(
      colors.map((color, index) => {
        if (color.locked) return color
        return { hex: newPalette[index], locked: false }
      }),
    )
  }, [colors, scheme, count])

  // Toggle lock status of a color
  const toggleLock = useCallback(
    (index: number) => {
      setColors(colors.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)))
    },
    [colors],
  )

  // Update a specific color
  const updateColor = useCallback(
    (index: number, hex: string) => {
      setColors(colors.map((color, i) => (i === index ? { ...color, hex } : color)))
    },
    [colors],
  )

  // Change the number of colors in the palette
  const updateCount = useCallback(
    (newCount: number) => {
      if (newCount === count) return

      setCount(newCount)

      if (newCount > colors.length) {
        // Add more colors
        const additionalColors = generatePaletteByScheme(scheme, newCount - colors.length)
        setColors([...colors, ...additionalColors.map((hex) => ({ hex, locked: false }))])
      } else {
        // Remove colors (keep locked ones if possible)
        const lockedCount = colors.filter((c) => c.locked).length

        if (lockedCount <= newCount) {
          // We can keep all locked colors
          const newColors: PaletteColor[] = []
          let unlockedToKeep = newCount - lockedCount

          colors.forEach((color) => {
            if (color.locked) {
              newColors.push(color)
            } else if (unlockedToKeep > 0) {
              newColors.push(color)
              unlockedToKeep--
            }
          })

          setColors(newColors)
        } else {
          // Too many locked colors, we'll have to unlock some
          // For simplicity, we'll just take the first newCount colors
          setColors(colors.slice(0, newCount))
        }
      }
    },
    [colors, count, scheme],
  )

  // Change the color scheme
  const updateScheme = useCallback(
    (newScheme: ColorScheme) => {
      setScheme(newScheme)

      // If we have locked colors, keep them and regenerate the rest
      if (colors.some((c) => c.locked)) {
        regeneratePalette()
      } else {
        // Otherwise generate a completely new palette
        const newColors = generatePaletteByScheme(newScheme, count)
        setColors(newColors.map((hex) => ({ hex, locked: false })))
      }
    },
    [colors, count, regeneratePalette],
  )

  // Get contrast information for the palette
  const getContrastInfo = useCallback(() => {
    const result: { [key: string]: { [key: string]: number } } = {}

    colors.forEach((color1, i) => {
      result[color1.hex] = {}
      colors.forEach((color2, j) => {
        if (i !== j) {
          result[color1.hex][color2.hex] = getContrastRatio(color1.hex, color2.hex)
        }
      })
    })

    return result
  }, [colors])

  return {
    colors,
    scheme,
    count,
    generateNewPalette,
    regeneratePalette,
    toggleLock,
    updateColor,
    updateCount,
    updateScheme,
    getContrastInfo,
  }
}
