// The eight scenes from the video, each one SVG whose own CSS animates it. Everything is built from tiles.ts.
import {
  PITCH,
  band,
  close,
  cloud,
  ellipse,
  hash,
  line,
  minus,
  open,
  sky,
  tiles,
  union,
  type Cell,
} from './tiles'

const P = PITCH

/** A sprite placed at (x, y) pixels, wrapped in an element that carries a CSS animation. */
function moving(cls: string, delay: number, x: number, y: number, body: string, extra = ''): string {
  return `<g class="${cls}" style="animation-delay:${delay}s${extra}"><g transform="translate(${x} ${y})">${body}</g></g>`
}

/* ── Claude Code: a warm dark room and a big terracotta spark that slowly breathes and turns ── */
export function claudeCodeSvg(): string {
  const rays: Cell[][] = []
  const count = 16
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (hash(i, 3, 7) - 0.5) * 0.25
    const len = 6.5 + hash(i, 1, 7) * 5
    rays.push(line(Math.cos(a) * 1.5, Math.sin(a) * 1.5, Math.cos(a) * len, Math.sin(a) * len, 0.85))
  }
  const core = ellipse(0, 0, 2.6, 2.6)
  const outer = minus(union(...rays), core)
  const tips = outer.filter(([c, r]) => Math.hypot(c, r) > 7.5)
  const mid = minus(outer, tips)
  let specks = ''
  for (let i = 0; i < 26; i++) {
    const x = Math.round(hash(i, 1, 11) * 1600)
    const y = Math.round(hash(i, 2, 11) * 1000)
    const s = 2 + Math.round(hash(i, 3, 11) * 2)
    specks += `<rect class="speck" x="${x}" y="${y}" width="${s}" height="${s}" fill="#e7b9a2" style="animation-delay:-${Math.round(hash(i, 4, 11) * 40)}s"/>`
  }
  const spark = tiles(mid, '#c4694a', '#f3cdb9', 3) + tiles(tips, '#d98c6c', '#fbe2d4', 4) + tiles(core, '#e7a688', '#fff1e8', 5)
  return (
    open(
      `.spark{transform-box:fill-box;transform-origin:50% 50%;animation:turn 160s linear infinite}
       .breathe{transform-box:fill-box;transform-origin:50% 50%;animation:breathe 7s ease-in-out infinite alternate}
       .glow{animation:glow 7s ease-in-out infinite alternate}
       .speck{animation:float 40s linear infinite;opacity:.35}
       @keyframes turn{to{transform:rotate(360deg)}}
       @keyframes breathe{from{transform:scale(.96)}to{transform:scale(1.04)}}
       @keyframes glow{from{opacity:.55}to{opacity:.95}}
       @keyframes float{from{transform:translateY(0);opacity:0}15%{opacity:.4}85%{opacity:.4}to{transform:translateY(-220px);opacity:0}}`,
      `<radialGradient id="warm"><stop offset="0" stop-color="#5a3526" stop-opacity=".9"/><stop offset="1" stop-color="#5a3526" stop-opacity="0"/></radialGradient>
       <radialGradient id="shade" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#2a201b"/><stop offset="1" stop-color="#14100e"/></radialGradient>`,
    ) +
    `<rect width="1600" height="1000" fill="url(#shade)"/>` +
    `<rect width="1600" height="1000" fill="url(#grid)" color="#4a3a32" opacity=".16"/>` +
    `<ellipse class="glow" cx="1330" cy="230" rx="420" ry="340" fill="url(#warm)"/>` +
    specks +
    `<g transform="translate(1330 230)"><g class="breathe"><g class="spark">${spark}</g></g></g>` +
    close
  )
}

