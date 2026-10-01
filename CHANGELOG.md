# 变更记录

本仓库是 [`Tkingxiao/I-am-Yuike`](https://github.com/Tkingxiao/I-am-Yuike) 的 fork，记录从这里开始的改动。

## 1.0.6 — 适配 dsh 0.2.0-rc.2

**症状**：在 dsh `0.2.0-rc.2` 上插件连装都装不上，安装器直接拒绝：

```
dsh: installation rejected: Plugin i-am-yuike@1.0.5 is incompatible with dsh 0.2.0-rc.2:
peerDependencies {"@deepseek-ai/dsh-client-locale":"0.1.6-alpha.1 || … || 0.2.0-rc.1 || >=0.1.7-alpha.1 <0.2.0-alpha.0"}
dsh: nothing was installed.
```

**根因**：宿主自 `0.1.7-rc.1` 起在 profile 组装阶段（`@deepseek-ai/dsh-app-boot` 的
`evaluatePluginCompatibility`）拿 `peerDependencies` 里每个 `@deepseek-ai/dsh*` 范围去比对
运行版本；不匹配就"拒绝安装 + 禁用整行"。旧范围的上限 `<0.2.0-alpha.0` 在 SemVer 预发布
序里小于 `0.2.0-rc.2`，且显式点名的只有 `0.2.0-rc.1`，于是所有 `0.2.0-rc.2` 宿主都判不兼容。

**改动**：

- `peerDependencies["@deepseek-ai/dsh-client-locale"]` 与 `engines.dsh` 换成
  `>=0.1.6-alpha.1 <0.2.0-alpha.0 || >=0.2.0-rc.1 <0.3.0-0`——
  前一半放行整个 0.1.6 / 0.1.7 线，后一半放行整个 0.2.0 线（不含 0.3.0）。
- `package.json` 补 `dsh.manifestVersion: 1` 与 `dsh.engines.dsh`，并补 `engines.node`。
- 删除 `scripts.typecheck`：它指向本仓库从未存在的 `tsconfig.json`，本包也没有 TS 源码。
- `repository` / `homepage` / `bugs` 指向本 fork。
- 两份同源预设定义（`cordis.patch.yml`、`template/agent.cordis.yml`）与两份 README
  同步更新说明；**预设本体一字未动**——经逐行核对，它与 0.2.0-rc.2 出厂的
  `@deepseek-ai/dsh-web-app/presets/standard.patch.yml` 行集完全一致，没有 API 漂移。

**核对方式**：读 `app.asar` 里 0.2.0-rc.2 的宿主源码确认门控逻辑与字段；用独立
`DSH_HOME` 建测试 profile，`dsh plugin add` 实装成功、`dsh web --port 0` 实启无报错；
并用脚本确认预设引用的 27 个插件包在该版本全部存在。

**未覆盖**：没有跑带真实模型的会话，因此"某宿主上预设挂载后的人格表现"未做端到端验证；
0.1.6 / 0.1.7 两线上的行为也未重新实跑（本次只改了版本范围，未动它们的路径逻辑）。
