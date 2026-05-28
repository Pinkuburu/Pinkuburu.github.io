/* ============================
   ui.js — UI 渲染管理器
   所有 DOM 操作、动画、交互
   ============================ */

class UIManager {
  constructor() {
    this.msgList = document.getElementById("message-list");
    this.choiceArea = document.getElementById("choice-area");
    this.inputArea = document.getElementById("input-area");
    this.textInput = document.getElementById("text-input");
    this.inputSubmit = document.getElementById("input-submit");
    this.setupOverlay = document.getElementById("setup-overlay");
    this.setupContent = document.getElementById("setup-content");
    this.statusInd = document.getElementById("status-indicator");
    this.scrollAnchor = document.getElementById("scroll-anchor");
    this.langBtn = document.getElementById("lang-btn");
    this.langDropdown = document.getElementById("lang-dropdown");
    this.settingsOverlay = document.getElementById("settings-overlay");
    this.settingsBtn = document.getElementById("settings-btn");
    this._onLangSwitch = null;

    // 应用已保存的字体大小
    this._applyStoredFontSize();
  }

  /* ---------- 通用 ---------- */

  scrollBottom() {
    this.scrollAnchor.scrollIntoView({ behavior: "smooth" });
  }

  /** 纯延时（无 UI 提示） */
  delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /* ---------- 消息渲染 ---------- */

  /** 显示一条对话/旁白消息 */
  showText(text, speaker) {
    return new Promise((resolve) => {
      const div = document.createElement("div");
      div.className = "message";

      if (speaker) {
        div.classList.add(speaker);
        const sp = document.createElement("span");
        sp.className = "speaker " + speaker;
        sp.textContent = this._speakerName(speaker);
        div.appendChild(sp);
      } else {
        div.classList.add("narration");
      }

      const content = document.createElement("span");
      content.className = "content";
      content.innerHTML = text;
      div.appendChild(content);

      this.msgList.appendChild(div);
      this.scrollBottom();

      // CSS 动画 300ms，等待动画完成
      setTimeout(resolve, 350);
    });
  }

  /** 获取角色显示名称 */
  _speakerName(tag) {
    try {
      const strings = window["__STRINGS_" + (window.__currentLang || "CN")];
      const key = "<" + tag + ">";
      if (strings && strings[key]) {
        return strings[key].trim();
      }
    } catch (e) { /* fallthrough */ }
    return tag;
  }

  /* ---------- 延时提示 ---------- */

  /** 显示带消息的延时（如 "Taylor is sleeping..."） */
  showDelay(message, duration) {
    return new Promise((resolve) => {
      if (duration <= 0) { resolve(); return; }

      const div = document.createElement("div");
      div.className = "delay-indicator";

      const spinner = document.createElement("span");
      spinner.className = "spinner";
      div.appendChild(spinner);

      const label = document.createElement("span");
      label.textContent = message;
      div.appendChild(label);

      this.msgList.appendChild(div);
      this.scrollBottom();

      // 倒计时结束后移除
      setTimeout(() => {
        div.style.opacity = "0";
        div.style.transition = "opacity 0.3s";
        setTimeout(() => div.remove(), 300);
        resolve();
      }, duration);
    });
  }

  /* ---------- 选项按钮 ---------- */

