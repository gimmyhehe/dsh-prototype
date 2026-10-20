# dsh-prototype

DeepSeek Harness Web 的「对话生成原型」插件脚手架：在输入框工具条上加一个 **原型创作** 开关，开启后每一轮对话都会触发一次原型生成，并在右侧 Sidebar 里以标签页形式预览生成出来的 HTML 页面，同时可以切换设计主题、主题色、圆角与预览视口。

> 这是一个 **脚手架（prototype scaffold）**，目标是跑通「开关 → 提交对话 → 右侧预览」这条完整链路。当前 `renderPrototypeHtml` 是客户端确定性模板，**还没有接入模型**（见 [当前限制](#当前限制)）。

## 功能

- **输入框工具条开关**：`conversation.input.left` 插槽里的「原型创作」按钮，带当前主题色圆点指示。
- **对话驱动生成**：监听 session 的 `pendingSubmissions`，模式开启时每有新 prompt 就生成一次；未输入内容时使用内置示例 prompt。
- **右侧 Sidebar 预览标签页**：`sidebar.right.pane.tab` + `ctx.sidebarRightTabs` 注册一个可停靠的 `原型预览` 标签页（`keepMounted`，切换标签不丢状态）。
- **设计主题**：5 套主题（极简白 / 深空黑 / 暖砂 / 赛博 / 墨白），8 种主题色，3 档圆角；切换后自动重渲染已有预览。
- **视口预设**：桌面 / 平板 / 手机 三档 iframe 宽度。
- **工具栏动作**：重新生成、复制 HTML、下载 HTML、在新标签页打开。
- **可恢复状态**：开关、主题、主题色、圆角、视口写入 `localStorage`（key: `dsh-prototype:settings:v1`）；生成的文档只留在内存里，刷新即回到干净画布。

## 目录结构

```
index.js                  # 宿主侧入口（当前为空实现，Web profile 加载插件时必需）
cordis.patch.yml          # bundle patch：把插件插入 Web profile
build.mjs                 # 用 esbuild 把 src/client 打成 lib/client.js
src/client/
  index.tsx               # 浏览器侧入口：注册插槽贡献
  PrototypeBar.tsx        # 输入框工具条开关 + 主题弹层入口
  PreviewPanel.tsx        # 右侧预览标签页主体
  ThemePicker.tsx         # 主题 / 主题色 / 圆角选择弹层
  store.ts                # 极简外部 store（useSyncExternalStore）+ 生成流程
  controller.ts           # 延迟绑定的 Sidebar opener 桥接
  template.ts             # 确定性 HTML 模板（待替换为模型输出）
  themes.ts               # 主题、主题色、圆角目录
  styles.ts / icons.tsx / constants.ts
lib/client.js             # 构建产物（已在仓库中提交）
scripts/smoke.mjs         # 无浏览器冒烟测试
```

## 安装到 DeepSeek Harness

```bash
dsh plugin --profile web add /path/to/dsh-prototype
```

插件通过 `cordis.patch.yml` 挂进 Web profile；`package.json` 的 `dsh.client.inject` 声明了对
`@deepseek-ai/dsh-client-ui-conversation` 与 `@deepseek-ai/dsh-client-ui-sidebar-right` 的依赖。

## 开发

```bash
npm install
npm run build        # 一次性构建 lib/client.js
npm run build:watch  # 监听 src/client/** 增量构建
npm run typecheck    # tsc --noEmit
npm run smoke        # 需要先 build
```

构建产物必须包成 harness 的 module-loader 信封：

```js
window.__ModuleLoader__.load({ id: 'dsh-prototype', factory: (require) => { /* ... */ } })
```

`require` 只解析 shell 暴露的平台模块表，所以 `react` / `react/jsx-runtime` / `react-dom` 保持
external，不会把第二份 React 打进包里。`scripts/smoke.mjs` 用等价的 `window.__ModuleLoader__`
shim 在 Node 里跑 `lib/client.js`，借助 `react-dom/server` 渲染两个界面，用来挡住信封写错、
注册结构写错和渲染崩溃这三类问题，不需要浏览器。

## 当前限制

- **没有真实生成**：`store.generate()` 只是延迟若干毫秒后调用 `template.renderPrototypeHtml()`，
  渲染一份按主题变量着色的静态文档。真实实现应当把 prompt 交给模型，并拿回完整 HTML 文档。
- **宿主侧是空壳**：`index.js` 只导出了 `name` / `apply`，还没有 `ctx.systemPrompt.section()`、
  `prototype_write` 之类的工具，也没有把产物持久化或暴露成资源地址的服务。
- 预览用 `srcDoc` 渲染，页面里的外部资源受 iframe 沙箱限制。

## License

[MIT](./LICENSE)
