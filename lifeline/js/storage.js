/* ============================
   storage.js — localStorage 存档管理
   ============================ */

const Storage = {
  KEY: "lifeline_silentnight_save",
  DISPLAY_KEY: "lifeline_display",

  /* ---------- 游戏存档 ---------- */

  /** 加载存档 */
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("存档读取失败，将创建新存档", e);
    }
    return null;
  },

  /** 保存存档 */
  save(status) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(status));
    } catch (e) {
      console.warn("存档保存失败", e);
    }
  },

  /** 创建默认存档 */
  createDefault(playerName, lang, fastMode) {
    return {
      Settings: {
        lang: lang,
        playerName: playerName,
        fastMode: fastMode,
        atScene: "Start",
        isStarted: true,
      },
    };
  },

  /** 删除存档 */
  reset() {
    localStorage.removeItem(this.KEY);
  },

  /* ---------- 显示设置 ---------- */

  /** 获取显示设置，无则返回默认值 */
  getDisplay() {
    try {
      const raw = localStorage.getItem(this.DISPLAY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fallthrough */ }
    return {
      autoDelay: 1500,
      fastMode: false,
      fontSize: "medium",
      showAnimation: true,
    };
  },

  /** 保存显示设置 */
  saveDisplay(settings) {
    try {
      localStorage.setItem(this.DISPLAY_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("显示设置保存失败", e);
    }
  },
};
