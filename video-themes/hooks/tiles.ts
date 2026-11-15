// The tile engine every scene is drawn with: each "pixel" is a small rounded square with one character on it,
// laid on an 18px grid over a faint graph-paper background, as in the video.

/** Grid pitch and tile size, in the scene's 1600x1000 user units. */
export const PITCH = 18
const SIZE = 16
const GLYPHS = 'tt%%::SS;X$sx'

export type Cell = readonly [number, number]

/** A deterministic stand-in for a random number in 0..1, so every build of a scene is the same. */
export function hash(x: number, y: number, seed: number): number {
  let v = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0
  v = Math.imul(v ^ (v >>> 13), 1274126177)
  v = v ^ (v >>> 16)
  return (v >>> 0) / 4294967296
}

const STILL = '@media (prefers-reduced-motion: reduce) { * { animation: none !important } }'

/** Opens a scene: the root svg, the shared tile, the grid pattern, and the scene's own CSS. */
export function open(css: string, defs = ''): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1600 1000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" ` +
    `font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="600" text-anchor="middle">` +
    `<style>${css} ${STILL}</style>` +
    `<defs><rect id="b" width="${SIZE}" height="${SIZE}" rx="2.5"/>` +
    `<pattern id="grid" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse"><path d="M${PITCH} 0H0V${PITCH}" fill="none" stroke="currentColor" stroke-width="1"/></pattern>` +
    `${defs}</defs>`
  )
}

export const close = '</svg>'

/** A full-window vertical gradient with the faint grid over it. */
export function sky(id: string, stops: readonly string[], grid: string, gridOpacity: number): string {
  const s = stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${s}</linearGradient></defs>` +
    `<rect width="1600" height="1000" fill="url(#${id})"/>` +
    `<rect width="1600" height="1000" fill="url(#grid)" color="${grid}" opacity="${gridOpacity * 0.45}"/>`
  )
}

/** Tiles of one color: the squares in `fill`, their characters in `ink`. Cells are grid units, local to the sprite. */
export function tiles(cells: readonly Cell[], fill: string, ink: string, seed = 1): string {
  if (cells.length === 0) return ''
  let squares = ''
  let glyphs = ''
  for (const [c, r] of cells) {
    const x = c * PITCH
    const y = r * PITCH
    squares += `<use href="#b" xlink:href="#b" x="${x}" y="${y}"/>`
    const g = GLYPHS[Math.floor(hash(c, r, seed) * GLYPHS.length)]
    glyphs += `<text x="${x + 8}" y="${y + 12}">${g}</text>`
  }
  return `<g fill="${fill}">${squares}</g><g fill="${ink}">${glyphs}</g>`
}

/** Cells inside an ellipse centred on (cx, cy), radii in cells. */
export function ellipse(cx: number, cy: number, rx: number, ry: number): Cell[] {
  const out: Cell[] = []
  for (let r = Math.floor(cy - ry); r <= Math.ceil(cy + ry); r++) {
    for (let c = Math.floor(cx - rx); c <= Math.ceil(cx + rx); c++) {
      const dx = (c - cx) / rx
      const dy = (r - cy) / ry
      if (dx * dx + dy * dy <= 1) out.push([c, r])
    }
  }
  return out
}

/** Cells within `w` of the segment from (x1, y1) to (x2, y2). */
export function line(x1: number, y1: number, x2: number, y2: number, w: number): Cell[] {
  const out: Cell[] = []
  const minC = Math.floor(Math.min(x1, x2) - w)
  const maxC = Math.ceil(Math.max(x1, x2) + w)
  const minR = Math.floor(Math.min(y1, y2) - w)
  const maxR = Math.ceil(Math.max(y1, y2) + w)
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy || 1
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const t = Math.max(0, Math.min(1, ((c - x1) * dx + (r - y1) * dy) / len2))
      const px = x1 + t * dx - c
      const py = y1 + t * dy - r
      if (px * px + py * py <= w * w) out.push([c, r])
    }
  }
  return out
}

/** The union of several cell lists, each cell once, in a stable order. */
export function union(...lists: readonly (readonly Cell[])[]): Cell[] {
  const seen = new Set<string>()
  const out: Cell[] = []
  for (const list of lists) {
    for (const cell of list) {
      const k = `${cell[0]},${cell[1]}`
      if (!seen.has(k)) {
        seen.add(k)
        out.push(cell)
      }
    }
  }
  return out
}

/** The cells of `a` that are not in `b`. */
export function minus(a: readonly Cell[], b: readonly Cell[]): Cell[] {
  const drop = new Set(b.map(([c, r]) => `${c},${r}`))
  return a.filter(([c, r]) => !drop.has(`${c},${r}`))
}

/** A puffy cloud: a wide base and humps on top, `w` cells across. */
export function cloud(w: number, seed: number): Cell[] {
  const h = Math.max(2, w * 0.22)
  const parts: Cell[][] = [ellipse(0, 0, w / 2, h * 0.55)]
  const humps = 2 + Math.floor(hash(w, 1, seed) * 2)
  for (let i = 0; i < humps; i++) {
    const x = (-0.3 + (0.6 * i) / Math.max(1, humps - 1)) * w + (hash(i, w, seed) - 0.5) * 2
    const r = w * (0.16 + hash(i, 2, seed) * 0.1)
    parts.push(ellipse(x, -h * 0.45, r, r * 0.8))
  }
  return union(...parts)
}

/** A long flat band of cloud, three rows of staggered lengths, as in the moonlit sky. */
export function band(len: number, seed: number): Cell[] {
  const out: Cell[] = []
  const rows = [
    [Math.round(len * 0.25), Math.round(len * 0.55)],
    [0, len],
    [Math.round(len * 0.15), Math.round(len * 0.85)],
    [Math.round(len * 0.3), Math.round(len * 0.7)],
  ]
  rows.forEach(([a, b], r) => {
    const jitter = Math.round((hash(r, len, seed) - 0.5) * 3)
    for (let c = (a ?? 0) + jitter; c < (b ?? len) + jitter; c++) out.push([c, r])
  })
  return out
}
