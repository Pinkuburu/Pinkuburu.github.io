# CLAUDE.md — Lifeline: Silent Night 静态网页版

## 项目概述

将 Lifeline: Silent Night 文字冒险游戏从 Python 2 移植到纯静态网页（HTML+CSS+JS），支持桌面和移动端。

## 重要说明

- `../Data/` 目录存放原始 JSON 剧情数据 + StoryData 文本源文件，这是**原始游戏数据**，不是代码
- `site/data/` 目录是由 `../convert_data.py` 脚本从 `../Data/` 的 JSON 自动生成的 JS 文件（`window.__XXX = {...}` 格式）
- 不要直接修改 `site/data/` 下的 JS 数据文件，修改数据应改原始 JSON 并重新运行转换脚本
- 原始 Python 代码是 Python 2 语法，在 `../lifeline_on_terminal.py` 和 `../lifeline_on_telegram.py` 中

## 项目结构

```
../                        # 原始 Python 2 项目
├── lifeline_on_terminal.py    # 终端版（参考实现）
├── lifeline_on_telegram.py    # Telegram Bot 版（参考实现）
├── Data/                      # 原始 JSON 数据（只读参考）
└── convert_data.py            # JSON → JS 转换脚本

site/                      # 静态网页版（主要开发目标）
├── index.html             # 单页面入口
├── PLAN.md                # 架构与实施计划
├── CLAUDE.md              # 本文件
├── css/
│   └── style.css          # 全部样式（暗色终端风 + 响应式）
├── js/
│   ├── storage.js         # localStorage 存档封装
│   ├── engine.js          # DSL 解释器核心（故事引擎）
│   ├── ui.js              # UI 渲染管理器
│   └── app.js             # 应用入口 + 初始化流程
└── data/                  # 自动生成的 JS 数据文件（勿手动编辑）
    ├── strings_*.js       # UI 字符串本地化（6 语种）
    ├── waypoints_*.js     # 场景/剧情节点定义
    └── categories_*.js    # 玩家选项定义
```

## 核心架构

### 数据流

```
用户操作 → app.js → engine.makeChoice(idx)
                  → engine.playScene(sceneName)
                  → 逐行解析 DSL 指令
                  → 调用 ui.js 渲染消息/选项
                  → 用户看到界面更新
```

### 模块职责

- **storage.js**: localStorage 存取，存档结构保持与原 status.json 一致
- **engine.js**: StoryEngine 类。加载 waypoints/categories/strings，逐行解析场景 DSL 指令，管理游戏状态（status 对象），通过 await 调用 ui 方法实现异步
- **ui.js**: UIManager 类。所有 DOM 操作——消息渲染、延时提示、选项按钮、设置面板、通讯动画
- **app.js**: App 入口。判断首次/继续游戏，协调 setup 流程，启动 engine

### 数据加载策略

- 首屏 HTML 中通过 `<script>` 标签加载中文数据（`_cn.js`），保证 `file://` 协议可用
- 其他语种通过动态创建 `<script>` 标签按需加载（`engine.ensureLangLoaded(lang)`）

### 存档机制

- 使用 localStorage，key 为 `lifeline_silentnight_save`
- 存档结构与原 `Data/status.json` 一致：扁平 key-value + `Settings` 对象
- 每次选择后自动保存，退出时保存场景位置

## DSL 语法速查

引擎在 `engine.js` 的 `playScene()` 中逐行解析以下指令：

| 指令 | 格式 | 处理 |
|------|------|------|
| 文本 | `任意文本` | `ui.showText(text, speaker)` |
| 角色标签 | `<shep>文本</shep>` | 解析 speaker + 文本 |
| 斜体 | `<i>文本</i>` | 转 `<em>` 标签 |
| 设置变量 | `<<set $var = value>>` | `status[var] = value` |
| 条件 | `<<if $var is true>>` | eval 字符串替换后的 JS 表达式 |
| 否则 | `<<else>>` | 翻转 skipLine 标志 |
| 否则如果 | `<<elseif $var is true>>` | 正确求值（修复了 Python 版 bug） |
| 结束条件 | `<<endif>>` | 退出 if-else 模式 |
| 直接跳转 | `[[scene]]` | 设置 nextScene |
| 延时跳转 | `[[delay Xs^msg\|scene]]` | sleep X 秒后设置 nextScene |
| 随机跳转 | `[[either("a","b")]]` | Math.random 选择 |
| 玩家选择 | `<<category lifelineN>>` | 查 categories[N]，展示二选一按钮 |
| 文本输入 | `<<textinput $var "[[Btn\|scene]]">>` | 显示输入框 |
| 静默 | `<<silently>>/<<endsilently>>` | 抑制消息输出 |
| 网络/邮件 | `<<netcheck>>/<<sendemail>>` | Web 版空操作 |

## 关键数值

- 场景总数：672 个（所有语种一致）
- 选项总数：337 个（英文），中文类似
- 数据大小：中文 waypoints ~253KB，categories ~115KB
- 支持的语种：cn, en, de, fr, ru, jp（6 种）

## 条件表达式的 eval 处理

Python 版的字符串替换顺序（`engine.js` 的 `evalCondition()` 中复制了相同逻辑）：

1. `false` → `'false'`，`true` → `'true'`
2. ` is ` → `'] ==`
3. `gte` → `>=`
4. `$` → `this.status['`
5. 无 `=` 时追加 `'] == 'true'`
6. `visited()` → 当前场景的访问计数

## 开发注意事项

- 所有 `await` 调用必须保持异步链完整（从 `playScene` 到 `_handleJump` 到 `ui.delay`）
- 快速模式跳过所有 `_autoDelay()` 和 `showDelay()` 等待
- 语言切换时需先 `ensureLangLoaded()` 再切换 `this.lang`
- 手机端测试时注意触控区域 ≥44px（已在 CSS 中处理）
- `eval()` 用于条件求值 —— 这是本地单机游戏，无安全风险
