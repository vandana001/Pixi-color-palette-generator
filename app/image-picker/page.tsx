"use client"

import { useState } from "react"
import { useColorPalette } from "@/hooks/use-color-palette"
import { useUserActions } from "@/hooks/use-user-actions"
import ImageColorExtractor from "@/components/image-color-extractor"
import ColorPaletteDisplay from "@/components/color-palette-display"
import ColorAssistant from "@/components/color-assistant"
import ApiStatusNotification from "@/components/api-status-notification"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, Info } from "lucide-react"
import { getColorName } from "@/utils/color-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ImagePickerPage() {
  const { colors, setColorPalette } = useColorPalette([])
  const { actions, addAction } = useUserActions()
  const [showAssistant, setShowAssistant] = useState(true)
  const [copied, setCopied] = useState(false)
  const [lastImage, setLastImage] = useState<string | null>(null)

  const handleColorsExtracted = (extractedColors: string[]) => {
    setColorPalette(extractedColors)
    addAction("extract_from_image", { colors: extractedColors })
  }

  const copyPalette = () => {
    if (colors.length === 0) return

    navigator.clipboard.writeText(colors.join(", "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addAction("copy_color", { colors })
  }

  const downloadPalette = () => {
    if (colors.length === 0) return

    // Create CSS content
    const cssContent = colors
      .map((color, index) => {
        return `--color-${index + 1}: ${color};`
      })
      .join("\n")

    // Create download link
    const element = document.createElement("a")
    const file = new Blob([`:root {\n${cssContent}\n}`], { type: "text/css" })
    element.href = URL.createObjectURL(file)
    element.download = "palette.css"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    addAction("download_palette", { format: "css" })
  }

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8 space-y-6 md:space-y-8"  >
      <div className="space-y-2" style={{display:'flex', justifyContent:'center',alignItems:'center', flexDirection:'column', gap:'10px'}}>
        <h1 className="text-2xl md:text-3xl font-bold">Image Picker</h1>
        <p className="text-sm md:text-base text-muted-foreground">Upload an image to extract a color palette</p>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2" style={{background:'aliceblue', border:'.5px solid #dbdbdb', borderRadius:'20px'}}>
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Upload Image</h2>
          <ImageColorExtractor onColorsExtracted={handleColorsExtracted} maxColors={5} />

          {colors.length > 0 && (
            <div className="mt-3 text-xs md:text-sm text-muted-foreground">
              <p>The algorithm extracts the most dominant and representative colors from your image.</p>
              <p className="mt-1">For best results, use images with clear, distinct color areas.</p>
            </div>
          )}
        </div>

        <div className="spcae-y-4">
          <div className="flex justify-between items-center  mb-2 md:mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Color Palette</h2>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 p-0">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Color extraction info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs md:text-sm">
                    Colors are extracted using perceptual clustering to find the most representative colors in your
                    image.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ColorPaletteDisplay colors={colors} className="h-64 mb-4" />

          {colors.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-1 text-sm">
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }}></div>
                    <span className="font-mono">{color}</span>
                    <span className="text-muted-foreground">({getColorName(color)})</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={copyPalette}>
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Copy Palette
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPalette}>
                  <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Download CSS
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */ }
  {
    colors.length > 0 && (
      <div className="bg-muted/30 p-3 md:p-4 rounded-lg text-xs md:text-sm">
        <h3 className="font-medium mb-1 md:mb-2">How to use this palette:</h3>
        <ul className="list-disc pl-5 space-y-0.5 md:space-y-1 text-muted-foreground">
          <li>Click on any color to copy its hex code</li>
          <li>Use "Copy Palette" to copy all colors as a comma-separated list</li>
          <li>Download as CSS variables with the "Download CSS" button</li>
          <li>Check the AI assistant's feedback on your palette's harmony</li>
        </ul>
      </div>
    )
  }

  {/* Color Assistant */ }
      <ColorAssistant
        colors={colors}
        isVisible={showAssistant && colors.length > 0}
        onClose={() => setShowAssistant(false)}
        userActions={actions}
      />
      <ApiStatusNotification />
    </div >
  )
}
