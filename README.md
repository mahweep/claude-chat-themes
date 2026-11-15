# Claude chat themes

A mod for the Code tab of the Claude desktop app.

## video-themes

Eight animated wallpapers drawn from little character tiles on a faint grid: **Claude Code**, **Cloud Drift**, **Honu Lagoon**, **Koi Pond**, **Jellyfish**, **Paper Boats**, **Fireflies** and **Moonlit**.

- `/chat-theme` opens a picker above the text box
- `/chat-theme moonlit` applies a theme by name
- `/chat-theme list` names them all, `/chat-theme off` turns the theme off

Your pick is remembered for new sessions. Motion stops when your system asks for reduced motion.

## Install

In a Claude Code terminal session:

```
/plugin install video-themes --marketplace mahweep/claude-chat-themes
```

Answer `y` to add the marketplace, then press Enter to install for your user.

From a shell:

```
claude plugin install video-themes --marketplace mahweep/claude-chat-themes
```

In the desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `mahweep/claude-chat-themes`, then **Add plugin**.

Themes need a version of the desktop app that draws backgrounds behind the chat. If you also have Anthropic's `theme-examples` plugin, run `/custom-theme off` so the two don't compete.
