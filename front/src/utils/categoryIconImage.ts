// Local, alpha-aware image processing. No external image service.
export const MAX_ICON_BYTES = 2 * 1024 * 1024
export const MAX_ICON_DATA_LENGTH = 120000
const MAX_PIXELS = 36_000_000
const TARGET_SIZE = 768
const DISPLAY_SIZE = 512

export function isSupportedIconImage(blob: Blob): boolean {
  return /^(image\/(png|jpeg|webp|x-icon|vnd\.microsoft\.icon))$/i.test(blob.type)
    || (!blob.type && blob instanceof File && /\.ico$/i.test(blob.name))
}

function canvas(width: number, height: number) {
  const output = document.createElement('canvas')
  output.width = width
  output.height = height
  const ctx = output.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('invalid')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return { output, ctx }
}

async function decode(src: string) {
  const image = new Image()
  image.src = src
  await image.decode()
  if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > MAX_PIXELS) throw new Error('invalid')
  return image
}

type Tap = { index: number; weight: number }
const sinc = (x: number) => Math.abs(x) < 1e-7 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x)
function lanczosWeights(input: number, output: number): Tap[][] {
  const scale = Math.max(1, input / output)
  return Array.from({ length: output }, (_, x) => {
    const center = (x + 0.5) * input / output - 0.5
    const taps: Tap[] = []
    let sum = 0
    for (let p = Math.ceil(center - 3 * scale); p <= Math.floor(center + 3 * scale); p++) {
      const d = (center - p) / scale
      if (Math.abs(d) >= 3) continue
      const weight = sinc(d) * sinc(d / 3)
      taps.push({ index: Math.max(0, Math.min(input - 1, p)), weight })
      sum += weight
    }
    for (const tap of taps) tap.weight /= sum
    return taps
  })
}

// Separable Lanczos-3 in premultiplied RGBA space. Clamp to valid
// premultiplied channel ranges to prevent invalid alpha or colors.
function lanczosResize(image: HTMLImageElement, size: number) {
  const scale = size / Math.max(image.naturalWidth, image.naturalHeight)
  const tw = Math.max(1, Math.round(image.naturalWidth * scale))
  const th = Math.max(1, Math.round(image.naturalHeight * scale))
  const pre = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight))
  const sw = Math.max(1, Math.round(image.naturalWidth * pre))
  const sh = Math.max(1, Math.round(image.naturalHeight * pre))
  const input = canvas(sw, sh)
  input.ctx.drawImage(image, 0, 0, sw, sh)
  const src = input.ctx.getImageData(0, 0, sw, sh).data
  const wx = lanczosWeights(sw, tw), wy = lanczosWeights(sh, th)
  const intermediate = new Float32Array(tw * sh * 4)
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < tw; x++) {
      const j = (y * tw + x) * 4
      for (const { index, weight } of wx[x]!) {
        const i = (y * sw + index) * 4
        const a = src[i + 3]! / 255
        intermediate[j] = intermediate[j]! + src[i]! * a * weight
        intermediate[j + 1] = intermediate[j + 1]! + src[i + 1]! * a * weight
        intermediate[j + 2] = intermediate[j + 2]! + src[i + 2]! * a * weight
        intermediate[j + 3] = intermediate[j + 3]! + src[i + 3]! * weight
      }
      const a = Math.max(0, Math.min(255, intermediate[j + 3]!))
      intermediate[j + 3] = a
      for (let c = 0; c < 3; c++) intermediate[j + c] = Math.max(0, Math.min(a, intermediate[j + c]!))
    }
  }
  const result = canvas(size, size)
  const frame = result.ctx.createImageData(tw, th)
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const j = (y * tw + x) * 4
      let r = 0, g = 0, b = 0, a = 0
      for (const { index, weight } of wy[y]!) {
        const i = (index * tw + x) * 4
        r += intermediate[i]! * weight
        g += intermediate[i + 1]! * weight
        b += intermediate[i + 2]! * weight
        a += intermediate[i + 3]! * weight
      }
      a = Math.max(0, Math.min(255, a))
      if (a < 0.5) continue
      frame.data[j] = Math.max(0, Math.min(a, r)) * 255 / a
      frame.data[j + 1] = Math.max(0, Math.min(a, g)) * 255 / a
      frame.data[j + 2] = Math.max(0, Math.min(a, b)) * 255 / a
      frame.data[j + 3] = a
    }
  }
  result.ctx.putImageData(frame, Math.floor((size - tw) / 2), Math.floor((size - th) / 2))
  return result
}

