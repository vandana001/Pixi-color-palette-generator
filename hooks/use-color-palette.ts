"use client"

import { useState, useCallback } from "react"

export type ColorPalette = string[]

export function useColorPalette(initialColors: string[] = []) {
  const [colors, setColors] = useState<ColorPalette>(initialColors)

  const addColor = useCallback((color: string) => {
    setColors((prev) => [...prev, color])
  }, [])

  const removeColor = useCallback((index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateColor = useCallback((index: number, color: string) => {
    setColors((prev) => prev.map((c, i) => (i === index ? color : c)))
  }, [])

  const setColorPalette = useCallback((newColors: string[]) => {
    setColors(newColors)
  }, [])

  return {
    colors,
    addColor,
    removeColor,
    updateColor,
    setColorPalette,
  }
}