/* ── Cloud Drift: a pale blue sky with white tile clouds drifting across at three speeds ── */
export function cloudDriftSvg(): string {
  const specs = [
    { w: 16, y: 70, dur: 150, at: 0.05 },
    { w: 12, y: 150, dur: 120, at: 0.62 },
    { w: 20, y: 300, dur: 180, at: 0.35 },
    { w: 9, y: 420, dur: 100, at: 0.82 },
    { w: 15, y: 560, dur: 160, at: 0.15 },
    { w: 11, y: 700, dur: 110, at: 0.48 },
    { w: 18, y: 840, dur: 170, at: 0.72 },
    { w: 8, y: 240, dur: 95, at: 0.25 },
  ]
  let body = ''
  specs.forEach((s, i) => {
    const cells = cloud(s.w, i + 1)
    const sprite = tiles(cells, '#fcfdff', '#a9bfd3', i + 20)
    body += moving('drift', -s.dur * s.at, 0, s.y, sprite, `;animation-duration:${s.dur}s`)
  })
  let birds = ''
  for (let i = 0; i < 5; i++) {
    birds += `<text class="bird" x="${560 + i * 22}" y="${470 + (i % 2) * 12}" fill="#7f97ad" font-size="13" style="animation-delay:-${i * 0.4}s">v</text>`
  }
  return (
    open(
      `.drift{animation:drift 150s linear infinite}
       .bird{animation:flap 1.6s ease-in-out infinite alternate}
       .birds{animation:fly 90s linear infinite}
       @keyframes drift{from{transform:translateX(-420px)}to{transform:translateX(1960px)}}
       @keyframes flap{from{transform:translateY(0)}to{transform:translateY(-4px)}}
       @keyframes fly{from{transform:translate(-700px,80px)}to{transform:translate(1300px,-120px)}}`,
    ) +
    sky('sky', ['#a9d2f3', '#c8e3f8', '#e3f0fb'], '#ffffff', 0.35) +
    `<g class="birds">${birds}</g>` +
    body +
    close
  )
}

/* ── Honu Lagoon: teal water from above, a tile sea turtle swimming up and across, a sand corner and ripples ── */
function turtle(): string {
  const shell = ellipse(0, 0, 5.4, 4)
  const plate = ellipse(0, 0, 3, 2)
  const head = ellipse(7.2, 0, 2, 1.5)
  const flipper = (side: 1 | -1, front: boolean) => {
    const cells = front ? line(3, side * 3.4, -3.5, side * 10, 0.75) : line(-3.8, side * 2.8, -7, side * 5.2, 0.7)
    const origin = side === -1 ? '100% 100%' : '100% 0%'
    const cls = front ? 'fin' : 'fin back'
    return `<g class="${cls}" style="transform-origin:${origin};animation-direction:${side === -1 ? 'alternate' : 'alternate-reverse'}">${tiles(cells, '#d6b23e', '#6a5913', front ? 31 : 32)}</g>`
  }
  return (
    flipper(-1, true) +
    flipper(1, true) +
    flipper(-1, false) +
    flipper(1, false) +
    tiles(head, '#c49a33', '#5d4a10', 33) +
    tiles(minus(shell, plate), '#b8435a', '#f3b9c4', 34) +
    tiles(plate, '#94304a', '#e79aab', 35)
  )
}

export function honuLagoonSvg(): string {
  const sand = ellipse(2, 56, 12, 7)
  const shallow = minus(ellipse(2, 56, 16, 10), sand)
  let ripples = ''
  for (let i = 0; i < 14; i++) {
    const y = 120 + i * 58
    const x = 1240 + Math.round(hash(i, 1, 41) * 220)
    let row = ''
    for (let k = 0; k < 9; k++) row += `<rect x="${x + k * 12}" y="${y}" width="6" height="3" rx="1"/>`
    ripples += `<g class="ripple" style="animation-delay:-${Math.round(hash(i, 2, 41) * 12)}s">${row}</g>`
  }
  return (
    open(
      `.swim{animation:swim 75s linear infinite}
       .fin{transform-box:fill-box;animation:paddle 2.6s ease-in-out infinite alternate}
       .fin.back{animation-duration:2s}
       .ripple{animation:ripple 12s ease-in-out infinite alternate}
       @keyframes swim{from{transform:translate(-200px,1160px)}to{transform:translate(1900px,-260px)}}
       @keyframes paddle{from{transform:rotate(-14deg)}to{transform:rotate(12deg)}}
       @keyframes ripple{from{transform:translateX(-30px);opacity:.25}to{transform:translateX(30px);opacity:.6}}`,
    ) +
    sky('water', ['#79c4cf', '#4da5b6', '#2f8597'], '#bdeaf0', 0.25) +
    `<g fill="#d8f4f6">${ripples}</g>` +
    tiles(shallow, '#7fc7cf', '#c9eef0', 42) +
    tiles(sand, '#e6d5ae', '#a89067', 43) +
    `<g class="swim" style="animation-delay:-30s"><g transform="rotate(-34)">${turtle()}</g></g>` +
    close
  )
}

