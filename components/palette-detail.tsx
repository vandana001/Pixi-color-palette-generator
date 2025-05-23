"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Check, Download, Share2, Heart, HeartOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaletteAesthetic } from "@/utils/pallete-generator"

interface PaletteDetailProps {
  palette: {
    id: string
    name: string
    colors: string[]
    likes: number
    tags: string[]
    aesthetic: PaletteAesthetic
  }
  isLiked: boolean
  onToggleLike: (id: string) => void
  trigger: React.ReactNode
}

export default function PaletteDetail({ palette, isLiked, onToggleLike, trigger }: PaletteDetailProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [copiedPalette, setCopiedPalette] = useState(false)

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
    setCopiedColor(color)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const copyPalette = () => {
    const colorString = palette.colors.join(", ")
    navigator.clipboard.writeText(colorString)
    setCopiedPalette(true)
    setTimeout(() => setCopiedPalette(false), 2000)
  }

  const downloadPalette = () => {
    // Create CSS content
    const cssContent = palette.colors
      .map((color, index) => {
        return `--color-${index + 1}: ${color};`
      })
      .join("\n")

    // Create download link
    const element = document.createElement("a")
    const file = new Blob([`:root {\n${cssContent}\n}`], { type: "text/css" })
    element.href = URL.createObjectURL(file)
    element.download = `${palette.name.toLowerCase().replace(/\s+/g, "-")}.css`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{palette.name}</DialogTitle>
        </DialogHeader>

        {/* Palette display */}
        <div className="flex h-32 rounded-md overflow-hidden my-4">
          {palette.colors.map((color) => (
            <div
              key={color}
              className="flex-1 relative group cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => copyColor(color)}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                {copiedColor === color ? (
                  <Check className="h-6 w-6 text-white drop-shadow-md" />
                ) : (
                  <Copy className="h-5 w-5 text-white drop-shadow-md" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Color codes */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {palette.colors.map((color) => (
            <div key={color} className="text-center">
              <div className="font-mono text-xs truncate">{color}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          <span className="text-xs font-medium text-muted-foreground mr-1">Tags:</span>
          {palette.tags.map((tag) => (
            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPalette}>
              {copiedPalette ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={downloadPalette}>
              <Download className="h-4 w-4 mr-1" />
              <span>Download</span>
            </Button>

            {/* <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button> */}
          </div>

          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleLike(palette.id)}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              isLiked && "text-rose-500 hover:text-rose-600",
            )}
          >
            {isLiked ? <Heart className="h-4 w-4 mr-1 fill-current" /> : <HeartOff className="h-4 w-4 mr-1" />}
            <span>{isLiked ? "Liked" : "Like"}</span>
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
