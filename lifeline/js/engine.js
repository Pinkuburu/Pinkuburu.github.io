/* ============================
   engine.js — 故事引擎核心 (DSL 解释器)
   对应 Python 版的 Lifeline + Story 类
   ============================ */

class StoryEngine {
  constructor(ui, storage) {
    this.ui = ui;
    this.storage = storage;
    this.lang = "cn";
    this.status = {};
    this.silent = false;
  }

  /* ---------- 数据获取 ---------- */

  waypoints() {
    return window["__WAYPOINTS_" + this.lang.toUpperCase()];
  }
  categories() {
    return window["__CATEGORIES_" + this.lang.toUpperCase()];
  }
  strings() {
    return window["__STRINGS_" + this.lang.toUpperCase()];
  }

  /* ---------- 存档 ---------- */

  loadSave() {
    const save = this.storage.load();
    if (save) {
      this.status = save;
      this.lang = save.Settings.lang || "cn";
    }
    return !!save;
  }

  save(scene) {
    if (scene) this.status.Settings.atScene = scene;
    this.storage.save(this.status);
  }

  isFastMode() {
    return Storage.getDisplay().fastMode;
  }

  /* ---------- 语言 ---------- */

  switchLang(lang) {
    this.lang = lang;
    if (!this.status.Settings) this.status.Settings = {};
    this.status.Settings.lang = lang;
    this.save();
  }