/* ── Koi Pond: green water, two koi gliding through, lily pads and a few pink petals ── */
function koi(fill: string, ink: string, spot: string, seed: number): string {
  const body = ellipse(0, 0, 6.5, 2.1)
  const tail = line(-6.5, 0, -10, -2, 0.7).concat(line(-6.5, 0, -10, 2, 0.7))
  const fins = line(2, -2, 0, -3.8, 0.55).concat(line(2, 2, 0, 3.8, 0.55))
  const spots = body.filter(([c, r]) => hash(c, r, seed) > 0.72)
  return (
    `<g class="wag">` +
    tiles(union(tail, fins), fill, ink, seed + 1) +
    tiles(minus(body, spots), fill, ink, seed + 2) +
    tiles(spots, spot, ink, seed + 3) +
    `</g>`
  )
}

function lilyPad(r: number, notch: number, seed: number): string {
  const pad = ellipse(0, 0, r, r).filter(([c, rr]) => {
    const a = Math.atan2(rr, c)
    return !(Math.abs(a - notch) < 0.35 && Math.hypot(c, rr) > 0.6)
  })
  const vein = pad.filter(([c, rr]) => hash(c, rr, seed) > 0.8)
  return tiles(minus(pad, vein), '#5e9c49', '#2b531f', seed) + tiles(vein, '#77b35c', '#2f5a22', seed + 1)
}

export function koiPondSvg(): string {
  const pads = [
    [120, 140, 3.4, 0.8],
    [230, 820, 4.2, 2.4],
    [1380, 160, 4.6, -2.2],
    [1480, 520, 3.2, 1.6],
    [1290, 860, 4, 0.2],
    [470, 560, 2.6, -1],
  ] as const
  let padsSvg = ''
  pads.forEach(([x, y, r, n], i) => {
    padsSvg += moving('bob', -i * 3, x, y, lilyPad(r, n, 50 + i * 3))
  })
  let petals = ''
  for (let i = 0; i < 7; i++) {
    const x = Math.round(hash(i, 1, 61) * 1500 + 50)
    const y = Math.round(hash(i, 2, 61) * 900 + 50)
    petals += moving('bob', -i * 2, x, y, tiles([[0, 0]], '#f0b8c8', '#a3546c', 62 + i))
  }
  return (
    open(
      `.bob{animation:bob 14s ease-in-out infinite alternate}
       .koiA{animation:koiA 70s linear infinite}
       .koiB{animation:koiB 90s linear infinite}
       .wag{transform-box:fill-box;transform-origin:70% 50%;animation:wag 1.8s ease-in-out infinite alternate}
       @keyframes bob{from{transform:translate(0,0)}to{transform:translate(10px,8px)}}
       @keyframes wag{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
       @keyframes koiA{from{transform:translate(-300px,700px)}to{transform:translate(1900px,120px)}}
       @keyframes koiB{from{transform:translate(1900px,260px)}to{transform:translate(-300px,880px)}}`,
    ) +
    sky('pond', ['#5f9f8f', '#4a8c7e', '#3a786c'], '#a9d8c9', 0.25) +
    padsSvg +
    petals +
    `<g class="koiA"><g transform="rotate(-15)">${koi('#e08a3c', '#6f340c', '#f4e7d5', 70)}</g></g>` +
    `<g class="koiB" style="animation-delay:-30s"><g transform="rotate(165)">${koi('#b07a3f', '#4a2b0e', '#e3b54a', 80)}</g></g>` +
    close
  )
}

