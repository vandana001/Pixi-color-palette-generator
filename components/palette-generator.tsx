"use client"

import { useState, useEffect } from "react"
import { usePaletteGenerator } from "@/hooks/use-palette-generator"
import { useUserActions } from "@/hooks/use-user-actions"
import { Lock, Unlock, RefreshCw, Copy, Check, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getColorName } from "@/utils/color-utils"
import ColorAssistant from "@/components/color-assistant"

export default function PaletteGenerator() {
  const {
    colors,
    scheme,
    count,
    generateNewPalette,
    regeneratePalette,
    toggleLock,
    updateColor,
    updateCount,
    updateScheme,
  } = usePaletteGenerator(5)

  const { actions, addAction } = useUserActions()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showColorNames, setShowColorNames] = useState(true)
  const [showAssistant, setShowAssistant] = useState(true)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to generate new palette
      if (e.code === "Space" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleRegeneratePalette()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [regeneratePalette])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    addAction("copy_color", { color: text, index })
  }

  const handleRegeneratePalette = () => {
    regeneratePalette()
    addAction("generate_palette")
  }

  const handleNewPalette = () => {
    generateNewPalette()
    addAction("generate_palette", { complete: true })
  }

  const handleToggleLock = (index: number) => {
    const isLocked = colors[index].locked
    toggleLock(index)
    addAction(isLocked ? "unlock_color" : "lock_color", {
      color: colors[index].hex,
      index,
    })
  }

  const handleUpdateColor = (index: number, hex: string) => {
    updateColor(index, hex)
    addAction("change_color", { oldColor: colors[index].hex, newColor: hex, index })
  }

  const handleUpdateScheme = (newScheme: string) => {
    updateScheme(newScheme as any)
    addAction("change_scheme", { scheme: newScheme })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
    <div className="bg-white p-3 md:p-4 border-b">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRegeneratePalette} className="flex items-center gap-2" variant="outline" size="sm">
              <RefreshCw size={16} />
              <span>Generate</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-1">(Space)</span>
            </Button>

            <Button onClick={handleNewPalette} className="flex items-center gap-2" variant="outline" size="sm">
              <Shuffle size={16} />
              <span>New Palette</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Colors:</span>
              <Select
                value={count.toString()}
                onValueChange={(value) => {
                  updateCount(Number.parseInt(value))
                  addAction("change_count", { count: Number.parseInt(value) })
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Scheme:</span>
              <Select value={scheme} onValueChange={handleUpdateScheme}>
                <SelectTrigger className="w-32 md:w-36">
                  <SelectValue placeholder="Random" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="monochromatic">Monochromatic</SelectItem>
                  <SelectItem value="analogous">Analogous</SelectItem>
                  <SelectItem value="complementary">Complementary</SelectItem>
                  <SelectItem value="triadic">Triadic</SelectItem>
                  <SelectItem value="tetradic">Tetradic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="flex flex-1 min-h-[50vh]">
        {colors.map((color, index) => (
          <div
            key={`${color.hex}-${index}`}
            className="flex-1 flex flex-col relative group"
            style={{ backgroundColor: color.hex }}
          >
            {/* Color Info */}
            <div className="mt-auto p-4 bg-black/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-lg font-bold text-white drop-shadow-sm">
                    {color.hex.toUpperCase()}
                  </span>
                  {/* <button
                    onClick={() => handleToggleLock(index)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    aria-label={color.locked ? "Unlock color" : "Lock color"}
                  >
                    {color.locked ? (
                      <Lock className="h-5 w-5 text-white drop-shadow-sm" />
                    ) : (
                      <Unlock className="h-5 w-5 text-white drop-shadow-sm" />
                    )}
                  </button> */}
                </div>

                {showColorNames && (
                  <span className="text-sm text-white/90 drop-shadow-sm">{getColorName(color.hex)}</span>
                )}

                {/* <button
                  onClick={() => copyToClipboard(color.hex, index)}
                  className="mt-2 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-md transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button> */}
              </div>
            </div>

            {/* Lock indicator */}
            {/* {color.locked && (
              <div className="absolute top-4 right-4 bg-black/20 p-1.5 rounded-full">
                <Lock className="h-4 w-4 text-white" />
              </div>
            )} */}

            {/* Color input (hidden but functional) */}
            <input
              type="color"
              value={color.hex}
              onChange={(e) => handleUpdateColor(index, e.target.value)}
              className="sr-only"
              id={`color-input-${index}`}
            />
            <label
              htmlFor={`color-input-${index}`}
              className="absolute inset-0 cursor-pointer"
              aria-label={`Edit color ${color.hex}`}
            />
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-white p-4 border-t text-center text-sm text-muted-foreground">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Space</kbd> to generate a new palette. Click a color
        to edit it.
      </div>

      {/* Color Assistant */}
      <ColorAssistant
        colors={colors.map((c) => c.hex)}
        isVisible={showAssistant}
        onClose={() => setShowAssistant(false)}
        userActions={actions}
      />
    </div>
  )
}