  /** 确保某语种的数据已加载，未加载则动态创建 script 标签 */
  async ensureLangLoaded(lang) {
    const key = "__WAYPOINTS_" + lang.toUpperCase();
    if (window[key]) return;

    const types = ["strings", "waypoints", "categories"];
    const loads = types.map((t) => {
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "data/" + t + "_" + lang + ".js";
        s.onload = resolve;
        s.onerror = () => reject(new Error("Failed to load " + t + " for " + lang));
        document.head.appendChild(s);
      });
    });
    await Promise.all(loads);
  }

  /* ---------- 条件表达式求值 ---------- */

  evalCondition(expr, sceneName) {
    // 复制 Python 版的字符串替换顺序
    let cond = expr
      .replace(/false/g, "'false'")
      .replace(/true/g, "'true'")
      .replace(/ is /g, "'] ==")
      .replace(/gte/g, ">=")
      .replace(/\$/g, "this.status['");

    // visited() 处理
    if (cond.includes("visited()")) {
      const key = sceneName + "_visited";
      if (this.status[key] !== undefined) {
        this.status[key] = String(Number(this.status[key]) + 1);
      } else {
        this.status[key] = "1";
      }
      cond = cond.replace("visited()", this.status[key]);
    }

    // 没有比较运算符 → 检查是否为 'true'
    if (!cond.includes("=")) {
      cond += "'] == 'true'";
    }

    try {
      return eval(cond);
    } catch (e) {
      console.warn("Condition eval failed:", cond, e);
      return false;
    }
  }

  /* ---------- DSL 指令处理 ---------- */

  handleSet(line) {
    const inner = line.slice(7, -2).replace(/ /g, "");
    const eqIdx = inner.indexOf("=");
    if (eqIdx === -1) return;
    const key = inner.slice(0, eqIdx);
    const val = inner.slice(eqIdx + 1);
    this.status[key] = val;
  }

  parseDelay(str) {
    const m = str.match(/delay\s+(\d+)(s|m|h)/);
    if (!m) return 0;
    const n = parseInt(m[1]);
    const u = m[2];
    const sec = u === "s" ? n : u === "m" ? n * 60 : n * 3600;
    return sec * 1000;
  }

  /** 解析 <<category lifelineN>> 返回选项数据 */
  parseCategory(line) {
    // line = '<<category lifeline31>>'
    const numStr = line.slice(19, -2); // 提取数字部分
    const idx = parseInt(numStr);
    return this.categories()[idx];
  }

  /** 解析文本中的角色标签和格式 */
  parseText(line) {
    let speaker = null;
    let text = line;

    // 检测角色标签 <shep>文本</shep>
    const tagMatch = text.match(/^<(\w+)>/);
    if (tagMatch) {
      speaker = tagMatch[1];
      text = text.replace(/^<\w+>/, "").replace(/<\/\w+>$/, "");
    }

    // <i> 斜体
    text = text.replace(/<i>(.*?)<\/i>/g, "<em>$1</em>");

    return { speaker, text: text.trim() };
  }

  /* ---------- 主循环：播放场景 ---------- */

  async playScene(sceneName) {
    if (!sceneName) {
      this.status.Settings.atScene = "Start";
      this.save();
      await this.ui.showGameOver();
      return;
    }

    const lines = this.waypoints()[sceneName];
    if (!lines) {
      this.status.Settings.atScene = "Start";
      this.save();
      await this.ui.showGameOver();
      return;
    }

    // 保存当前场景
    this.status.Settings.atScene = sceneName;
    this.save();

    let ifElse = false;
    let skipLine = false;
    let nextScene = null;

    for (const line of lines) {
      /* --- if/else 块处理 --- */
      if (ifElse) {
        if (line.startsWith("<<else")) {
          if (line.startsWith("<<elseif ")) {
            // 修复版 elseif：正确求值条件
            if (!skipLine) {
              // 已经执行过一个块，跳过所有后续
              skipLine = true;
            } else {
              const cond = this.evalCondition(
                line.slice(9, -2),
                sceneName
              );
              skipLine = !cond;
            }
          } else {
            // 普通 else：翻转
            skipLine = !skipLine;
          }
          continue;
        }
        if (line === "<<endif>>") {
          ifElse = false;
          continue;
        }
        if (skipLine) continue;
      }

      /* --- 指令分发 --- */
      if (line.startsWith("<<if ")) {
        ifElse = true;
        const cond = this.evalCondition(line.slice(5, -2), sceneName);
        skipLine = !cond;
      } else if (line.startsWith("<<set ")) {
        this.handleSet(line);
      } else if (line.startsWith("[[")) {
        nextScene = await this._handleJump(line);
      } else if (line.startsWith("<<category ")) {
        const cat = this.parseCategory(line);
        const chosen = await this.ui.presentChoice(cat);
        return this.playScene(chosen);
      } else if (line.startsWith("<<textinput ")) {
        const targetScene = await this._handleTextInput(line);
        return this.playScene(targetScene);
      } else if (line === "<<silently>>") {
        this.silent = true;
      } else if (line === "<<endsilently>>") {
        this.silent = false;
      } else if (line === "<<sendemail>>" || line === "<<netcheck>>") {
        // Web 版空操作
      } else if (line.startsWith("<<$")) {
        // 变量输出
        const varName = line.slice(3, -2).trim();
        const val = this.status[varName] || "";
        if (!this.silent) {
          await this.ui.showText(val, null);
          await this._autoDelay();
        }
      } else {
        // 普通文本
        if (!this.silent) {
          const parsed = this.parseText(line);
          await this.ui.showText(parsed.text, parsed.speaker);
          await this._autoDelay();
        }
      }
    }

    // 场景处理完毕，跳转到下一场景
    return this.playScene(nextScene);
  }

  /* ---------- 跳转处理 ---------- */

  async _handleJump(line) {
    const inner = line.slice(2, -2);

    // 延时跳转: [[delay Xs^消息|目标场景]]
    if (inner.startsWith("delay ")) {
      const pipeIdx = inner.lastIndexOf("|");
      let delayPart = inner.slice(0, pipeIdx);
      const target = inner.slice(pipeIdx + 1);

      let delayMsg = null;
      const caretIdx = delayPart.indexOf("^");
      if (caretIdx !== -1) {
        delayMsg = delayPart.slice(caretIdx + 1);
        delayPart = delayPart.slice(0, caretIdx);
      }

      const duration = this.parseDelay(delayPart);
      if (duration > 0 && !this.isFastMode()) {
        if (delayMsg) {
          await this.ui.showDelay(delayMsg, duration);
        } else {
          await this.ui.delay(duration);
        }
        // 长延时结束后发送浏览器通知
        if (duration >= 10000) {
          this._notifyPlayer();
        }
      }
      return target;
    }

    // 随机跳转: [[either("a","b","c")]]
    if (inner.startsWith("either(")) {
      const args = inner.slice(7, -1); // "a","b","c"
      const opts = args
        .split('","')
        .map((s) => s.replace(/^"/, "").replace(/"$/, ""));
      return opts[Math.floor(Math.random() * opts.length)];
    }

    // 管道跳转: [[a|b]] | [[c|d]] → 取竖线后面的值
    if (inner.includes("]] | [[")) {
      const pipeIdx = inner.indexOf("|");
      const bracketIdx = inner.indexOf("]", pipeIdx);
      return inner.slice(pipeIdx + 1, bracketIdx);
    }

    // 直接跳转
    return inner;
  }

  /* ---------- 文本输入 ---------- */

  async _handleTextInput(line) {
    // <<textinput $emailAddress "[[Enter|confirm_email]]">
    const inner = line.slice(12, -2).trim();
    const spaceIdx = inner.indexOf(" ");
    const varName = inner.slice(1, spaceIdx); // 去掉 $

    const jumpPart = inner.slice(spaceIdx + 1); // "[[Enter|confirm_email]]"
    const jumpInner = jumpPart.slice(2, -2); // Enter|confirm_email
    const pipeIdx = jumpInner.indexOf("|");
    const btnText = jumpInner.slice(0, pipeIdx);
    const targetScene = jumpInner.slice(pipeIdx + 1);

    const value = await this.ui.presentTextInput(btnText);
    this.status[varName] = value;
    this.save();
    return targetScene;
  }

  /* ---------- 辅助 ---------- */

  async _autoDelay() {
    if (!this.isFastMode()) {
      const ds = Storage.getDisplay();
      await this.ui.delay(ds.autoDelay);
    }
  }

  _notifyPlayer() {
    const strings = this.strings();
    const body = (strings && strings.story_arika_is_waiting_for_you)
      ? strings.story_arika_is_waiting_for_you.replace(/^\[|\]$/g, "")
      : "泰勒在等待你的回复";
    sendNotification("生命线：静夜", body);
  }
}
