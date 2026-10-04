# 变更记录

本仓库是 [`Tkingxiao/I-am-Yuike`](https://github.com/Tkingxiao/I-am-Yuike) 的 fork，记录从这里开始的改动。

## 1.0.7 — 同步上游对 0.2.1-alpha.1 的显式支持

### 变更

- **`engines.dsh` / `dsh.engines.dsh` / `peerDependencies["@deepseek-ai/dsh-client-locale"]`
  同步上游 v1.0.7 的写法**：三个字段都显式列出 `0.2.1-alpha.1`，即

  ```
  >=0.1.6-alpha.1 <0.2.0-alpha.0 || >=0.2.0-rc.1 <0.3.0-0
  ```

  上游 v1.0.7 用的是逐版本白名单（`0.1.6-alpha.1 || 0.1.6-alpha.2 || 0.1.7-alpha.1 || … ||
  0.2.1-alpha.1 || >=0.1.7-alpha.1`）。这里**没有照抄那个白名单**，而是用等价的区间形式，
  因为它同时满足三个要求、且不会漏掉中间版本：① 覆盖 0.2.1-alpha.1；
  ② 覆盖 0.2.0-rc.2（当前 Desktop 宿主打包的核心仍是 0.2.0-rc.2，profile 无法单独升级核心，
  只写 0.2.1-alpha.1 会被宿主整体拒绝）；③ 保留本 fork 原有的 0.1.6 / 0.1.7 支持
  （本插件在 0.1.6 宿主上走的是「把模板铺到 `~/.dsh/.agent-presets/yuike/`」那条路径）。

- **新增 `dsh.compatibility`**（上游 v1.0.7 没有这个字段）：`dsh` 区间同上，
  `dshReleases` 把 `0.1.6-alpha.1` / `0.1.6-alpha.2` / `0.1.7-rc.1` / `0.1.7-rc.2` /
  `0.2.0-rc.1` / `0.2.0-rc.2` / `0.2.1-alpha.1` 都标 `compatible`。

> 版本号保持不变（1.0.6）：本 fork 尚未发布 1.0.6，本次改动一并进入该版本，
> 避免在 npm 上留下一个从未发布、却已存在同号 tag 的空档。

### 闸门说明（实测）

DSH 的安装闸门只看 `peerDependencies`：`dsh-app-boot/lib/index.js` 的
`evaluatePluginCompatibility()` 只遍历名字为 `@deepseek-ai/dsh` 或以 `@deepseek-ai/dsh-`
开头的条目。本插件的 `@deepseek-ai/dsh-client-locale` 就在这个集合里 —— 这正是
1.0.5 在 0.2.0-rc.2 上被直接拒绝的原因（见下一条），所以这个字段的区间是**真正的闸门**，
不是声明层装饰。

### 验证

- 0.2.1-alpha.1 沙箱：`plugin add` 通过；boot 成功保活。
- 0.2.0-rc.2 沙箱：`plugin add` 通过；boot 成功保活。
- 浏览器半区：本插件的 `lib/client.js` 是 412 字节的**合法空模块占位**
  （`exports.name = 'i-am-yuike'`、`exports.inject = []`、`exports.apply = function () {}`，
  源文件注释写明「本插件只负责在 node 半区铺设人格预设，不需要任何浏览器设置面板」）。
  因此它不会出现在服务端挂载的客户端模块清单里 —— 这是设计如此，不是挂载失败。

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
