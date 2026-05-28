/* ============================
   app.js — 应用入口 & 初始化流程
   对应 Python 版的 Lifeline.start() + 主流程
   ============================ */

class App {
  constructor() {
    this.ui = new UIManager();
    this.engine = new StoryEngine(this.ui, Storage);
  }

  async init() {
    const hasSave = this.engine.loadSave();

    if (hasSave && this.engine.status.Settings.isStarted) {
      // 继续游戏
      await this._resumeGame();
    } else {
      // 首次游戏
      await this._startNewGame();
    }
  }

  /* ---------- 首次游戏：设置向导 ---------- */

  async _startNewGame() {
    const strings = this.engine.strings();
    window.__currentLang = this.engine.lang.toUpperCase();

    // 阶段1：语言选择
    const lang = await this.ui.showSetup("lang");
    await this.engine.ensureLangLoaded(lang);
    this.engine.switchLang(lang);
    window.__currentLang = lang.toUpperCase();

    // 阶段2：玩家名
    const name = await this.ui.showSetup("name", this.engine.strings());

    // 阶段3：Apple Watch 通知
    await this.ui.showSetup("applewatch", this.engine.strings());

    // 阶段4：快速模式
    const fastMode = await this.ui.showSetup("fastmode", this.engine.strings());

    // 创建存档
    this.engine.status = Storage.createDefault(name, lang, fastMode === "yes");
    Storage.save(this.engine.status);

    // 同步快速模式到显示设置
    const display = Storage.getDisplay();
    display.fastMode = fastMode === "yes";
    Storage.saveDisplay(display);

    // 非中文语种需动态加载数据
    await this.engine.ensureLangLoaded(lang);

    // 隐藏设置，显示通讯接入动画
    this.ui.hideSetup();
    this.ui.setConnected();
    await this.ui.delay(500);
    await this.ui.showIncomingAnimation(this.engine.strings());
    await this.ui.delay(500);

    // 启用语言切换 + 设置面板
    this._setupLangSwitcher();
    this._setupSettingsPanel();

    // 请求浏览器通知权限
    this._requestNotification();

    // 开始游戏
    await this.engine.playScene("Start");
  }

  /* ---------- 继续游戏 ---------- */

  async _resumeGame() {
    const settings = this.engine.status.Settings;
    this.ui.hideSetup();
    this.ui.setConnected();

    // 确保存档语言的剧情数据已加载（非中文存档需动态加载）
    window.__currentLang = settings.lang.toUpperCase();
    await this.engine.ensureLangLoaded(settings.lang);

    // 启用语言切换 + 设置面板
    this._setupLangSwitcher();
    this._setupSettingsPanel();

    // 请求浏览器通知权限
    this._requestNotification();

    const scene = settings.atScene || "Start";
    if (scene !== "Start") {
      await this.ui.showSystem("— 继续上次的冒险 —");
    }

    await this.engine.playScene(scene);
  }

  /* ---------- 语言切换 ---------- */

  _setupLangSwitcher() {
    this.ui.setupLangSwitcher(this.engine.lang, async (newLang) => {
      await this.engine.ensureLangLoaded(newLang);
      this.engine.switchLang(newLang);
      // 保存后刷新页面以完整应用新语言
      location.reload();
    });
  }

  /* ---------- 设置面板 ---------- */

  _setupSettingsPanel() {
    this.ui._setupSettingsPanel(() => {
      this._handleRestart();
    });
  }

  _handleRestart() {
    Storage.reset();
    location.reload();
  }

  /* ---------- 浏览器通知 ---------- */

  _requestNotification() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}

/** 发送浏览器通知（供 Engine 调用） */
function sendNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⭐</text></svg>" });
  } catch (e) { /* 忽略通知失败 */ }
}

/* ---------- 启动 ---------- */

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init().catch((err) => {
    console.error("Game init failed:", err);
    document.getElementById("status-indicator").textContent =
      "初始化失败，请刷新页面";
  });
});
