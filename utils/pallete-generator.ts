import { rgbToHex, hslToRgb } from "./color-utils"

// Simple UUID v4 generator for unique IDs
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Generate pastel palette
export function generatePastelPalette(count = 5): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    // Pastel colors have high lightness and medium-low saturation
    const h = Math.floor(Math.random() * 360)
    const s = 25 + Math.floor(Math.random() * 35) // 25-60%
    const l = 80 + Math.floor(Math.random() * 12) // 80-92%

    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate warm palette
export function generateWarmPalette(count = 5): string[] {
  const palette: string[] = []
  const warmHues = [0, 30, 60, 330, 300] // Reds, oranges, yellows, pinks

  for (let i = 0; i < count; i++) {
    // Warm colors are in the red-yellow spectrum
    const h = warmHues[i % warmHues.length] + Math.floor(Math.random() * 30) - 15
    const s = 55 + Math.floor(Math.random() * 40) // 55-95%
    const l = 40 + Math.floor(Math.random() * 40) // 40-80%

    const [r, g, b] = hslToRgb((h + 360) % 360, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate cool palette
export function generateCoolPalette(count = 5): string[] {
  const palette: string[] = []
  const coolHues = [180, 210, 240, 270] // Cyans, blues, purples

  for (let i = 0; i < count; i++) {
    // Cool colors are in the blue-green spectrum
    const h = coolHues[i % coolHues.length] + Math.floor(Math.random() * 30) - 15
    const s = 40 + Math.floor(Math.random() * 50) // 40-90%
    const l = 40 + Math.floor(Math.random() * 40) // 40-80%

    const [r, g, b] = hslToRgb((h + 360) % 360, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate moody palette
export function generateMoodyPalette(count = 5): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    // Moody colors have lower saturation and lightness
    const h = Math.floor(Math.random() * 360)
    const s = 20 + Math.floor(Math.random() * 40) // 20-60%
    const l = 15 + Math.floor(Math.random() * 35) // 15-50%

    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate neutral palette
export function generateNeutralPalette(count = 5): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    // Neutral colors have very low saturation
    const h = Math.floor(Math.random() * 360)
    const s = 5 + Math.floor(Math.random() * 15) // 5-20%
    const l = 30 + Math.floor(Math.random() * 60) // 30-90%

    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate monochromatic palette
export function generateMonochromaticPalette(count = 5): string[] {
  const palette: string[] = []

  // Pick a single hue for the entire palette
  const h = Math.floor(Math.random() * 360)

  for (let i = 0; i < count; i++) {
    // Vary saturation and lightness
    const s = 30 + Math.floor(Math.random() * 60) // 30-90%
    const l = 20 + Math.floor((i * 60) / (count - 1)) // Distribute from 20% to 80% lightness

    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate vibrant palette
export function generateVibrantPalette(count = 5): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    // Vibrant colors have high saturation
    const h = Math.floor(Math.random() * 360)
    const s = 80 + Math.floor(Math.random() * 20) // 80-100%
    const l = 45 + Math.floor(Math.random() * 25) // 45-70%

    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate earthy palette
export function generateEarthyPalette(count = 5): string[] {
  const palette: string[] = []
  const earthyHues = [30, 60, 90, 120, 180] // Browns, greens, olives

  for (let i = 0; i < count; i++) {
    const h = earthyHues[i % earthyHues.length] + Math.floor(Math.random() * 20) - 10
    const s = 30 + Math.floor(Math.random() * 40) // 30-70%
    const l = 30 + Math.floor(Math.random() * 40) // 30-70%

    const [r, g, b] = hslToRgb((h + 360) % 360, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate retro palette
export function generateRetroPalette(count = 5): string[] {
  // Retro colors from 70s, 80s, 90s
  const retroColors = [
    "#FF6B35",
    "#F7C59F",
    "#EFEFD0",
    "#004E89",
    "#1A659E", // 70s
    "#FF00FF",
    "#00FFFF",
    "#FFFF00",
    "#FF0000",
    "#0000FF", // 80s neon
    "#7B68EE",
    "#9370DB",
    "#8A2BE2",
    "#9932CC",
    "#BA55D3", // 90s purple
    "#E55137",
    "#F6C683",
    "#6A7B76",
    "#2F4858",
    "#33658A", // Retro misc
  ]

  const palette: string[] = []
  const usedIndices = new Set<number>()

  while (palette.length < count) {
    const index = Math.floor(Math.random() * retroColors.length)
    if (!usedIndices.has(index)) {
      palette.push(retroColors[index])
      usedIndices.add(index)
    }
  }

  return palette
}

// Generate a palette based on a specific aesthetic
export type PaletteAesthetic =
  | "pastel"
  | "warm"
  | "cool"
  | "moody"
  | "neutral"
  | "monochromatic"
  | "vibrant"
  | "earthy"
  | "retro"
  | "random"

export function generatePaletteByAesthetic(aesthetic: PaletteAesthetic, count = 5): string[] {
  switch (aesthetic) {
    case "pastel":
      return generatePastelPalette(count)
    case "warm":
      return generateWarmPalette(count)
    case "cool":
      return generateCoolPalette(count)
    case "moody":
      return generateMoodyPalette(count)
    case "neutral":
      return generateNeutralPalette(count)
    case "monochromatic":
      return generateMonochromaticPalette(count)
    case "vibrant":
      return generateVibrantPalette(count)
    case "earthy":
      return generateEarthyPalette(count)
    case "retro":
      return generateRetroPalette(count)
    case "random":
    default:
      // Pick a random aesthetic
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
      ]
      const randomAesthetic = aesthetics[Math.floor(Math.random() * aesthetics.length)]
      return generatePaletteByAesthetic(randomAesthetic, count)
  }
}

// Generate palette names based on aesthetic
export function generatePaletteName(aesthetic: PaletteAesthetic): string {
  const namesByAesthetic: Record<PaletteAesthetic, string[]> = {
    pastel: [
      "Cotton Candy Dreams",
      "Soft Whispers",
      "Pastel Paradise",
      "Gentle Morning",
      "Sweet Macarons",
      "Dreamy Pastels",
    ],
    warm: ["Autumn Sunset", "Desert Heat", "Spice Market", "Cozy Fireplace", "Golden Hour", "Warm Embrace"],
    cool: ["Ocean Depths", "Winter Frost", "Twilight Sky", "Cool Breeze", "Midnight Blues", "Arctic Chill"],
    moody: ["Stormy Weather", "Midnight Mystery", "Dark Elegance", "Shadowy Corners", "Moody Blues", "Dramatic Dusk"],
    neutral: [
      "Minimalist Haven",
      "Subtle Sophistication",
      "Timeless Neutrals",
      "Urban Concrete",
      "Natural Linen",
      "Quiet Elegance",
    ],
    monochromatic: [
      "Shades of Serenity",
      "Monochrome Magic",
      "Single Spectrum",
      "Gradient Flow",
      "Tonal Harmony",
      "One Hue Wonder",
    ],
    vibrant: [
      "Electric Dreams",
      "Carnival Colors",
      "Vivid Vision",
      "Bold Statement",
      "Color Explosion",
      "Vibrant Voyage",
    ],
    earthy: [
      "Forest Floor",
      "Terracotta Sunset",
      "Natural Elements",
      "Woodland Retreat",
      "Earthy Embrace",
      "Organic Palette",
    ],
    retro: [
      "Vintage Vibes",
      "Retro Revival",
      "Nostalgic Notes",
      "Throwback Thursday",
      "Classic Comeback",
      "Disco Days",
    ],
    random: [
      "Serendipity",
      "Unexpected Harmony",
      "Random Radiance",
      "Chance Encounter",
      "Lucky Mix",
      "Surprise Spectrum",
    ],
  }

  const names = namesByAesthetic[aesthetic]
  return names[Math.floor(Math.random() * names.length)]
}

// Generate random tags based on aesthetic
export function generateTags(aesthetic: PaletteAesthetic): string[] {
  const commonTags = ["color", "palette", "design"]

  const tagsByAesthetic: Record<PaletteAesthetic, string[]> = {
    pastel: ["soft", "light", "gentle", "delicate", "sweet", "dreamy"],
    warm: ["cozy", "autumn", "sunset", "golden", "spice", "comfort"],
    cool: ["fresh", "winter", "ocean", "calm", "serene", "tranquil"],
    moody: ["dark", "dramatic", "mysterious", "intense", "deep", "shadowy"],
    neutral: ["minimal", "clean", "subtle", "sophisticated", "timeless", "versatile"],
    monochromatic: ["single-hue", "gradient", "tonal", "shades", "simple", "elegant"],
    vibrant: ["bold", "bright", "energetic", "lively", "dynamic", "striking"],
    earthy: ["natural", "organic", "rustic", "grounded", "woodland", "nature"],
    retro: ["vintage", "nostalgic", "classic", "throwback", "70s", "80s", "90s"],
    random: ["eclectic", "diverse", "mixed", "varied", "assorted", "unique"],
  }

  const aestheticTags = tagsByAesthetic[aesthetic]

  // Select 2-3 common tags and 1-3 aesthetic-specific tags
  const selectedCommonTags = commonTags.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2))
  const selectedAestheticTags = aestheticTags
    .sort(() => 0.5 - Math.random())
    .slice(0, 1 + Math.floor(Math.random() * 3))

  // Always include the aesthetic itself as a tag
  return [aesthetic, ...selectedCommonTags, ...selectedAestheticTags]
}