/* ── Jellyfish: deep navy water, three jellyfish pulsing slowly upward, trailing tentacles ── */
function jelly(fill: string, ink: string, rim: string, seed: number, w: number): string {
  const dome = ellipse(0, 0, w, w * 0.8).filter(([, r]) => r <= 0)
  const lip = line(-w - 0.4, 1, w + 0.4, 1, 0.5)
  const tentacles: Cell[] = []
  const cols = Math.max(3, Math.round(w * 0.8))
  for (let i = 0; i < cols; i++) {
    const x = Math.round(-w + 1 + ((2 * w - 2) * i) / Math.max(1, cols - 1))
    const len = 6 + Math.floor(hash(i, 1, seed) * 6)
    for (let r = 2; r < 2 + len; r++) {
      if (hash(i, r, seed) > 0.25) tentacles.push([x + (Math.floor(r / 3) % 2), r])
    }
  }
  return (
    `<g class="sway">${tiles(tentacles, rim, ink, seed + 1)}</g>` +
    `<g class="pulse">${tiles(dome, fill, ink, seed + 2)}${tiles(lip, rim, ink, seed + 3)}</g>`
  )
}

export function jellyfishSvg(): string {
  const specs = [
    { x: 330, fill: '#8f7fb8', ink: '#e3dbf6', rim: '#6f5f9c', w: 4, dur: 80, at: 0.2 },
    { x: 1330, fill: '#d9a487', ink: '#fbe6da', rim: '#b98066', w: 4.5, dur: 95, at: 0.6 },
    { x: 140, fill: '#e3a9c8', ink: '#fde9f3', rim: '#c886a8', w: 3.6, dur: 70, at: 0.85 },
    { x: 880, fill: '#7f95c9', ink: '#e1e9fb', rim: '#5f74aa', w: 2.6, dur: 60, at: 0.4 },
  ]
  let body = ''
  specs.forEach((s, i) => {
    body += moving('rise', -s.dur * s.at, s.x, 0, jelly(s.fill, s.ink, s.rim, 90 + i * 5, s.w), `;animation-duration:${s.dur}s`)
  })
  let motes = ''
  for (let i = 0; i < 40; i++) {
    const x = Math.round(hash(i, 1, 99) * 1600)
    const y = Math.round(hash(i, 2, 99) * 1000)
    motes += `<circle cx="${x}" cy="${y}" r="${1 + hash(i, 3, 99) * 1.4}" class="mote" style="animation-delay:-${Math.round(hash(i, 4, 99) * 8)}s"/>`
  }
  return (
    open(
      `.rise{animation:rise 80s linear infinite}
       .pulse{transform-box:fill-box;transform-origin:50% 100%;animation:pulse 3.4s ease-in-out infinite alternate}
       .sway{transform-box:fill-box;transform-origin:50% 0;animation:sway 4s ease-in-out infinite alternate}
       .mote{fill:#9fb6e8;animation:twinkle 8s ease-in-out infinite alternate}
       @keyframes rise{from{transform:translateY(1250px)}to{transform:translateY(-450px)}}
       @keyframes pulse{from{transform:scale(1,.9)}to{transform:scale(1.05,1.06)}}
       @keyframes sway{from{transform:skewX(-7deg)}to{transform:skewX(7deg)}}
       @keyframes twinkle{from{opacity:.1}to{opacity:.55}}`,
    ) +
    sky('deep', ['#0d1f40', '#14305a', '#1c3f70'], '#3d6aa8', 0.3) +
    motes +
    body +
    close
  )
}

/* ── Paper Boats: grey-teal water with folded paper boats and a few leaves drifting by ── */
function boat(fill: string, ink: string, crease: string, seed: number, s: number): string {
  const hull: Cell[] = []
  for (let r = -Math.ceil(s * 0.6); r <= Math.ceil(s * 0.6); r++) {
    for (let c = -s; c <= s; c++) if (Math.abs(c) / s + Math.abs(r) / (s * 0.55) <= 1) hull.push([c, r])
  }
  const fold = hull.filter(([c, r]) => r === 0 && Math.abs(c) < s - 1)
  return `<g class="rock">${tiles(minus(hull, fold), fill, ink, seed)}${tiles(fold, crease, ink, seed + 1)}</g>`
}

