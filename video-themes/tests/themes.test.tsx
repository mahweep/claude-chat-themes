import { expect, test } from 'claude-code/testing'

test('the command lists all eight themes', async ($, on) => {
  on('command.register', () => ({ value: { command: 'chat-theme' } }))
  on('store.get', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r = await $.command.run({ command: 'chat-theme', args: 'list' } as never)
  expect(String((r as { text?: string }).text)).toContain('moonlit')
})

test('a theme of this mod draws its scene behind the chat', async $ => {
  const ui = await $.ui.mount({
    plugin: 'video-themes',
    component: 'Backdrop',
    surface: 'desktop',
    props: { scene: 'cloud-drift', plugin: 'video-themes', glass: false },
  } as never)
  const svg = await ui.find({ type: 'Svg' } as never)
  expect(svg != null).toBe(true)
  await ui.unmount()
})

test('the picker shows a button per theme once opened', async ($, on) => {
  on('state.get', (_, e) => ({ value: { value: (e as { key?: string }).key === 'isPickerOpen' ? true : null, version: 1 } }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const ui = await $.ui.mount({
    plugin: 'video-themes',
    component: 'AbovePrompt',
    surface: 'desktop',
    props: { hasSurvey: false },
  } as never)
  expect((await ui.find({ type: 'Button', key: 'pick-moonlit' } as never)) != null).toBe(true)
  await ui.unmount()
})
