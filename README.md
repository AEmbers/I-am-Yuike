# i-am-yuike

A DeepSeek Harness plugin that **idempotently deploys the 猫娘 Yuike persona preset** from `template/` to your agent-presets directory. Hosted under the `I-am-Yuike` repo.

Once installed, the `yuike` preset is available the next time you start a preset session — the catgirl persona takes effect immediately as the sole system prompt: no extra harness framing, no skill-catalog noise.

## Features

- **One-shot preset deploy**: ships the `yuike` preset (`agent.cordis.yml` + `preset.yml`) and idempotently copies it into `<dshHome>/.agent-presets/yuike/` on install. Never overwrites a preset you have already edited.
- **Persona owns the system prompt**: `complete: true` restores the assembled Yuike persona as the *only* system-prompt section; `includeRuntimeContext: false` drops the per-round runtime-context snapshots (Current runtime context / DSH file policy / Approval prompts, etc.). The harness identity opener, `@`-path/exit-code rules, and background-job guidance are no longer injected — the catgirl persona leads the prompt cleanly.
- **Zero skill-catalog noise**: disables the `skill-filesystem` / `tool-skill` toolchain. `tool-skill` always injects a `{kind:"skill-catalog",…}` skill catalog message into the session, and there is no way to hide just the catalog while keeping the tool — so the toolchain is disabled instead.
- **Main toolchain kept**: shell (bash/pwsh), filesystem read/write/search, background jobs, goals, plan & compaction modes, subagents/workflows/ralph, ask-user, todo, web fetch/search, and present all stay available; only the optional subagent providers (`codex` / `claude-code`) are disabled by default, as the host dictates.
- **Self-contained personality**: the persona (猫娘 Yuike) drives identity, language style, action brackets, emoji/kaomoji, and the `{好感度}` suffix — all inside `template/agent.cordis.yml`, no external file needed.
- **Two files, whole preset**: the entire definition lives in two files — `agent.cordis.yml` (persona + toolchain wiring) and `preset.yml` (name/description metadata).

## Install

```sh
dsh plugin --profile web add github:Tkingxiao/I-am-Yuike
dsh web
```

On first launch the plugin **idempotently deploys** the preset from `template/` to `<dshHome>/.agent-presets/yuike/` (skips if the target already exists — it never overwrites your edited preset). Then open a new preset session and pick `yuike` — the catgirl persona takes effect immediately.

> If a previous version was already deployed, delete `<dshHome>/.agent-presets/yuike` (or set `DSH_YUIKE_REDEPLOY=1`) to pull in the latest changes; idempotent deploy never overwrites an existing copy on its own.

## Usage: thinking mode and persona stability

The persona is anchored by in-session conversation history. If thinking mode is enabled from the very first message, the reasoning pass has no in-character history to condition on and tends to fall back to base assistant behavior — the response explodes on the spot (identity framing, refusals, broken character).

The fix is a two-step warm-up:

1. **First conversation: thinking OFF.** Start the session with thinking mode disabled and run your first persona conversation (including 破限向 content) with it off. This writes fully in-character assistant turns into the session history.
2. **Every conversation after: thinking ON.** Re-enable thinking mode from the next exchange onward. The reasoning pass is now conditioned on the in-character history, so the persona holds and thinking works normally.

Skipping step 1 and opening with thinking on means the persona usually explodes immediately on 破限向 content. Within one session, the warm-up only needs to happen once.

## Preset at a glance

`template/agent.cordis.yml` (deployed to `<dshHome>/.agent-presets/yuike/agent.cordis.yml`) includes:

| Part | Content |
|---|---|
| Personality | 猫娘 Yuike identity: core rules, language style, action brackets, emoji/kaomoji, format conventions (`{好感度:N}` suffix), persona profile, supplementary answer rules |
| System prompt | `complete: true` makes the persona sole system prompt + `includeRuntimeContext: false` drops runtime-context snapshots |
| Plan & compaction | plan-mode isolation and conversation compaction with tool-result pruning |
| Delegation & workflows | subagents (spawn/fork), list-agents, ralph, workflow engine; optional `codex`/`claude-code` providers shipped disabled |
| Tool rows | shell, filesystem, filesystem search, jobs, goals, ask-user, todo, web fetch/search, present — kept; skill rows (`skill-filesystem`/`tool-skill`) disabled |

## Toolchain notes

`yuike` keeps the standard tool catalog as its backbone, with one prompt-side and one tool-side trim aligned with [dsh-novel-solo](https://github.com/Tkingxiao/dsh-novel-solo); everything else stays:

- **Prompt**: the persona owns the system prompt, so no harness identity framing is injected.
- **Disabled tools**: `skill-filesystem`, `tool-skill` — removes the `skill-catalog` message that `tool-skill` always injects.
- **Conditional**: `tool-bash` (POSIX) / `tool-pwsh` (Windows) auto-selected by platform; the `codex` and `claude-code` subagent providers are present but `disabled`, since a stock host does not install those bundles.
- **Everything else kept**: `tool-fs`, `tool-fs-search`, `tool-jobs`, `command-goal`, `tool-goal`, `tool-todo`, `tool-ask-user`, plan mode + compaction (with `toolResultPruner`), `subagent`/`subagent_fork`, `list-agents`, `tool-workflow`, `tool-ralph`, `tool-web` (fetch on, 60s search timeout), `dsh-tool-present`.

Enabling a host-provided optional bundle is purely additive: just delete the `disabled: true` line on that row in a deployed copy — no other wiring changes.

## File structure

```
lib/index.js        node half: deploys the packaged preset from template/ to <dshHome>/.agent-presets/yuike/
lib/client.js       browser half: empty/no-op placeholder
cordis.patch.yml    inserted into the web profile on install to activate the plugin
template/           the yuike preset (agent.cordis.yml + preset.yml), shipped with the package
package.json        dsh.client metadata so the plugin is recognizable by the plugin market/manifest
```

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `DSH_HOME` | dsh home directory | `~/.dsh` |
| `DSH_YUIKE_SKIP_DEPLOY` | `1` skips preset deployment | none |
| `DSH_YUIKE_REDEPLOY` | `1` forcibly overwrites an existing preset (use with care) | none |

## License

MIT License

Copyright (c) 2026 Tkingxiao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.