export function paperBoatsSvg(): string {
  const specs = [
    { y: 160, s: 6, light: true, dur: 120, at: 0.1, rot: -58 },
    { y: 520, s: 5, light: false, dur: 100, at: 0.45, rot: -52 },
    { y: 820, s: 7, light: true, dur: 140, at: 0.7, rot: -62 },
    { y: 380, s: 4, light: true, dur: 90, at: 0.85, rot: -55 },
    { y: 680, s: 5, light: false, dur: 110, at: 0.25, rot: -60 },
  ]
  let body = ''
  specs.forEach((b, i) => {
    const sprite = b.light ? boat('#eef2f1', '#97a6a8', '#d3dcdc', 110 + i * 3, b.s) : boat('#7e8c8f', '#47545a', '#909fa2', 110 + i * 3, b.s)
    body += moving('sail', -b.dur * b.at, 0, b.y, `<g transform="rotate(${b.rot})">${sprite}</g>`, `;animation-duration:${b.dur}s`)
  })
  let leaves = ''
  for (let i = 0; i < 6; i++) {
    const y = Math.round(hash(i, 1, 121) * 900 + 40)
    const leaf = tiles([[0, 0], [1, 1]], '#9c6a3a', '#ecd2ad', 122 + i)
    leaves += moving('sail', -i * 17, 0, y, leaf, ';animation-duration:85s')
  }
  let wakes = ''
  for (let i = 0; i < 18; i++) {
    const x = Math.round(hash(i, 1, 131) * 1550)
    const y = Math.round(hash(i, 2, 131) * 980)
    wakes += `<rect class="wake" x="${x}" y="${y}" width="5" height="3" rx="1" style="animation-delay:-${i}s"/>`
  }
  return (
    open(
      `.sail{animation:sail 120s linear infinite}
       .rock{transform-box:fill-box;transform-origin:50% 50%;animation:rock 5s ease-in-out infinite alternate}
       .wake{fill:#cfe6e6;animation:wake 9s ease-in-out infinite alternate}
       @keyframes sail{from{transform:translate(-350px,260px)}to{transform:translate(1950px,-200px)}}
       @keyframes rock{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
       @keyframes wake{from{opacity:.1}to{opacity:.5}}`,
    ) +
    sky('lake', ['#4c8a90', '#3b767d', '#2d6168'], '#9cc9cc', 0.22) +
    wakes +
    leaves +
    body +
    close
  )
}

