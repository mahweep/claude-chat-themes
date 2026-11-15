import type { ThemeBackdropGlass } from 'claude-code'

import {
  claudeCodeSvg,
  cloudDriftSvg,
  firefliesSvg,
  honuLagoonSvg,
  jellyfishSvg,
  koiPondSvg,
  moonlitSvg,
  paperBoatsSvg,
} from './scenes'

export type Theme = {
  id: string
  /** Shown on the picker's button. */
  icon: string
  title: string
  window: 'light' | 'dark'
  glass: ThemeBackdropGlass
  scene: () => string
  /** Colors for the picker's little preview: the sky top and bottom, then the tiles. */
  swatch: readonly [string, string, ...string[]]
}

// Light glass, so the tiles stay crisp behind the chat as they do in the video.
export const THEMES: readonly Theme[] = [
  { id: 'claude-code', icon: '✻', title: 'Claude Code', window: 'dark', glass: { blur: 0, tint: '#1a1412', opacity: 0.55 }, scene: claudeCodeSvg, swatch: ['#2a201b', '#14100e', '#c4694a', '#e7a688'] },
  { id: 'cloud-drift', icon: '☁️', title: 'Cloud Drift', window: 'light', glass: { blur: 0, tint: '#eaf4fc', opacity: 0.55 }, scene: cloudDriftSvg, swatch: ['#a9d2f3', '#e3f0fb', '#fcfdff', '#fcfdff'] },
  { id: 'honu-lagoon', icon: '🐢', title: 'Honu Lagoon', window: 'dark', glass: { blur: 0, tint: '#1f6474', opacity: 0.55 }, scene: honuLagoonSvg, swatch: ['#79c4cf', '#2f8597', '#b8435a', '#d6b23e'] },
  { id: 'koi-pond', icon: '🐟', title: 'Koi Pond', window: 'dark', glass: { blur: 0, tint: '#2f665b', opacity: 0.55 }, scene: koiPondSvg, swatch: ['#5f9f8f', '#3a786c', '#e08a3c', '#5e9c49'] },
  { id: 'jellyfish', icon: '🪼', title: 'Jellyfish', window: 'dark', glass: { blur: 0, tint: '#0d1f40', opacity: 0.55 }, scene: jellyfishSvg, swatch: ['#0d1f40', '#1c3f70', '#8f7fb8', '#d9a487'] },
  { id: 'paper-boats', icon: '⛵', title: 'Paper Boats', window: 'dark', glass: { blur: 0, tint: '#2d6168', opacity: 0.55 }, scene: paperBoatsSvg, swatch: ['#4c8a90', '#2d6168', '#eef2f1', '#7e8c8f'] },
  { id: 'fireflies', icon: '✨', title: 'Fireflies', window: 'dark', glass: { blur: 0, tint: '#0b1611', opacity: 0.55 }, scene: firefliesSvg, swatch: ['#0b1611', '#16291f', '#eef28e', '#4fb06e'] },
  { id: 'moonlit', icon: '🌙', title: 'Moonlit', window: 'dark', glass: { blur: 0, tint: '#0b1535', opacity: 0.55 }, scene: moonlitSvg, swatch: ['#0b1535', '#22357a', '#b9b193', '#4659ab'] },
]

export function themeOf(name: string): Theme | undefined {
  const key = name.trim().toLowerCase().replace(/\s+/g, '-')
  return THEMES.find(t => t.id === key || t.title.toLowerCase().replace(/\s+/g, '-') === key)
}

const built = new Map<string, string>()

/** A soft shadow down the middle of the window, where the conversation sits, over the scene. */
function middleShadow(theme: Theme): string {
  const color = theme.window === 'light' ? '#3b5a78' : '#000000'
  const peak = theme.window === 'light' ? 0.3 : 0.7
  return (
    `<defs><linearGradient id="midshade" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0.04" stop-color="${color}" stop-opacity="0"/>` +
    `<stop offset="0.25" stop-color="${color}" stop-opacity="${peak * 0.85}"/>` +
    `<stop offset="0.5" stop-color="${color}" stop-opacity="${peak}"/>` +
    `<stop offset="0.75" stop-color="${color}" stop-opacity="${peak * 0.85}"/>` +
    `<stop offset="0.96" stop-color="${color}" stop-opacity="0"/>` +
    `</linearGradient></defs><rect width="1600" height="1000" fill="url(#midshade)"/>`
  )
}

/** The scene's SVG with the middle shadow over it, built once per load. */
export function sceneOf(theme: Theme): string {
  let svg = built.get(theme.id)
  if (svg === undefined) {
    const scene = theme.scene()
    svg = scene.slice(0, scene.lastIndexOf('</svg>')) + middleShadow(theme) + '</svg>'
    built.set(theme.id, svg)
  }
  return svg
}

/** A small preview card for the picker: the sky and a few tiles in the theme's colors. */
export function thumbOf(theme: Theme): string {
  const [top, bottom, ...inks] = theme.swatch
  let squares = ''
  for (let i = 0; i < 9; i++) {
    const x = 14 + ((i * 37) % 130)
    const y = 12 + ((i * 23) % 62)
    squares += `<rect x="${x}" y="${y}" width="9" height="9" rx="1.5" fill="${inks[i % inks.length]}"/>`
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" width="160" height="90">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
    `<rect width="160" height="90" rx="8" fill="url(#g)"/>${squares}</svg>`
  )
}
