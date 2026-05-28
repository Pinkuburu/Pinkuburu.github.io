# Lifeline: Silent Night — 静态网页版架构与实施计划

## 一、项目目标

将 Python 2 终端/Telegram 版的 Lifeline: Silent Night 文字冒险游戏，改造为纯 HTML + CSS + JS 静态网站，支持桌面和移动端浏览器直接游玩。

## 二、核心架构

### 2.1 整体分层

```
┌─────────────────────────────────────────┐
│                HTML (UI)                │
│  index.html — 单页面布局               │
├─────────────────────────────────────────┤
│                  CSS                    │
│  style.css — 终端风格 + 响应式适配      │
├─────────────────────────────────────────┤
│               JavaScript               │
│  ┌─────────┐ ┌────────┐ ┌───────────┐ │
│  │ app.js  │ │ ui.js  │ │ engine.js │ │
│  │ 入口    │ │ 渲染层 │ │ 引擎核心  │ │
│  └─────────┘ └────────┘ └───────────┘ │
│                  ┌──────────┐           │
│                  │storage.js│           │
│                  │ 存档层   │           │
│                  └──────────┘           │
├─────────────────────────────────────────┤
│            Data (JS 数据文件)           │
│  strings_*.js / waypoints_*.js         │
│  categories_*.js （6种语言）            │
└─────────────────────────────────────────┘
```

### 2.2 JS 模块职责

| 模块 | 职责 | 关键 API |
|------|------|----------|
| `storage.js` | localStorage 读写、存档序列化 | `load()`, `save()`, `createDefault()`, `reset()` |
| `engine.js` | DSL 解释器：逐行解析场景指令，管理游戏状态 | `playScene(scene)`, `makeChoice(idx)`, `switchLang(lang)` |
| `ui.js` | DOM 渲染：消息列表、打字效果、选项按钮、设置面板 | `showText()`, `showChoice()`, `showSetup()`, `delay()` |
| `app.js` | 应用入口：初始化、协调 Engine 与 UI | `init()`, `startGame()`, `resumeGame()` |

### 2.3 数据流

```
用户操作 → app.js 调用 engine.makeChoice(idx)
         → engine 设置 status.atScene = 目标场景
         → engine.playScene() 解析场景行
         → 逐行产出 {type: 'text'|'delay'|'choice'|'textinput', ...}
         → ui.js 渲染到 DOM
         → 用户看到文本 / 延时动画 / 选项按钮
         → 用户点击选项 → 循环
```

## 三、关键技术决策

### 3.1 数据加载策略：按需加载

- **首屏加载**：HTML 中用 `<script>` 直接引入中文数据（`_cn.js`），确保 `file://` 协议可用
- **语言切换**：动态创建 `<script>` 标签加载对应语种数据文件
- **全局变量命名**：`window.__STRINGS_CN`、`window.__WAYPOINTS_CN`、`window.__CATEGORIES_CN`
- **引擎引用**：通过 `window['__WAYPOINTS_' + lang.toUpperCase()]` 动态获取当前语种数据

### 3.2 存档方案：localStorage

| 对比项 | Cookie | localStorage |
|--------|--------|-------------|
| 容量 | 4KB | 5MB |
| API | 字符串解析 | 原生 JSON |
| 持久性 | 可设过期 | 手动清除才消失 |
| 结论 | ❌ 太小 | ✅ 适合 |

存档结构保持与原 status.json 一致，额外存储 Settings。

### 3.3 异步处理

Python 版用 `sleep()` 阻塞等待，JS 版必须异步：
- 文本显示间用 `await sleep(ms)` 
- 延时跳转用 `await sleep(ms)` 
- 用户选择用 Promise + 按钮 click 事件
- Engine.playScene() 声明为 `async`，内部 await UI 操作

### 3.4 文本显示方式

- 采用**逐条淡入**而非打字机效果（打字机在移动端性能差、视觉疲劳）
- 每条消息 300ms fade-in 动画（CSS animation）
- 消息间自动延时 1.8s（非快速模式），模拟原版节奏
- 快速模式跳过所有延时

### 3.5 DSL 语法覆盖清单

