---
description: Remove claude-openrouter-hud statusline config from Claude Code settings
allowed-tools: Bash, Read, Edit
---

Remove the `claude-openrouter-hud` `statusLine` entry from Claude Code settings, but only if the current `statusLine.command` still points to this plugin.

## Step 1: Read Settings

Read `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json`.

- If the file does not exist, stop and tell the user there is nothing to clean up.
- If the file is invalid JSON, stop and report that manual cleanup is required.

## Step 2: Check Whether statusLine Belongs To This Plugin

Inspect `statusLine.command`.

Treat the setting as belonging to this plugin only if the command contains:

- `claude-openrouter-hud`

If `statusLine` is missing, stop and tell the user there is nothing to remove.

If `statusLine.command` exists but does not reference `claude-openrouter-hud`, stop and tell the user it appears to belong to another statusline, so no changes were made.

## Step 3: Remove Only statusLine

Delete the top-level `statusLine` key from settings JSON.

- Preserve all other keys and formatting as much as practical.
- Do not modify `enabledPlugins`, marketplace settings, or unrelated configuration.

## Step 4: Confirm Next Commands

After removing `statusLine`, tell the user to run:

```text
/plugin uninstall claude-openrouter-hud -s user
/plugin marketplace remove claude-openrouter-hud
```

Also tell the user to restart Claude Code after uninstalling if they want to verify the HUD is gone.