/* ── Fireflies: a dark meadow, glowing tiles drifting and blinking, ASCII grass along the bottom ── */
export function firefliesSvg(): string {
  let flies = ''
  for (let i = 0; i < 14; i++) {
    const x = Math.round(hash(i, 1, 141) * 1500 + 50)
    const y = Math.round(hash(i, 2, 141) * 700 + 60)
    const cells: Cell[] = hash(i, 3, 141) > 0.6 ? [[0, 0], [0, 1]] : [[0, 0]]
    const fly = `<circle cx="8" cy="10" r="46" fill="url(#halo)"/>${tiles(cells, '#eef28e', '#6c6d1d', 142 + i)}`
    flies += `<g class="wander" style="animation-delay:-${Math.round(hash(i, 4, 141) * 30)}s;animation-duration:${24 + Math.round(hash(i, 5, 141) * 20)}s"><g transform="translate(${x} ${y})"><g class="blink" style="animation-delay:-${Math.round(hash(i, 6, 141) * 5)}s">${fly}</g></g></g>`
  }
  const grass: Cell[] = []
  const cols = Math.ceil(1600 / P)
  const rows = Math.ceil(1000 / P)
  for (let c = 0; c < cols; c++) {
    const h = 1 + Math.floor(hash(c, 1, 151) * 2.2 + Math.max(0, Math.sin(c * 0.37) * 2.5))
    for (let k = 0; k < h; k++) if (k === 0 || hash(c, k, 152) > 0.25) grass.push([c, rows - 1 - k])
  }
  return (
    open(
      `.wander{animation:wander 30s ease-in-out infinite alternate}
       .blink{animation:blink 5s ease-in-out infinite}
       .grass{transform-box:fill-box;transform-origin:50% 100%;animation:grass 9s ease-in-out infinite alternate}
       @keyframes wander{0%{transform:translate(0,0)}33%{transform:translate(60px,-40px)}66%{transform:translate(-30px,-80px)}100%{transform:translate(40px,20px)}}
       @keyframes blink{0%,100%{opacity:.15}40%,60%{opacity:1}}
       @keyframes grass{from{transform:skewX(-2deg)}to{transform:skewX(2deg)}}`,
      `<radialGradient id="halo"><stop offset="0" stop-color="#e9f37a" stop-opacity=".45"/><stop offset="1" stop-color="#e9f37a" stop-opacity="0"/></radialGradient>`,
    ) +
    sky('meadow', ['#0b1611', '#102019', '#16291f'], '#2c4a38', 0.35) +
    flies +
    `<g class="grass">${tiles(grass, '#142a1c', '#4fb06e', 153)}</g>` +
    close
  )
}

/* ── Moonlit: a navy night, a crescent moon, long blue cloud bands drifting, twinkling stars ── */
export function moonlitSvg(): string {
  const moon = minus(ellipse(0, 0, 5.2, 5.2), ellipse(2.4, -1.4, 4.6, 4.6))
  const specs = [
    { len: 20, x: 260, y: 170, dur: 220, at: 0.1, dark: false },
    { len: 22, x: 0, y: 270, dur: 260, at: 0.55, dark: false },
    { len: 16, x: 0, y: 600, dur: 200, at: 0.3, dark: true },
    { len: 24, x: 0, y: 760, dur: 280, at: 0.8, dark: false },
    { len: 14, x: 0, y: 440, dur: 180, at: 0.92, dark: true },
  ]
  let bands = ''
  specs.forEach((b, i) => {
    const sprite = b.dark ? tiles(band(b.len, 160 + i), '#2f3b78', '#8a98d6', 161 + i) : tiles(band(b.len, 160 + i), '#4659ab', '#b8c4f3', 161 + i)
    bands += moving('float', -b.dur * b.at, 0, b.y, sprite, `;animation-duration:${b.dur}s`)
  })
  let stars = ''
  for (let i = 0; i < 70; i++) {
    const x = Math.round(hash(i, 1, 171) * 1600)
    const y = Math.round(hash(i, 2, 171) * 900)
    stars += `<circle class="star" cx="${x}" cy="${y}" r="${0.8 + hash(i, 3, 171) * 1.3}" style="animation-delay:-${Math.round(hash(i, 4, 171) * 6)}s"/>`
  }
  return (
    open(
      `.float{animation:float 220s linear infinite}
       .star{fill:#e6ecff;animation:twinkle 6s ease-in-out infinite alternate}
       .moon{animation:moon 12s ease-in-out infinite alternate}
       @keyframes float{from{transform:translateX(-500px)}to{transform:translateX(1900px)}}
       @keyframes twinkle{from{opacity:.15}to{opacity:.9}}
       @keyframes moon{from{opacity:.85}to{opacity:1}}`,
      `<radialGradient id="moonglow"><stop offset="0" stop-color="#cfc7a6" stop-opacity=".18"/><stop offset="1" stop-color="#cfc7a6" stop-opacity="0"/></radialGradient>`,
    ) +
    sky('night', ['#0b1535', '#132150', '#22357a'], '#3a4f9a', 0.3) +
    stars +
    `<circle cx="1180" cy="200" r="230" fill="url(#moonglow)"/>` +
    `<g class="moon" transform="translate(1180 200)">${tiles(moon, '#b9b193', '#4f4b3c', 170)}</g>` +
    bands +
    close
  )
}
