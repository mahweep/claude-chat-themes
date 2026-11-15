import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { THEMES, sceneOf, themeOf, type Theme } from './themes'

const PLUGIN = 'video-themes'
const COMMAND = 'chat-theme'
const SAVED = 'theme'

const isPickerOpen = atom({ plugin: 'video-themes', key: 'isPickerOpen' } as const, false)
const current = atom({ plugin: 'video-themes', key: 'current' } as const, null as string | null)

async function apply($: EngineInterface, theme: Theme): Promise<string> {
  const result = await $.theme.set({
    backdrop: { scene: theme.id, glass: theme.glass },
    overrideColorScheme: theme.window,
  })
  await update($, current, () => theme.id)
  await $.store.set(SAVED, theme.id)
  return result.isDrawn ? `${theme.title} theme on.` : `${theme.title} chosen, but this window did not draw it: ${result.reason}`
}

async function turnOff($: EngineInterface): Promise<string> {
  await $.theme.clear()
  await update($, current, () => null)
  await $.store.delete(SAVED)
  return 'Theme off.'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await $.command.register({
      name: COMMAND,
      description: 'Animated ASCII-tile themes: no name opens the picker; a name applies it; "list" or "off".',
      argumentHint: '[name | list | off]',
    })
    const saved = await $.store.get(SAVED)
    const theme = typeof saved === 'string' ? themeOf(saved) : undefined
    if (theme !== undefined) {
      await $.theme.set({ backdrop: { scene: theme.id, glass: theme.glass }, overrideColorScheme: theme.window })
      await update($, current, () => theme.id)
    }
    return result
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === '') {
      await update($, isPickerOpen, () => true)
      return { text: 'Pick a theme above the text box.' }
    }
    if (arg === 'list') {
      return { text: `Themes: ${THEMES.map(t => t.id).join(', ')}. Apply one with /${COMMAND} <name>, or /${COMMAND} off.` }
    }
    if (arg === 'off') {
      return { text: await turnOff($) }
    }
    const theme = themeOf(arg)
    if (theme === undefined) {
      return { text: `No theme named "${e.args.trim()}". Try /${COMMAND} list.` }
    }
    return { text: await apply($, theme) }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== PLUGIN || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const theme = themeOf(e.props.scene)
    if (theme === undefined) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg isInteractive alt={`${theme.title} animated background`} source={sceneOf(theme)} />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isPickerOpen))) {
      return next(e)
    }
    const chosen = await read($, current)
    const { Box, Text, Button } = $.ui.resolve(e)
    const close = () => update($, isPickerOpen, () => false)

    // Plain text and buttons only: the band above the prompt draws nothing for a row it will not take.
    return (
      <Box flexDirection="column">
        <Text>
          <Text weight="semibold">Chat themes</Text>
          <Text dimColor> · pick one</Text>
        </Text>
        <Box flexWrap="wrap" gap={1}>
          {THEMES.map(theme => (
            <Button
              key={`pick-${theme.id}`}
              label={chosen === theme.id ? `${theme.icon} ${theme.title} ✓` : `${theme.icon} ${theme.title}`}
              variant={chosen === theme.id ? 'primary' : 'secondary'}
              onPress={() => void apply($, theme)}
            />
          ))}
          <Button key="off" label="Off" onPress={() => void turnOff($)} />
          <Button key="close" label="Close" role="dismiss" onPress={close} />
        </Box>
      </Box>
    )
  })
}
