"use client"

import { useState, useRef, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload } from "lucide-react"

interface ImageColorExtractorProps {
  onColorsExtracted: (colors: string[]) => void
  maxColors?: number
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b)
    .toString(16)
    .padStart(2, "0")}`
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

// Calculate Euclidean distance between two points in 3D space
function distance(a: number[], b: number[]): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2))
}

// K-means clustering algorithm for color extraction
function kMeansClustering(pixels: number[][], k: number, maxIterations = 20): number[][] {
  if (pixels.length === 0) return []
  if (pixels.length <= k) return pixels

  // Initialize centroids randomly from the pixels
  const centroids: number[][] = []
  const usedIndices = new Set<number>()

  while (centroids.length < k) {
    const randomIndex = Math.floor(Math.random() * pixels.length)
    if (!usedIndices.has(randomIndex)) {
      centroids.push([...pixels[randomIndex]])
      usedIndices.add(randomIndex)
    }
  }

  // Assign pixels to clusters and update centroids
  let iterations = 0
  let oldCentroids: number[][] = []
  let clusters: number[][][] = Array(k)
    .fill(0)
    .map(() => [])

  while (iterations < maxIterations && !areCentroidsEqual(oldCentroids, centroids)) {
    // Reset clusters
    clusters = Array(k)
      .fill(0)
      .map(() => [])

    // Assign each pixel to the closest centroid
    for (const pixel of pixels) {
      let minDistance = Number.POSITIVE_INFINITY
      let closestCentroidIndex = 0

      for (let i = 0; i < centroids.length; i++) {
        const dist = distance(pixel, centroids[i])
        if (dist < minDistance) {
          minDistance = dist
          closestCentroidIndex = i
        }
      }

      clusters[closestCentroidIndex].push(pixel)
    }

    // Save old centroids for convergence check
    oldCentroids = [...centroids]

    // Update centroids to the average of their cluster
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue

      const newCentroid = [0, 0, 0]
      for (const pixel of clusters[i]) {
        newCentroid[0] += pixel[0]
        newCentroid[1] += pixel[1]
        newCentroid[2] += pixel[2]
      }

      centroids[i] = [
        Math.round(newCentroid[0] / clusters[i].length),
        Math.round(newCentroid[1] / clusters[i].length),
        Math.round(newCentroid[2] / clusters[i].length),
      ]
    }

    iterations++
  }

  // Sort centroids by cluster size (descending)
  const centroidsWithSize = centroids.map((centroid, i) => ({
    centroid,
    size: clusters[i].length,
  }))

  centroidsWithSize.sort((a, b) => b.size - a.size)

  return centroidsWithSize.map((c) => c.centroid)
}

// Check if two sets of centroids are equal (convergence check)
function areCentroidsEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false
  if (a.length === 0) return true

  for (let i = 0; i < a.length; i++) {
    if (distance(a[i], b[i]) > 1) return false
  }

  return true
}

// Adjust colors to be more visually appealing
function adjustColors(colors: string[]): string[] {
  const adjustedColors: string[] = []

  for (const color of colors) {
    // Convert to RGB
    const r = Number.parseInt(color.slice(1, 3), 16)
    const g = Number.parseInt(color.slice(3, 5), 16)
    const b = Number.parseInt(color.slice(5, 7), 16)

    // Convert to HSL
    const [h, s, l] = rgbToHsl(r, g, b)

    // Skip very dark or very light colors
    if (l < 5 || l > 95) continue

    // Skip very desaturated colors (close to gray)
    if (s < 3) continue

    adjustedColors.push(color)

    // If we have enough colors, stop
    if (adjustedColors.length >= 5) break
  }

  return adjustedColors
}

// Check if colors are too similar
function areTooSimilar(color1: string, color2: string, threshold = 15): boolean {
  const r1 = Number.parseInt(color1.slice(1, 3), 16)
  const g1 = Number.parseInt(color1.slice(3, 5), 16)
  const b1 = Number.parseInt(color1.slice(5, 7), 16)

  const r2 = Number.parseInt(color2.slice(1, 3), 16)
  const g2 = Number.parseInt(color2.slice(3, 5), 16)
  const b2 = Number.parseInt(color2.slice(5, 7), 16)

  const dist = Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2))
  return dist < threshold
}

export default function ImageColorExtractor({ onColorsExtracted, maxColors = 5 }: ImageColorExtractorProps) {
  const [image, setImage] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const extractColors = useCallback(
    async (imageUrl: string) => {
      setExtracting(true)

      try {
        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return

          const ctx = canvas.getContext("2d", { willReadFrequently: true })
          if (!ctx) return

          // Set canvas dimensions to image dimensions (scaled down if very large)
          const maxDimension = 800
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))

          canvas.width = img.width * scale
          canvas.height = img.height * scale

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixels = imageData.data

          // Sample pixels (skip some for performance)
          const skipFactor = Math.max(1, Math.floor(pixels.length / 4 / 25000))
          const sampledPixels: number[][] = []

          for (let i = 0; i < pixels.length; i += 4 * skipFactor) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            const a = pixels[i + 3]

            // Skip transparent pixels
            if (a < 200) continue

            // Skip extreme blacks and whites
            if ((r < 10 && g < 10 && b < 10) || (r > 245 && g > 245 && b > 245)) continue

            sampledPixels.push([r, g, b])
          }

          // Use k-means clustering to find dominant colors
          // Request more colors than needed to have extras for filtering
          const kMeansColors = kMeansClustering(sampledPixels, maxColors * 2)

          // Convert to hex
          const hexColors = kMeansColors.map((color) => rgbToHex(color[0], color[1], color[2]))

          // Filter out similar colors
          const uniqueColors: string[] = []
          for (const color of hexColors) {
            if (!uniqueColors.some((c) => areTooSimilar(c, color))) {
              uniqueColors.push(color)
            }

            if (uniqueColors.length >= maxColors) break
          }

          // Adjust colors for visual appeal
          let finalColors = adjustColors(uniqueColors)

          // If we don't have enough colors, add back some of the filtered ones
          if (finalColors.length < maxColors) {
            for (const color of hexColors) {
              if (!finalColors.includes(color)) {
                finalColors.push(color)
              }

              if (finalColors.length >= maxColors) break
            }
          }

          // Ensure we have exactly maxColors colors
          finalColors = finalColors.slice(0, maxColors)

          // If we still don't have enough colors, generate some
          while (finalColors.length < maxColors) {
            const r = Math.floor(Math.random() * 256)
            const g = Math.floor(Math.random() * 256)
            const b = Math.floor(Math.random() * 256)
            finalColors.push(rgbToHex(r, g, b))
          }

          onColorsExtracted(finalColors)
          setExtracting(false)
        }

        img.onerror = () => {
          console.error("Error loading image")
          setExtracting(false)
        }

        img.src = imageUrl
      } catch (error) {
        console.error("Error extracting colors:", error)
        setExtracting(false)
      }
    },
    [onColorsExtracted, maxColors],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const reader = new FileReader()

      reader.onload = () => {
        const dataUrl = reader.result as string
        setImage(dataUrl)
        extractColors(dataUrl)
      }

      reader.readAsDataURL(file)
    },
    [extractColors],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/50"}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
          </p>
        </div>
      </div>

      {image && (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt="Uploaded image"
            className="w-full h-auto object-contain max-h-[300px]"
          />

          {extracting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
