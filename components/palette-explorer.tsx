"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, HeartOff, Copy, Check, RefreshCw, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  generatePaletteByAesthetic,
  generatePaletteName,
  generateTags,
  generateUUID,
  type PaletteAesthetic,
} from "@/utils/pallete-generator"

import PaletteDetail from "./palette-detail"

type Palette = {
  id: string
  name: string
  colors: string[]
  likes: number
  tags: string[]
  aesthetic: PaletteAesthetic
}

// Generate a random palette
function generateRandomPalette(): Palette {
  const aesthetics: PaletteAesthetic[] = [
    "pastel",
    "warm",
    "cool",
    "moody",
    "neutral",
    "monochromatic",
    "vibrant",
    "earthy",
    "retro",
    "random",
  ]

  const aesthetic = aesthetics[Math.floor(Math.random() * aesthetics.length)]
  const colors = generatePaletteByAesthetic(aesthetic, 5)
  const name = generatePaletteName(aesthetic)
  const tags = generateTags(aesthetic)

  return {
    id: generateUUID(),
    name,
    colors,
    likes: Math.floor(Math.random() * 300),
    tags,
    aesthetic,
  }
}

// Generate a batch of random palettes

function generatePaletteBatch(count: number): Palette[] {
  return Array.from({ length: count }, () => generateRandomPalette())
}

export default function PaletteExplorer() {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [likedPalettes, setLikedPalettes] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeAesthetic, setActiveAesthetic] = useState<PaletteAesthetic | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastPaletteElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePalettes()
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  // Initial load
  useEffect(() => {
    setPalettes(generatePaletteBatch(12))
  }, [])

  // Load more palettes
  const loadMorePalettes = () => {
    setLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const newPalettes = generatePaletteBatch(8)
      setPalettes((prev) => [...prev, ...newPalettes])
      setLoading(false)

      // For demo purposes, we'll always have more palettes
      // In a real app, you might check if you've reached a limit
      setHasMore(true)
    }, 500)
  }

  // Generate a new batch of palettes
  const regeneratePalettes = () => {
    setPalettes(generatePaletteBatch(12))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Filter palettes based on search and active aesthetic
  const filteredPalettes = palettes.filter((palette) => {
    const matchesSearch =
      searchTerm === "" ||
      palette.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      palette.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesAesthetic = activeAesthetic === null || palette.aesthetic === activeAesthetic

    return matchesSearch && matchesAesthetic
  })

  const toggleLike = (id: string) => {
    if (likedPalettes.includes(id)) {
      setLikedPalettes(likedPalettes.filter((paletteId) => paletteId !== id))
    } else {
      setLikedPalettes([...likedPalettes, id])
    }
  }

  const copyPalette = (palette: Palette) => {
    const colorString = palette.colors.join(", ")
    navigator.clipboard.writeText(colorString)
    setCopiedId(palette.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Get all available aesthetics
  const allAesthetics: PaletteAesthetic[] = [
    "pastel",
    "warm",
    "cool",
    "moody",
    "neutral",
    "monochromatic",
    "vibrant",
    "earthy",
    "retro",
  ]

  return (
    <div className="container py-8">
      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search palettes by name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div> */}

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeAesthetic === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveAesthetic(null)}
            >
              All
            </Button>
            {allAesthetics.map((aesthetic) => (
              <Button
                key={aesthetic}
                variant={activeAesthetic === aesthetic ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveAesthetic(aesthetic === activeAesthetic ? null : aesthetic)}
              >
                {aesthetic.charAt(0).toUpperCase() + aesthetic.slice(1)}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={regeneratePalettes} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Palettes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPalettes.map((palette, index) => {
          // If this is the last element and we have more to load, attach the ref
          const isLastElement = index === filteredPalettes.length - 1

          return (
            <div
              key={palette.id}
              ref={isLastElement ? lastPaletteElementRef : null}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Palette colors */}
             <div className="flex h-24">
                {palette.colors.map((color, colorIndex) => (
                  <div
                    key={`${palette.id}-color-${colorIndex}`}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Palette info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{palette.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {/* <Heart className="h-4 w-4 fill-current" /> */}
                    {/* <span>{palette.likes}</span> */}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                <div className="flex flex-wrap gap-1 mb-3">
                  {palette.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={`${palette.id}-tag-${tagIndex}`} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {palette.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{palette.tags.length - 3} more</span>
                  )}
                </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(palette.id)}
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        likedPalettes.includes(palette.id) && "text-rose-500 hover:text-rose-600",
                      )}
                    >
                      {likedPalettes.includes(palette.id) ? (
                        <Heart className="h-4 w-4 mr-1 fill-current" />
                      ) : (
                        <HeartOff className="h-4 w-4 mr-1" />
                      )}
                      <span className="sr-only md:not-sr-only">
                        {likedPalettes.includes(palette.id) ? "Liked" : "Like"}
                      </span>
                    </Button> */}

                    <Button variant="ghost" size="sm" onClick={() => copyPalette(palette)}>
                      {copiedId === palette.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          <span className="sr-only md:not-sr-only">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          <span className="sr-only md:not-sr-only">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <PaletteDetail
                    palette={palette}
                    isLiked={likedPalettes.includes(palette.id)}
                    onToggleLike={toggleLike}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="sr-only md:not-sr-only">Details</span>
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {filteredPalettes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No palettes found matching your search.</p>
        </div>
      )}
    </div>
  )
}
