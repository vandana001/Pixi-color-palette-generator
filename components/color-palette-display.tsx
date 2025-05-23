"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPaletteDisplayProps {
  colors: string[]
  onColorClick?: (color: string, index: number) => void
  className?: string
}

export default function ColorPaletteDisplay({ colors, onColorClick, className }: ColorPaletteDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (color: string, index: number) => {
    navigator.clipboard.writeText(color)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!colors.length) {
    return (
      <div className={cn("rounded-lg border border-dashed p-8 text-center", className)}>
        <p className="text-muted-foreground">No colors in palette yet</p>
      </div>
    )
  }

  return (
    <div className={cn("flex rounded-lg overflow-hidden", className)}>
      {colors.map((color, index) => (
        <div
          key={`${color}-${index}`}
          className="relative flex-1 h-24 sm:h-32 transition-all hover:flex-[1.2] group"
          style={{ backgroundColor: color }}
          onClick={() => onColorClick?.(color, index)}
        >
          <button
            className="absolute bottom-2 right-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(color, index)
            }}
            aria-label={`Copy color ${color}`}
          >
            {copiedIndex === index ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-white" />}
          </button>
          <div className="absolute bottom-2 left-2 text-xs font-mono bg-black/20 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {color}
          </div>
        </div>
      ))}
    </div>
  )
}