| 指令 | 格式 | 处理方式 |
|------|------|----------|
| 普通文本 | `任意文本` | 渲染为消息气泡 |
| 角色标签 | `<shep>文本</shep>` | 替换为带颜色的角色名 |
| 斜体 | `<i>文本</i>` | CSS font-style: italic |
| 设置变量 | `<<set $var = value>>` | `status[var] = value` |
| 条件判断 | `<<if $var is true>>` | 字符串替换 → `eval()` 求值 |
| 否则 | `<<else>>` | 翻转 skip 标志 |
| 否则如果 | `<<elseif $var is true>>` | **修复版**：正确求值条件，而非简单翻转 |
| 结束判断 | `<<endif>>` | 退出 if-else 模式 |
| 直接跳转 | `[[scene_name]]` | 设置 nextScene |
| 延时跳转 | `[[delay Xs^消息\|场景]]` | 等待 X 秒（可选消息），跳转 |
| 随机跳转 | `[[either("a","b","c")]]` | random 选择 |
| 管道跳转 | `[[a\|b]] \| [[c\|d]]` | 取竖线后的值 |
| 玩家选择 | `<<category lifelineN>>` | 提取 N，查 categories[N]，展示二选一 |
| 文本输入 | `<<textinput $var "[[Enter\|scene]]">>` | 显示输入框，回车跳转 |
| 静默模式 | `<<silently>>` / `<<endsilently>>` | 抑制消息输出 |
| 发送邮件 | `<<sendemail>>` | Web 版空操作 |
| 网络检查 | `<<netcheck>>` | 始终通过 |
| 变量输出 | `<<$var>>` | 输出变量值 |

### 3.6 Python → JS 关键对照

```
Python                          →  JavaScript
──────────────────────────────────────────────────
raw_input()                     →  按钮 click → Promise resolve
sleep(2.5)                      →  await sleep(2500)
print(text)                     →  ui.showText(text)
ANSI \033[36m                   →  CSS .speaker.shep { color: var(--cyan); }
eval(if_line)                   →  eval(ifLine) — 仅本地游戏，风险可控
self.status['key']              →  this.status[key] (字符串 'true'/'false')
random.choice(tuple)            →  arr[Math.floor(Math.random() * arr.length)]
multiprocessing                 →  async/await (天然非阻塞)
```

## 四、UI 设计

### 4.1 视觉风格

- **暗色终端风**：深黑背景 `#0a0a0f`，柔和前景色
- **消息气泡**：左侧彩色边框区分角色
- **角色色彩系统**：

| 角色 | 颜色 |
|------|------|
| Shepherd, Don, Bos | 青色 #4ec9b0 |
| Aries, Mari | 品红 #c586c0 |
| Doc | 绿色 #6a9955 |
| Green | 翠绿 #4caf50 |
| Taylor（主角） | 红色 #e63946 |
| 系统/旁白 | 金色 #f0c060 |

### 4.2 响应式布局

- **桌面端**（≥769px）：最大宽度 720px，居中，两侧阴影边框
- **平板端**（481-768px）：全宽，字号 15px
- **手机端**（≤480px）：全宽，字号 14px，按钮触控区域 ≥44px

### 4.3 关键交互

1. **首次游戏**：设置面板（语言→名字→通知模式→快速模式）→ 通讯接入动画 → 开始
2. **继续游戏**：跳过设置，直接恢复存档场景
3. **选项交互**：底部固定两个按钮，桌面可键盘 0/1 选择
4. **滚动**：新消息自动滚到底部

## 五、文件清单

```
site/
├── index.html          # 单页面入口（约 40 行）
├── css/
│   └── style.css       # 全部样式（约 300 行）
├── js/
│   ├── storage.js      # localStorage 封装（约 40 行）
│   ├── engine.js       # 故事引擎核心（约 280 行）
│   ├── ui.js           # UI 渲染管理器（约 320 行）
│   └── app.js          # 应用入口（约 80 行）
├── data/               # 18 个 JS 数据文件（由脚本生成）
│   ├── strings_cn.js   (5KB)
│   ├── waypoints_cn.js (253KB) ← 首屏加载
│   ├── categories_cn.js(115KB) ← 首屏加载
│   └── ... (en/de/fr/ru/jp)
└── PLAN.md             # 本文档
```

## 六、实施任务列表

| # | 任务 | 预估复杂度 | 依赖 |
|---|------|-----------|------|
| 1 | 数据转换脚本 `convert_data.py`，JSON → JS | 简单 | — |
| 2 | 运行脚本，生成 `site/data/` 下18个JS文件 | 简单 | 1 |
| 3 | `index.html` — DOM 骨架 | 简单 | — |
| 4 | `storage.js` — localStorage 存档层 | 简单 | — |
| 5 | `engine.js` — DSL 解释器核心 | **复杂** | 2, 4 |
| 6 | `ui.js` — UI 渲染 & 交互 | **复杂** | 3 |
| 7 | `app.js` — 入口 & 协调层 | 中等 | 5, 6 |
| 8 | `style.css` — 全部样式 & 响应式 | 中等 | 3 |
| 9 | 集成调试：中文加载 → 设置 → 游戏流程 | 中等 | 全部 |
| 10 | 语言切换功能 & 动态加载其他语种数据 | 中等 | 5 |
