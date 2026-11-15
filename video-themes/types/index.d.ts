export type ThemeId = string

declare module 'claude-code' {
  interface PluginState {
    'video-themes': { isPickerOpen: boolean; current: ThemeId | null }
  }
}