  /** 展示二元选择，返回目标场景 ID */
  presentChoice(category) {
    return new Promise((resolve) => {
      this.choiceArea.innerHTML = "";

      const actions = category.actions;
      // 只取前两个选项（文本 + 目标场景）
      const options = actions.slice(0, 2);

      options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        // 带键盘提示的文本
        const keyHint = document.createElement("span");
        keyHint.className = "key-hint";
        keyHint.textContent = idx === 0 ? "1 " : "2 ";
        btn.appendChild(keyHint);
        const label = document.createElement("span");
        label.textContent = opt.short || opt.title;
        btn.appendChild(label);
        btn.addEventListener("click", () => {
          this.choiceArea.innerHTML = "";
          // 回显玩家选择
          this._echoPlayerChoice(opt.short || opt.title);
          resolve(opt.identifier);
        });
        this.choiceArea.appendChild(btn);

        // 键盘 0/1 选择
        if (idx === 0) btn.setAttribute("data-key", "0");
        if (idx === 1) btn.setAttribute("data-key", "1");
      });

      // 键盘快捷键（先移除旧监听器再添加新的）
      if (this._keyHandler) {
        document.removeEventListener("keydown", this._keyHandler);
      }
      this._keyHandler = (e) => {
        if (e.key === "1" || e.key === "2") {
          const idx = parseInt(e.key) - 1;
          const btns = this.choiceArea.querySelectorAll(".choice-btn");
          if (btns[idx]) btns[idx].click();
          document.removeEventListener("keydown", this._keyHandler);
        }
      };
      document.addEventListener("keydown", this._keyHandler);

      this.scrollBottom();
    });
  }

  /** 回显玩家的选择 */
  _echoPlayerChoice(text) {
    const div = document.createElement("div");
    div.className = "message taylor";
    const sp = document.createElement("span");
    sp.className = "speaker taylor";
    sp.textContent = "You";
    div.appendChild(sp);
    const content = document.createElement("span");
    content.className = "content";
    content.textContent = text;
    div.appendChild(content);
    this.msgList.appendChild(div);
    this.scrollBottom();
  }

  /* ---------- 文本输入 ---------- */

  /** 展示文本输入框，返回输入值 */
  presentTextInput(buttonText) {
    return new Promise((resolve) => {
      this.choiceArea.innerHTML = "";
      this.inputArea.style.display = "flex";
      this.textInput.value = "";
      this.textInput.focus();
      this.inputSubmit.textContent = buttonText || "发送";

      const submit = () => {
        const val = this.textInput.value.trim();
        if (!val) return;
        this.inputArea.style.display = "none";
        this._echoPlayerChoice(val);
        resolve(val);
      };

      this.inputSubmit.onclick = submit;
      this.textInput.onkeydown = (e) => {
        if (e.key === "Enter") submit();
      };

      this.scrollBottom();
    });
  }

  /* ---------- 游戏结束 ---------- */

  showGameOver() {
    this.choiceArea.innerHTML = "";

    const div = document.createElement("div");
    div.className = "message system game-over-message";

    const title = document.createElement("div");
    title.className = "end-title";
    title.textContent = "— 此路已尽 —";

    const hint = document.createElement("div");
    hint.style.fontSize = "0.8rem";
    hint.style.color = "var(--text-dim)";
    hint.style.marginBottom = "16px";
    hint.textContent = "泰勒在这条时间线上走到了尽头。\n你可以重新开始，探索不同的选择。";

    const restartBtn = document.createElement("button");
    restartBtn.className = "choice-btn";
    restartBtn.textContent = "重新开始";
    restartBtn.style.display = "inline-block";
    restartBtn.style.width = "auto";
    restartBtn.addEventListener("click", () => {
      Storage.reset();
      location.reload();
    });

    div.appendChild(title);
    div.appendChild(hint);
    div.appendChild(restartBtn);
    this.msgList.appendChild(div);
    this.scrollBottom();
  }

  /* ---------- 设置向导 ---------- */

  /** 设置流程各阶段，返回用户选择 */
  showSetup(stage, strings) {
    return new Promise((resolve) => {
      this.setupOverlay.classList.remove("hidden");
      let html = "";

      switch (stage) {
        case "lang":
          html = this._setupHTML("选择语言 / Language", "", [
            { text: "中文", value: "cn" },
            { text: "English", value: "en" },
            { text: "Deutsch", value: "de" },
            { text: "Français", value: "fr" },
            { text: "Русский", value: "ru" },
            { text: "日本語", value: "jp" },
          ], resolve, 3);
          break;

        case "name":
          html = this._setupNameHTML(strings, resolve);
          break;

        case "applewatch":
          html = this._setupHTML(
            strings.dialog_notification_settings || "",
            "",
            [
              { text: strings.dialog_notification_option_1 || "无 Apple Watch", value: "no" },
              { text: strings.dialog_notification_option_2 || "有 Apple Watch", value: "yes" },
            ],
            resolve,
            1
          );
          break;

        case "fastmode":
          html = this._setupHTML(
            strings.dialog_fast_confirmation || "启用快速模式？",
            "",
            [
              { text: strings.dialog_yes || "是", value: "yes" },
              { text: strings.dialog_no || "否", value: "no" },
            ],
            resolve,
            1
          );
          break;
      }

      this.setupContent.innerHTML = html;
    });
  }

  _setupHTML(title, subtitle, options, resolve, cols) {
    let btns = "";
    options.forEach((opt) => {
      btns += `<button class="setup-btn" data-value="${opt.value}">${opt.text}</button>`;
    });

    // 延迟绑定事件
    setTimeout(() => {
      this.setupContent.querySelectorAll(".setup-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          resolve(btn.dataset.value);
        });
      });
    }, 50);

    return `
      <div class="setup-title">${title}</div>
      ${subtitle ? `<div class="setup-subtitle">${subtitle}</div>` : ""}
      <div class="setup-group">
        <div class="setup-buttons" style="display:grid;grid-template-columns:repeat(${cols},1fr);">
          ${btns}
        </div>
      </div>
    `;
  }

  _setupNameHTML(strings, resolve) {
    const prompt = (strings && strings.story_my_name_is) || "我的名字是";
    const confirm = (strings && strings.dialog_name_confirmation) || "这是你的名字？";
    const placeholder = (strings && strings.text_input_placeholder) || "";

    setTimeout(() => {
      let name = "";
      const div = this.setupContent;

      const updateHTML = (stage) => {
        if (stage === "input") {
          div.innerHTML = `
            <div class="setup-title">${prompt}${placeholder}?</div>
            <div class="setup-group">
              <input class="setup-input" id="name-input" type="text" placeholder="${placeholder}" autocomplete="off">
              <button class="setup-confirm" id="name-confirm">确认</button>
            </div>
          `;
          const inp = document.getElementById("name-input");
          inp.focus();
          const submit = () => {
            name = inp.value.trim();
            if (!name) { inp.focus(); return; }
            updateHTML("confirm");
          };
          document.getElementById("name-confirm").onclick = submit;
          inp.onkeydown = (e) => { if (e.key === "Enter") submit(); };
        } else {
          div.innerHTML = `
            <div class="setup-title">${confirm} ${name} (y/n)</div>
            <div class="setup-group">
              <div class="setup-buttons">
                <button class="setup-btn" id="name-y">是</button>
                <button class="setup-btn" id="name-n">否</button>
              </div>
            </div>
          `;
          document.getElementById("name-y").onclick = () => resolve(name);
          document.getElementById("name-n").onclick = () => updateHTML("input");
        }
      };

      updateHTML("input");
    }, 50);

    return `<div class="setup-title">加载中...</div>`;
  }

  /** 隐藏设置面板 */
  hideSetup() {
    this.setupOverlay.classList.add("hidden");
  }

  /* ---------- 通讯接入动画 ---------- */

  async showIncomingAnimation(strings) {
    return new Promise(async (resolve) => {
      // 创建全屏黑色覆盖层
      const overlay = document.createElement("div");
      overlay.id = "incoming-overlay";
      overlay.innerHTML = `
        <div id="incoming-stars"></div>
        <div id="incoming-text"></div>
      `;
      document.getElementById("app").appendChild(overlay);

      const starsEl = document.getElementById("incoming-stars");
      const textEl = document.getElementById("incoming-text");

      // 逐字显示红色 *
      for (let i = 0; i < 20; i++) {
        starsEl.textContent += "*";
        await this.delay(200);
      }

      // 显示通讯文字
      textEl.textContent = strings.story_incoming_communication || "通讯接入中...";
      textEl.classList.add("visible");
      await this.delay(1200);

      // 移除覆盖层
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.5s";
      await this.delay(500);
      overlay.remove();
      resolve();
    });
  }

  /* ---------- 状态提示 ---------- */

  setConnected() {
    this.statusInd.textContent = "通讯已连接";
    this.statusInd.className = "connected";
  }

  setDisconnected() {
    this.statusInd.textContent = "等待通讯...";
    this.statusInd.className = "";
  }

  /* ---------- 消息管理 ---------- */

  clearMessages() {
    this.msgList.innerHTML = "";
    this.choiceArea.innerHTML = "";
  }

  /** 显示系统消息（金色） */
  async showSystem(text) {
    const div = document.createElement("div");
    div.className = "message system";
    const content = document.createElement("span");
    content.className = "content";
    content.textContent = text;
    div.appendChild(content);
    this.msgList.appendChild(div);
    this.scrollBottom();
    await this.delay(300);
  }

  /* ---------- 语言切换器 ---------- */

  LANG_NAMES = { cn: "中文", en: "English", de: "Deutsch", fr: "Français", ru: "Русский", jp: "日本語" };

  /** 初始化语言切换下拉菜单 */
  setupLangSwitcher(currentLang, onSwitch) {
    this._onLangSwitch = onSwitch;
    this.updateLangButton(currentLang);

    // 构建下拉选项
    this.langDropdown.innerHTML = "";
    Object.entries(this.LANG_NAMES).forEach(([key, name]) => {
      const opt = document.createElement("button");
      opt.className = "lang-option";
      if (key === currentLang) opt.classList.add("active");
      opt.textContent = name;
      opt.addEventListener("click", async () => {
        // 关闭下拉
        this.langDropdown.classList.add("hidden");
        if (key === currentLang) return;

        // 标记加载状态
        this.langBtn.textContent = "...";
        this.langBtn.disabled = true;

        try {
          await onSwitch(key);
          this.updateLangButton(key);
        } catch (e) {
          console.warn("语言切换失败:", e);
          this.langBtn.textContent = this.LANG_NAMES[currentLang] || currentLang;
          // 回退按钮文字
        } finally {
          this.langBtn.disabled = false;
        }
      });
      this.langDropdown.appendChild(opt);
    });

    // 点击按钮切换下拉
    this.langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.langDropdown.classList.toggle("hidden");
    });

    // 点击外部关闭下拉
    document.addEventListener("click", () => {
      this.langDropdown.classList.add("hidden");
    });
  }

  /** 更新按钮显示的文字 */
  updateLangButton(lang) {
    this.langBtn.textContent = this.LANG_NAMES[lang] || lang;
    // 更新 active 标记
    this.langDropdown.querySelectorAll(".lang-option").forEach((opt) => {
      opt.classList.remove("active");
    });
    const activeOpt = this.langDropdown.querySelector(
      `.lang-option[data-lang="${lang}"]`
    );
    // 通过文本匹配更新 active（简化处理）
    const options = this.langDropdown.querySelectorAll(".lang-option");
    options.forEach((opt) => {
      if (opt.textContent === this.LANG_NAMES[lang]) {
        opt.classList.add("active");
      }
    });
  }

  /* ---------- 字体大小 ---------- */

  _applyStoredFontSize() {
    const ds = Storage.getDisplay();
    document.documentElement.classList.add("font-" + ds.fontSize);
    if (!ds.showAnimation) {
      document.documentElement.classList.add("no-anim");
    }
  }

  /* ---------- 设置面板 ---------- */

  /** 初始化设置面板 */
  _setupSettingsPanel(onRestart) {
    const ds = Storage.getDisplay();

    // 字体大小按钮
    this._bindToggleGroup("setting-fontsize", ds.fontSize, (val) => {
      document.documentElement.classList.remove("font-small", "font-medium", "font-large");
      document.documentElement.classList.add("font-" + val);
      ds.fontSize = val;
      Storage.saveDisplay(ds);
    });

    // 消息速度
    this._bindToggleGroup("setting-speed", String(ds.autoDelay), (val) => {
      ds.autoDelay = parseInt(val);
      Storage.saveDisplay(ds);
    });

    // 快速模式
    this._bindToggleGroup("setting-fastmode", String(ds.fastMode), (val) => {
      ds.fastMode = val === "true";
      Storage.saveDisplay(ds);
    });

    // 动画开关
    this._bindToggleGroup("setting-animation", String(ds.showAnimation), (val) => {
      ds.showAnimation = val === "true";
      document.documentElement.classList.toggle("no-anim", !ds.showAnimation);
      Storage.saveDisplay(ds);
    });

    // 关闭按钮
    const closeBtn = document.getElementById("settings-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hideSettings();
      });
    }

    // 重新开始按钮
    const restartBtn = document.getElementById("settings-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this._confirmRestart(restartBtn, onRestart);
      });
    }

    // 点击设置按钮打开面板
    this.settingsBtn.addEventListener("click", () => {
      this.showSettings();
    });

    // 点击遮罩层关闭
    this.settingsOverlay.addEventListener("click", (e) => {
      if (e.target === this.settingsOverlay) {
        this.hideSettings();
      }
    });
  }

  _bindToggleGroup(containerId, activeValue, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      if (btn.dataset.value === activeValue) btn.classList.add("active");
      else btn.classList.remove("active");

      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        onChange(btn.dataset.value);
      });
    });
  }

  showSettings() {
    this.settingsOverlay.classList.remove("hidden");
  }

  hideSettings() {
    this.settingsOverlay.classList.add("hidden");
  }

  _confirmRestart(btn, onRestart) {
    // 首次点击 → 变红确认；第二次点击 → 执行
    if (!btn.classList.contains("danger")) {
      btn.classList.add("danger");
      btn.textContent = "确认重新开始？（将丢失所有进度）";
      // 3 秒后恢复
      this._restartTimer = setTimeout(() => {
        btn.classList.remove("danger");
        btn.textContent = "重新开始游戏";
      }, 3000);
      return;
    }

    clearTimeout(this._restartTimer);
    if (onRestart) onRestart();
  }
}

// 全局变量：标记当前加载的语言（供 _speakerName 使用）
window.__currentLang = "CN";