// Running-sum separable blur of alpha-weighted luminance, O(n) per radius.
function blur(input: Float32Array, size: number, radius: number) {
  const tmp = new Float32Array(input.length), out = new Float32Array(input.length)
  const divisor = 2 * radius + 1
  for (let y = 0; y < size; y++) {
    const row = y * size
    let sum = 0
    for (let k = -radius; k <= radius; k++) sum += input[row + Math.max(0, Math.min(size - 1, k))]!
    for (let x = 0; x < size; x++) {
      tmp[row + x] = sum / divisor
      sum += input[row + Math.min(size - 1, x + radius + 1)]! - input[row + Math.max(0, x - radius)]!
    }
  }
  for (let x = 0; x < size; x++) {
    let sum = 0
    for (let k = -radius; k <= radius; k++) sum += tmp[Math.max(0, Math.min(size - 1, k)) * size + x]!
    for (let y = 0; y < size; y++) {
      out[y * size + x] = sum / divisor
      sum += tmp[Math.min(size - 1, y + radius + 1) * size + x]! - tmp[Math.max(0, y - radius) * size + x]!
    }
  }
  return out
}

// Multi-scale high boost: fine edges + medium detail + microcontrast at the
// scale of the final CSS icon. Boost luminance, not RGB independently, to
// avoid color fringes. Preserve alpha; limit overshoot and suppress flat noise.
function enhanceDetails(ctx: CanvasRenderingContext2D, size: number, strength: number) {
  const frame = ctx.getImageData(0, 0, size, size)
  const pixels = frame.data, n = size * size
  const alpha = new Float32Array(n), light = new Float32Array(n)
  for (let p = 0; p < n; p++) {
    const i = p * 4
    alpha[p] = pixels[i + 3]! / 255
    light[p] = (0.2126 * pixels[i]! + 0.7152 * pixels[i + 1]! + 0.0722 * pixels[i + 2]!) * alpha[p]!
  }
  const bands = [2, 5, 12].map((r, j) => {
    const radius = Math.max(1, Math.round(r * size / DISPLAY_SIZE))
    return { lum: blur(light, size, radius), alpha: blur(alpha, size, radius), gain: [1.25, 0.85, 0.48][j]! }
  })
  for (let p = 0; p < n; p++) {
    if (alpha[p]! < 0.65) continue
    const i = p * 4, l = light[p]! / alpha[p]!
    let boost = 0
    for (const band of bands) {
      if (band.alpha[p]! < 0.75) continue
      const d = l - band.lum[p]! / band.alpha[p]!
      const magnitude = Math.abs(d)
      if (magnitude > 1.8) boost += Math.sign(d) * (magnitude - 1.8) * band.gain
    }
    const delta = Math.max(-42, Math.min(42, boost * strength))
    for (let c = 0; c < 3; c++) pixels[i + c] = pixels[i + c]! + delta
  }
  ctx.putImageData(frame, 0, 0)
}

export async function normalizeCategoryIcon(blob: Blob): Promise<string> {
  if (!isSupportedIconImage(blob) || !blob.size || blob.size > MAX_ICON_BYTES) throw new Error('invalid')
  const url = URL.createObjectURL(blob)
  try {
    const image = await decode(url)
    // Preserve the existing data budget and choose the highest usable resolution.
    for (const size of [TARGET_SIZE, 640, 512, 448, 384, 320, 256, 192, 128]) {
      const { output, ctx } = lanczosResize(image, size)
      enhanceDetails(ctx, size, 0.65)
      const lossless = output.toDataURL('image/png')
      if (lossless.length <= MAX_ICON_DATA_LENGTH) return lossless
      for (const quality of [0.98, 0.95, 0.92, 0.88]) {
        const data = output.toDataURL('image/webp', quality)
        if (data.startsWith('data:image/webp;base64,') && data.length <= MAX_ICON_DATA_LENGTH) return data
      }
    }
    throw new Error('invalid')
  } finally { URL.revokeObjectURL(url) }
}

const enhanced = new Map<string, Promise<string>>()
const CACHE_LIMIT = 16
let queue: Promise<unknown> = Promise.resolve()

// Enhance all custom icon resolutions at the scale that survives display.
// Limit concurrent processing and retain the original as a reliable fallback.
export function enhanceCategoryIconForDisplay(src: string): Promise<string> {
  const cached = enhanced.get(src)
  if (cached) {
    enhanced.delete(src)
    enhanced.set(src, cached)
    return cached
  }
  const job = queue.then(async () => {
    const image = await decode(src)
    const { output, ctx } = lanczosResize(image, DISPLAY_SIZE)
    enhanceDetails(ctx, DISPLAY_SIZE, 1.15)
    return output.toDataURL('image/png')
  }).catch(() => src)
  queue = job.then(() => new Promise<void>(resolve => setTimeout(resolve, 0)))
  enhanced.set(src, job)
  if (enhanced.size > CACHE_LIMIT) enhanced.delete(enhanced.keys().next().value!)
  return job
}
