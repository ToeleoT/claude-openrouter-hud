---
description: Configure claude-openrouter-hud as your Claude Code statusline
allowed-tools: Bash, Read, Edit
---

Configure `claude-openrouter-hud` as the active Claude Code `statusLine`.

## Step 1: Detect Plugin Install Path

On macOS/Linux or bash-compatible shells:

```bash
ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/claude-openrouter-hud/claude-openrouter-hud/*/ 2>/dev/null | awk -F/ '{ print $(NF-1) "\t" $(0) }' | sort -t. -k1,1n -k2,2n -k3,3n -k4,4n | tail -1 | cut -f2-
```

If this returns nothing, stop and ask the user to install the plugin first.

## Step 2: Detect Runtime

Prefer `bun`, otherwise use `node`.

```bash
command -v bun 2>/dev/null || command -v node 2>/dev/null
```

If neither exists, stop and tell the user they need Bun or Node in the current shell.

## Step 3: Refuse To Overwrite Existing statusLine

Read `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json` if it exists.

- If `statusLine` is already present, stop.
- Do not overwrite it automatically.
- Tell the user the plugin is ready, but they need to manually merge the generated command into their settings.

## Step 4: Generate Command

Use the latest installed plugin version dynamically.

If runtime is `bun`:

```bash
bash -c 'plugin_dir=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/claude-openrouter-hud/claude-openrouter-hud/*/ 2>/dev/null | awk -F/ '"'"'{ print $(NF-1) "\t" $(0) }'"'"' | sort -t. -k1,1n -k2,2n -k3,3n -k4,4n | tail -1 | cut -f2-); exec bun --env-file /dev/null "${plugin_dir}src/index.ts"'
```

If runtime is `node`:

```bash
bash -c 'plugin_dir=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/claude-openrouter-hud/claude-openrouter-hud/*/ 2>/dev/null | awk -F/ '"'"'{ print $(NF-1) "\t" $(0) }'"'"' | sort -t. -k1,1n -k2,2n -k3,3n -k4,4n | tail -1 | cut -f2-); exec node "${plugin_dir}dist/index.js"'
```

## Step 5: Write Config Only If statusLine Is Missing

Merge this into `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "GENERATED_COMMAND"
  }
}
```

Preserve existing JSON. Do not rewrite unrelated settings.

## Step 6: Restart Claude Code

After writing config successfully, tell the user to fully quit Claude Code and launch it again.
