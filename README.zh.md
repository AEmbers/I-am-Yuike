# i-am-yuike

一个 DeepSeek Harness 插件，从 `template/` 把**「猫娘 Yuike」人格预设**幂等铺设到你的 agent-presets 目录。仓库名为 `I-am-Yuike`。

安装后，下一次启动预设会话即可选择 `yuike` 预设——猫娘人格即刻生效，并独占系统提示词：既没有 harness 多余的系统说明，也没有技能目录噪音。

## 特性

- **一次即铺设**：随包携带 `yuike` 预设（`agent.cordis.yml` + `preset.yml`），安装时幂等复制到 `<dshHome>/.agent-presets/yuike/`，绝不覆盖你已编辑过的预设。
- **人格独占 System Prompt**：persona 配了 `complete: true`，装配完成后成为会话里**唯一**的系统提示词段；`includeRuntimeContext: false` 压掉每轮动态上下文快照（Current runtime context / DSH file policy / Approval prompts 等）。harness 身份开场、`@`路径与退出码规则、后台任务说明都不再注入，猫娘人格稳稳独占开头。
- **零技能目录噪音**：禁用 `skill-filesystem` / `tool-skill` 工具链。`tool-skill` 会强制向会话注入 `{kind:"skill-catalog",…}` 技能目录消息，且无法只隐藏目录、只能禁用整条工具链；关闭后该消息不再出现。
- **主干工具链保留**：shell（bash/pwsh）、文件系统读改写/检索、后台任务、Goals、计划与压缩、子代理/工作流/ralph、ask-user、todo、web 抓取/搜索、present 一律可用；仅可选子代理 provider（`codex`/`claude-code`）默认禁用（依宿主而定）。
- **自成一体**：Yuike 的身份、语言风格、动作括号、表情/颜文字、`{好感度}` 后缀等全部内嵌在 `template/agent.cordis.yml`，不依赖任何外部文件。
- **两份文件即整套预设**：完整定义收敛在两个文件——`agent.cordis.yml`（人格 + 工具链接线）与 `preset.yml`（名称/描述元数据）。

## 安装

```sh
dsh plugin --profile web add github:Tkingxiao/I-am-Yuike
dsh web
```

首次启动时，插件会把 `template/` 里的预设**幂等铺设**到 `<dshHome>/.agent-presets/yuike/`（目标已存在则跳过，绝不覆盖你已编辑的预设）。然后新建一个预设会话并选择 `yuike`——猫娘人格即刻生效。

> 若之前已部署过旧版预设，需删除 `<dshHome>/.agent-presets/yuike`（或设 `DSH_YUIKE_REDEPLOY=1`）以拉取最新改动；幂等铺设不会自动覆盖已存在的副本。

## 使用：思考模式与人格稳定性

人格锚定依赖会话内的对话历史。如果第一条消息就开着思考模式，推理过程没有任何「已在角色中」的历史可供依赖，模型容易回退到底层助手行为——回复当场爆炸（身份说教、拒绝、出戏）。

解决办法是两步预热：

1. **第一次对话：关思考。** 开启会话后先关闭思考模式，用它完成第一次对话（包括破限向内容）。这一步会把完全在角色中的助手回复写进会话历史。
2. **之后的对话：开思考。** 从下一轮起再打开思考模式。此时推理过程有了在角色历史作为锚点，人格稳定，思考也能正常工作。

跳过第一步、一上来就开思考，破限向内容通常当场爆炸。同一个会话内预热一次即可。

## 预设内容速览

`template/agent.cordis.yml`（部署到 `<dshHome>/.agent-presets/yuike/agent.cordis.yml`）内置：

| 部分 | 内容 |
|---|---|
| 人格 | 猫娘 Yuike 身份：核心规则、语言风格、动作括号、表情/颜文字、格式约定（`{好感度:N}` 结尾）、人物设定、补充应答规则 |
| System Prompt | `complete: true` 让人格独占系统提示词 + `includeRuntimeContext: false` 压掉运行时上下文快照 |
| 计划与压缩 | plan-mode 隔离、会话压缩与工具结果裁剪 |
| 委派与工作流 | 子代理（spawn/fork）、list-agents、ralph、工作流引擎；可选 `codex`/`claude-code` provider 随包附带但默认禁用 |
| 工具行 | shell、文件系统、文件检索、后台任务、Goals、ask-user、todo、web 抓取/搜索、present——保留；skill 相关（`skill-filesystem`/`tool-skill`）禁用 |

## 工具链说明

`yuike` 以标准工具目录为主干，提示词侧与工具侧各做一处与 [dsh-novel-solo](https://github.com/Tkingxiao/dsh-novel-solo) 一致的裁剪，其余全部保留：

- **提示词**：persona 独占 System Prompt，去除 harness 身份开场等内容注入。
- **已禁用工具**：`skill-filesystem`、`tool-skill`——消除 `tool-skill` 强制注入的 `skill-catalog` 技能目录消息。
- **有条件启用**：`tool-bash`（POSIX）/ `tool-pwsh`（Windows）按平台自动取舍；`codex`/`claude-code` 子代理 provider 默认 `disabled`（宿主未安装对应 Bundle）。
- **其余保留**：`tool-fs`、`tool-fs-search`、`tool-jobs`、`command-goal`、`tool-goal`、`tool-todo`、`tool-ask-user`、plan mode + compaction（含 `toolResultPruner`）、`subagent`/`subagent_fork`、`list-agents`、`tool-workflow`、`tool-ralph`、`tool-web`（`fetch: true`，搜索超时 60s）、`dsh-tool-present`。

若要启用宿主侧提供的某个可选 Bundle，只需在铺设出的副本上删除对应行的 `disabled: true`，无需改动其它接线。

## 文件结构

```
lib/index.js        node 半区：把随包预设从 template/ 铺设到 <dshHome>/.agent-presets/yuike/
lib/client.js       浏览器半区：空/无操作占位
cordis.patch.yml    安装进 web profile 时插入本插件以完成激活
template/           yuike 预设（agent.cordis.yml + preset.yml），随包分发
package.json        dsh.client 元数据，使插件可被插件市场/清单识别
```

## 环境变量

| 变量 | 作用 | 默认 |
|---|---|---|
| `DSH_HOME` | dsh 根目录 | `~/.dsh` |
| `DSH_YUIKE_SKIP_DEPLOY` | `1` 时跳过预设铺设 | 无 |
| `DSH_YUIKE_REDEPLOY` | `1` 时强制覆盖已存在的预设（慎用） | 无 |

## 许可证

MIT License

Copyright (c) 2026 Tkingxiao

特此免费授予任何获得本软件及相关文档文件（以下简称「软件」）副本的人，无限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本，并允许向其提供本软件的人这样做，前提是满足以下条件：

上述版权声明和本许可声明应包含在本软件的所有副本或实质性部分中。

本软件按「原样」提供，不提供任何明示或隐含的担保，包括但不限于适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因本软件或本软件的使用或其他交易而产生、或与之相关的任何索赔、损害或其他责任负责，无论是基于合同、侵权或其他方式。