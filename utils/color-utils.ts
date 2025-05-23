// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

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

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Convert HEX to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
    : [0, 0, 0]
}

// Generate a random color in HEX format
export function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return rgbToHex(r, g, b)
}

// Generate a random palette with n colors
export function generateRandomPalette(count = 5): string[] {
  return Array.from({ length: count }, () => generateRandomColor())
}

// Generate a palette with color harmony
export function generateHarmoniousPalette(count = 5, baseHue?: number): string[] {
  // If no base hue is provided, generate a random one
  const hue = baseHue ?? Math.floor(Math.random() * 360)

  const palette: string[] = []

  // Generate colors with different harmonies
  switch (count) {
    case 3: // Triadic
      for (let i = 0; i < count; i++) {
        const h = (hue + i * 120) % 360
        const s = 70 + Math.random() * 30 // 70-100%
        const l = 40 + Math.random() * 20 // 40-60%
        const [r, g, b] = hslToRgb(h, s, l)
        palette.push(rgbToHex(r, g, b))
      }
      break
    case 4: // Tetradic
      for (let i = 0; i < count; i++) {
        const h = (hue + i * 90) % 360
        const s = 70 + Math.random() * 30
        const l = 40 + Math.random() * 20
        const [r, g, b] = hslToRgb(h, s, l)
        palette.push(rgbToHex(r, g, b))
      }
      break
    case 5: // Pentadic with varying saturation and lightness
      for (let i = 0; i < count; i++) {
        const h = (hue + i * 72) % 360 // 360/5 = 72 degrees apart
        const s = 60 + Math.random() * 40
        const l = 35 + Math.random() * 30
        const [r, g, b] = hslToRgb(h, s, l)
        palette.push(rgbToHex(r, g, b))
      }
      break
    default: // Random with some harmony
      for (let i = 0; i < count; i++) {
        const h = (hue + i * (360 / count)) % 360
        const s = 60 + Math.random() * 40
        const l = 35 + Math.random() * 30
        const [r, g, b] = hslToRgb(h, s, l)
        palette.push(rgbToHex(r, g, b))
      }
  }

  return palette
}

// Generate a monochromatic palette
export function generateMonochromaticPalette(count = 5, baseColor?: string): string[] {
  let h, s, l

  if (baseColor) {
    const [r, g, b] = hexToRgb(baseColor)
    ;[h, s, l] = rgbToHsl(r, g, b)
  } else {
    h = Math.floor(Math.random() * 360)
    s = 70 + Math.random() * 30
    l = 50
  }

  const palette: string[] = []

  // Generate colors with same hue but different lightness
  for (let i = 0; i < count; i++) {
    const newL = 20 + (i * 60) / (count - 1) // Distribute from 20% to 80% lightness
    const [r, g, b] = hslToRgb(h, s, newL)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate a palette based on a specific scheme
export type ColorScheme = "random" | "monochromatic" | "analogous" | "complementary" | "triadic" | "tetradic"

export function generatePaletteByScheme(scheme: ColorScheme, count = 5, baseColor?: string): string[] {
  let baseHue

  if (baseColor) {
    const [r, g, b] = hexToRgb(baseColor)
    ;[baseHue] = rgbToHsl(r, g, b)
  } else {
    baseHue = Math.floor(Math.random() * 360)
  }

  switch (scheme) {
    case "monochromatic":
      return generateMonochromaticPalette(count, baseColor)
    case "analogous":
      return generateAnalogousPalette(count, baseHue)
    case "complementary":
      return generateComplementaryPalette(count, baseHue)
    case "triadic":
      return generateTriadicPalette(count, baseHue)
    case "tetradic":
      return generateTetradicPalette(count, baseHue)
    case "random":
    default:
      return generateRandomPalette(count)
  }
}

// Generate an analogous palette
function generateAnalogousPalette(count = 5, baseHue: number): string[] {
  const palette: string[] = []
  const range = 30 // Degrees of hue variation

  for (let i = 0; i < count; i++) {
    const hueOffset = -range + (i * (2 * range)) / (count - 1)
    const h = (baseHue + hueOffset + 360) % 360
    const s = 70 + Math.random() * 30
    const l = 40 + Math.random() * 20
    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate a complementary palette
function generateComplementaryPalette(count = 5, baseHue: number): string[] {
  const palette: string[] = []
  const complementHue = (baseHue + 180) % 360

  // If count is odd, we'll have one more color from the base hue side
  const baseCount = Math.ceil(count / 2)
  const complementCount = count - baseCount

  // Generate colors from base hue
  for (let i = 0; i < baseCount; i++) {
    const h = baseHue
    const s = 70 + (i * 30) / baseCount
    const l = 30 + (i * 40) / baseCount
    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  // Generate colors from complementary hue
  for (let i = 0; i < complementCount; i++) {
    const h = complementHue
    const s = 70 + (i * 30) / complementCount
    const l = 30 + (i * 40) / complementCount
    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate a triadic palette
function generateTriadicPalette(count = 5, baseHue: number): string[] {
  const palette: string[] = []
  const hue2 = (baseHue + 120) % 360
  const hue3 = (baseHue + 240) % 360

  const hues = [baseHue, hue2, hue3]

  for (let i = 0; i < count; i++) {
    const hueIndex = i % 3
    const h = hues[hueIndex]
    const s = 70 + Math.random() * 30
    const l = 40 + Math.random() * 20
    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Generate a tetradic palette
function generateTetradicPalette(count = 5, baseHue: number): string[] {
  const palette: string[] = []
  const hue2 = (baseHue + 90) % 360
  const hue3 = (baseHue + 180) % 360
  const hue4 = (baseHue + 270) % 360

  const hues = [baseHue, hue2, hue3, hue4]

  for (let i = 0; i < count; i++) {
    const hueIndex = i % 4
    const h = hues[hueIndex]
    const s = 70 + Math.random() * 30
    const l = 40 + Math.random() * 20
    const [r, g, b] = hslToRgb(h, s, l)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

// Get a color name (simplified version)
export function getColorName(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(r, g, b)

  // Very simplified color naming
  let hueCategory = ""
  if (h < 30 || h >= 330) hueCategory = "Red"
  else if (h < 60) hueCategory = "Orange"
  else if (h < 90) hueCategory = "Yellow"
  else if (h < 150) hueCategory = "Green"
  else if (h < 210) hueCategory = "Cyan"
  else if (h < 270) hueCategory = "Blue"
  else if (h < 330) hueCategory = "Purple"

  let lightness = ""
  if (l < 20) lightness = "Dark"
  else if (l > 80) lightness = "Light"

  let saturation = ""
  if (s < 20) {
    if (l < 20) return "Black"
    if (l > 80) return "White"
    return "Gray"
  } else if (s < 40) {
    saturation = "Grayish"
  }

  return `${lightness} ${saturation} ${hueCategory}`.trim()
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const [r, g, b] = hexToRgb(hex).map((c) => {
      const channel = c / 255
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)

  const brightest = Math.max(luminance1, luminance2)
  const darkest = Math.min(luminance1, luminance2)

  return (brightest + 0.05) / (darkest + 0.05)
}

// Check if a color is accessible on a background
export function isAccessible(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}
