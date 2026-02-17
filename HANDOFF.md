# 🏥 中醫冒險者 (TCM RPG) — 專案交接文件

> 最後更新：2026-02-17

## 📋 專案概覽

一個**遊戲化生活管理系統**，幫助中醫研究所學生用 RPG 任務系統追蹤每日學習和健身進度。

- **技術棧**：純靜態網頁（Vanilla HTML + CSS + JS），無框架、無建置步驟
- **儲存方式**：瀏覽器 localStorage（key: `tcm_rpg_state`）
- **部署位置**：GitHub Pages → https://timothy3501.github.io/tcm-rpg/
- **GitHub Repo**：https://github.com/timothy3501/tcm-rpg
- **本機路徑**：`c:\桌面\Antigravity\tcm-rpg\`

---

## 📁 檔案結構

```
tcm-rpg/
├── index.html          # 主頁面（含所有 modal：命名、抽寶箱、拍照、存檔同步）
├── config.js           # 🔑 所有遊戲數值設定（任務、獎勵、技能樹、稱號等）
├── app.js              # 核心邏輯（狀態管理、渲染、寶箱、商城、同步）
├── style.css           # 像素 RPG 風格 CSS（含角色精靈動畫）
├── .github/workflows/
│   └── deploy.yml      # GitHub Pages 自動部署 workflow
├── .gitignore
└── HANDOFF.md          # 本文件
```

---

## 🎮 核心系統

### 1. 每日任務系統（config.js `quests`）
- 14 個任務，分 5 大類：經方/溫病、針灸/傷科、健身、西醫、休息
- 每個任務有 `baseReward`（靈石）、`category`、`requirePhoto`（是否需拍照證明）
- **沒有屬性系統**（STR/INT/DEX 已移除，太複雜）
- 每日最低要求：完成 3 個任務才能抽寶箱

### 2. 靈石 & 等級
- 完成任務得靈石，靈石也是 XP
- 20 級制，XP 門檻定義在 `config.js levels`
- 升級可獲得技能點 或 里程碑獎勵（購物基金、自由日券等）

### 3. 寶箱系統（Gacha）
- 銅箱 60% / 銀箱 25% / 金箱 12% / 傳說箱 3%
- 獎品：豁免券、外送飲料券、MOS 爽吃券、靈石、購物基金等
- ⚠️ 設計原則：用戶每晚已有 2 小時自由時間打電動看劇，所以**不用電動/追劇券當獎勵**（沒感覺）

### 4. 商城（每週隨機上架 6 個）
- 物品池定義在 `config.js shopItems`
- 每週一自動刷新
- 價格從 50（飲料券）到 800（完整自由日）

### 5. 連續天數加成
- 3天 +10%, 7天 +25%, 14天 +50%, 30天 +75%

### 6. 技能樹（4 條路線）
- 針道、經方、體魄、通識
- 每條有 Tier 1-4，需要等級解鎖
- 效果類型：`quest_modify`（靈石加成）、`quest_multiply`（倍率）、`milestone_gacha`（里程碑寶箱）、`milestone_bonus`（靈石獎勵）、`combo_bonus`（組合獎勵）

### 7. 每日隨機詞條
- 10 種（定義在 `config.js dailyModifiers`）
- 基於日期的 seed，同一天看到同一個
- 效果類型：category_bonus、hard_mode、gacha_upgrade、reduced_minimum 等

### 8. 稱號系統
- 11 個稱號，各有解鎖條件
- 可在角色頁切換裝備

### 9. 存檔同步功能
- 右上角 ⚙️ 按鈕
- 匯出：Base64 編碼後複製到剪貼簿
- 匯入：貼上代碼，解碼後寫入 localStorage
- 用於電腦 ↔ 手機同步

---

## 🎨 UI 設計

- **像素 RPG 風格**：`Press Start 2P` 字型 + `Noto Sans TC` 中文
- **暗色主題**：深紫黑背景 (`#0a0a12`)
- **角色精靈**：CSS 動畫的像素小人（會呼吸動畫），出現在 dashboard 和角色頁
- **五個底部導航頁**：主頁、任務、角色、技能、商城
- **卡片式佈局**：用 `.card` 和 `.card-gold` 等 class

---

## ⚠️ 已知的重要設計決策

1. **沒有自動學期切換**：任務列表是靜態的，前半/後半學期需手動修改 `config.js`
2. **靈石分配尚未討論**：用戶提過想調整靈石數值，但還沒深入討論
3. **升級速度可能太慢**：每天 3 個輕量任務 (~60 靈石/天) 要 3.5 個月才到 Lv.10
4. **照片上傳只存前 200 字元**：不是真的存圖片，只是記錄有上傳過
5. **localStorage 限制**：資料不跨瀏覽器、清除會消失

---

## 🐛 已修復的 Bug

- **拍照完成 bug**：`confirmPhoto()` 曾在 `closePhotoModal()` 後才取用 `pendingPhotoQuest`（已 null），改為先存到 local variable

---

## 🔧 開發 & 部署

```bash
# 本機開發（直接雙擊 index.html 或）
npx serve . -l 3333

# Git 部署到 GitHub Pages
git add -A
git commit -m "描述"
git push
# GitHub Actions 會自動部署

# GitHub CLI（已安裝在此機器）
gh auth status
```

---

## 📌 用戶背景

- 中醫研究所學生
- 同時學習：溫病學（劉景源）、針灸（倪海廈影片）、傷科手法、西醫課程
- 有健身習慣（PPL 訓練）
- 使用 Obsidian 做知識管理
- 用 AI 將西醫課堂錄影轉成自學講義
- 非工程師背景，操作說明需簡單直白
- GitHub 帳號：`timothy3501`
