// ========================================
// 中醫冒險者 — 遊戲設定檔
// 所有遊戲數值都在這裡修改！
// ========================================

const GAME_CONFIG = {

    // === 玩家初始設定 ===
    player: {
        defaultName: '冒險者',
        maxLevel: 20,
    },

    // === 等級門檻（累計靈石） ===
    levels: [
        { level: 1, xp: 0, reward: null },
        { level: 2, xp: 200, reward: '🎁 解鎖每日寶箱' },
        { level: 3, xp: 500, reward: '🎁 解鎖商城' },
        { level: 4, xp: 900, reward: null },
        { level: 5, xp: 1500, reward: '🎁 技能樹 Tier 2 解鎖' },
        { level: 6, xp: 2200, reward: null },
        { level: 7, xp: 3000, reward: null },
        { level: 8, xp: 4000, reward: '🎁 購物基金 +$300' },
        { level: 9, xp: 5000, reward: null },
        { level: 10, xp: 6500, reward: '🎁 技能樹 Tier 3 解鎖 + 自由日券' },
        { level: 11, xp: 8000, reward: null },
        { level: 12, xp: 9500, reward: null },
        { level: 13, xp: 11500, reward: '🎁 購物基金 +$500' },
        { level: 14, xp: 13500, reward: null },
        { level: 15, xp: 16000, reward: '🎁 技能樹 Tier 4 解鎖' },
        { level: 16, xp: 18500, reward: null },
        { level: 17, xp: 21500, reward: null },
        { level: 18, xp: 25000, reward: '🎁 購物基金 +$1000' },
        { level: 19, xp: 29000, reward: null },
        { level: 20, xp: 33000, reward: '🏆 學期大師！終極獎勵解鎖' },
    ],



    // === 每日任務 ===
    quests: [
        // ———— 📖 經方/溫病 ————
        { id: 'wenbing_study', name: '📖 劉景源溫病學', desc: '閱讀或觀看一節（45-60 分鐘）', baseReward: 25, category: 'study', requirePhoto: true },
        { id: 'wenbing_notes', name: '📝 溫病筆記整理', desc: '把今日讀的溫病內容整理到 Obsidian', baseReward: 15, category: 'study', requirePhoto: true },

        // ———— 📍 針灸/傷科 ————
        { id: 'anki_acupoints', name: '📍 Anki 穴位複習', desc: '間隔重複，完成每日卡片（15 分鐘）', baseReward: 10, category: 'practice', requirePhoto: true },
        { id: 'nihaisha_video', name: '🎬 倪海廈針灸影片', desc: '看 1 集並做筆記（30 分鐘）', baseReward: 15, category: 'study', requirePhoto: true },
        { id: 'shangke_notes', name: '🦴 傷科手法筆記', desc: '整理 1 動手法步驟到 Obsidian', baseReward: 15, category: 'practice', requirePhoto: true },
        { id: 'practice_needle', name: '💉 針灸實操練習', desc: '跟同學互練扎針', baseReward: 40, category: 'practice', requirePhoto: true },
        { id: 'practice_shangke', name: '🤲 傷科手法練習', desc: '跟同學互練手法', baseReward: 40, category: 'practice', requirePhoto: true },

        // ———— 💪 健身 ————
        { id: 'gym_workout', name: '💪 重訓（PPL）', desc: 'Push / Pull / Legs 完成一次', baseReward: 30, category: 'fitness', requirePhoto: true },
        { id: 'cardio', name: '🏃 有氧運動', desc: '跑步或快走 10-15 分鐘', baseReward: 10, category: 'fitness', requirePhoto: true },

        // ———— 🏥 西醫 ————
        { id: 'western_ai', name: '🤖 西醫錄影 → AI 轉講義', desc: '把一堂課錄影用 AI 轉成自學講義', baseReward: 20, category: 'study', requirePhoto: true },
        { id: 'western_absorb', name: '🏥 西醫講義吸收', desc: '讀完一份 AI 產出的講義', baseReward: 15, category: 'study', requirePhoto: true },
        { id: 'western_obsidian', name: '📋 西醫筆記整理', desc: '把吸收的西醫內容整理到 Obsidian', baseReward: 15, category: 'study', requirePhoto: true },

        // ———— 😴 休息（唯一不需要拍照） ————
        { id: 'rest_quality', name: '😴 合法休息', desc: '完成日課最低要求後，好好休息', baseReward: 15, category: 'rest', requirePhoto: false },
    ],

    // === 每日最低日課（完成這些才能抽寶箱） ===
    dailyMinimum: 3, // 至少完成 3 個任務

    // === 連續天數加成 ===
    streaks: [
        { days: 3, bonus: 0.10, label: '🔥 3 天連續 +10%' },
        { days: 7, bonus: 0.25, label: '🔥 7 天連續 +25%' },
        { days: 14, bonus: 0.50, label: '🔥🔥 14 天連續 +50%' },
        { days: 30, bonus: 0.75, label: '🔥🔥🔥 30 天連續 +75%' },
    ],

    // === 寶箱系統 ===
    gacha: {
        baseProbabilities: { copper: 0.60, silver: 0.25, gold: 0.12, legendary: 0.03 },
        chests: {
            copper: {
                emoji: '🟫', name: '銅箱', color: '#cd7f32', rewards: [
                    '🧋 外送飲料券', '� 豁免券（明日 pass 1 任務）', '明日某任務靈石 ×1.5', '+20 靈石', '☕ 下午茶自由時間',
                ]
            },
            silver: {
                emoji: '⬜', name: '銀箱', color: '#c0c0c0', rewards: [
                    '+50 靈石', '🧋 外送飲料券 ×2', '🍔 MOS 爽吃券', '🎫 豁免券 ×2', '商城 85 折券',
                ]
            },
            gold: {
                emoji: '🟨', name: '金箱', color: '#ffd700', rewards: [
                    '� MOS 爽吃券 + 飲料', '+100 靈石', '👕 購衣基金 +$200', '🎫 豁免券 ×3', '明日所有任務靈石 ×2',
                ]
            },
            legendary: {
                emoji: '💎', name: '傳說箱', color: '#9b59b6', rewards: [
                    '🎉 自由日券（存著隨時用）', '🛍️ 購物基金 +$1000', '🍜 大餐基金 +$500', '� 豁免券 ×5（一週份）', '🎁 週末半日自由行',
                ]
            },
        },
    },

    // === 商城物品池（每週隨機上架 5-6 個） ===
    shopItems: [
        { id: 's1', name: '🧋 外送飲料券', cost: 50, rarity: 'common' },
        { id: 's2', name: '🎫 豁免券（pass 1 任務）', cost: 60, rarity: 'common' },
        { id: 's3', name: '� MOS 爽吃券', cost: 100, rarity: 'common' },
        { id: 's4', name: '🧋 飲料券 ×2', cost: 90, rarity: 'uncommon' },
        { id: 's5', name: '🎫 豁免券 ×2', cost: 110, rarity: 'uncommon' },
        { id: 's6', name: '🍔 MOS 爽吃券 + 飲料', cost: 150, rarity: 'uncommon' },
        { id: 's7', name: '👕 衣服基金 +$300', cost: 200, rarity: 'uncommon' },
        { id: 's8', name: '🛍️ 逛街半天', cost: 250, rarity: 'rare' },
        { id: 's9', name: '� 大餐基金 +$500', cost: 350, rarity: 'rare' },
        { id: 's10', name: '🛍️ 購物基金 +$800', cost: 500, rarity: 'rare' },
        { id: 's11', name: '🎁 神秘寶箱（金箱保底）', cost: 300, rarity: 'rare' },
        { id: 's12', name: '� 完整自由日', cost: 800, rarity: 'epic' },
    ],
    shopSize: 6,  // 每週上架幾個

    // === 每日隨機詞條 ===
    dailyModifiers: [
        { id: 'm1', name: '經脈覺醒', desc: '📍 針灸相關任務靈石 ×1.5', effect: { type: 'category_bonus', category: 'practice', multiplier: 1.5 } },
        { id: 'm2', name: '苦修日', desc: '所有任務 ×0.8，但全部完成 +100', effect: { type: 'hard_mode', multiplier: 0.8, bonusAll: 100 } },
        { id: 'm3', name: '奇遇', desc: '🎰 今日寶箱自動升一級', effect: { type: 'gacha_upgrade' } },
        { id: 'm4', name: '休養生息', desc: '😴 只需完成 1 項即算日課完成', effect: { type: 'reduced_minimum', minimum: 1 } },
        { id: 'm5', name: '雙倍修煉', desc: '📖 讀書任務靈石 ×2', effect: { type: 'category_bonus', category: 'study', multiplier: 2 } },
        { id: 'm6', name: '鐵人日', desc: '💪 健身任務靈石 ×2', effect: { type: 'category_bonus', category: 'fitness', multiplier: 2 } },
        { id: 'm7', name: '平凡的一天', desc: '無特殊效果，穩穩推進', effect: { type: 'none' } },
        { id: 'm8', name: '幸運之日', desc: '🍀 所有任務靈石 +15', effect: { type: 'flat_bonus', bonus: 15 } },
        { id: 'm9', name: '專注之力', desc: '🧠 完成第一個任務後，後續任務 +20%', effect: { type: 'momentum', bonusAfterFirst: 0.2 } },
        { id: 'm10', name: '商人來訪', desc: '🏪 今日商城刷新，出現限時特價', effect: { type: 'shop_refresh' } },
    ],

    // === 技能樹 ===
    skillTrees: {
        acupuncture: {
            name: '針道', emoji: '📍', desc: '針灸 + 傷科',
            tiers: [
                {
                    tier: 1, reqLevel: 1, skills: [
                        { id: 'acu_t1_1', name: '經絡入門', desc: 'Anki 複習效率 +20%（只需 12 分鐘）', effect: { type: 'quest_modify', questId: 'anki_acupoints', rewardBonus: 3 } },
                        { id: 'acu_t1_2', name: '粗通手法', desc: '傷科練習靈石 +15', effect: { type: 'quest_modify', questId: 'practice_shangke', rewardBonus: 15 } },
                    ]
                },
                {
                    tier: 2, reqLevel: 5, skills: [
                        { id: 'acu_t2_1', name: '穴位直覺', desc: '每完成 50 張 Anki 卡觸發免費寶箱', effect: { type: 'milestone_gacha', threshold: 50 } },
                        { id: 'acu_t2_2', name: '結構之眼', desc: '傷科 20 動全部整理完 → +100 靈石', effect: { type: 'milestone_bonus', bonus: 100 } },
                    ]
                },
                {
                    tier: 3, reqLevel: 10, skills: [
                        { id: 'acu_t3_1', name: '針感初成', desc: '每次實操練習靈石 ×1.5', effect: { type: 'quest_multiply', questId: 'practice_needle', multiplier: 1.5 } },
                        { id: 'acu_t3_2', name: '雙修之道', desc: '同天練針灸+傷科 → +50 靈石', effect: { type: 'combo_bonus', quests: ['practice_needle', 'practice_shangke'], bonus: 50 } },
                    ]
                },
                {
                    tier: 4, reqLevel: 15, skills: [
                        { id: 'acu_t4_1', name: '針道通神', desc: '解鎖「臨床模擬挑戰」每週任務', effect: { type: 'unlock_quest' } },
                    ]
                },
            ],
        },
        herbal: {
            name: '經方', emoji: '📖', desc: '傷寒 + 溫病',
            tiers: [
                {
                    tier: 1, reqLevel: 1, skills: [
                        { id: 'herb_t1_1', name: '六經初識', desc: 'Obsidian 筆記靈石 +10', effect: { type: 'quest_modify', questId: 'wenbing_notes', rewardBonus: 10 } },
                        { id: 'herb_t1_2', name: '溫病入門', desc: '完成劉景源任一章節 → 寶箱', effect: { type: 'milestone_gacha', threshold: 1 } },
                    ]
                },
                {
                    tier: 2, reqLevel: 5, skills: [
                        { id: 'herb_t2_1', name: '方證連結', desc: '讀經方實驗錄時猜方挑戰，猜對 +30', effect: { type: 'challenge_bonus', bonus: 30 } },
                        { id: 'herb_t2_2', name: '縱橫之術', desc: '開始讀溫病縱橫 → 解鎖每週對比筆記任務', effect: { type: 'unlock_quest' } },
                    ]
                },
                {
                    tier: 3, reqLevel: 10, skills: [
                        { id: 'herb_t3_1', name: '融會貫通', desc: '完成 5 篇對比筆記 → +200 靈石', effect: { type: 'milestone_bonus', bonus: 200 } },
                        { id: 'herb_t3_2', name: '精讀心法', desc: '閱讀任務靈石 ×1.5', effect: { type: 'quest_multiply', questId: 'wenbing_study', multiplier: 1.5 } },
                    ]
                },
                {
                    tier: 4, reqLevel: 15, skills: [
                        { id: 'herb_t4_1', name: '仲景傳人', desc: '解鎖「虛擬問診」挑戰', effect: { type: 'unlock_quest' } },
                    ]
                },
            ],
        },
        physique: {
            name: '體魄', emoji: '💪', desc: '健身 + 體能',
            tiers: [
                {
                    tier: 1, reqLevel: 1, skills: [
                        { id: 'phy_t1_1', name: '鐵人初階', desc: '健身打卡靈石 +10', effect: { type: 'quest_modify', questId: 'gym_workout', rewardBonus: 10 } },
                        { id: 'phy_t1_2', name: '跑者之心', desc: '有氧任務靈石 +10', effect: { type: 'quest_modify', questId: 'cardio', rewardBonus: 10 } },
                    ]
                },
                {
                    tier: 2, reqLevel: 5, skills: [
                        { id: 'phy_t2_1', name: '連續打卡', desc: '一週 3 練完成 → 週末寶箱升級', effect: { type: 'weekly_gacha_upgrade', threshold: 3 } },
                        { id: 'phy_t2_2', name: '深蹲之王', desc: '腿日靈石 ×2', effect: { type: 'quest_multiply', questId: 'gym_workout', multiplier: 2 } },
                    ]
                },
                {
                    tier: 3, reqLevel: 10, skills: [
                        { id: 'phy_t3_1', name: '鋼鐵意志', desc: '一週 4 練 → 觸發超級商城', effect: { type: 'unlock_super_shop' } },
                    ]
                },
            ],
        },
        western: {
            name: '通識', emoji: '🏥', desc: '西醫課程',
            tiers: [
                {
                    tier: 1, reqLevel: 1, skills: [
                        { id: 'west_t1_1', name: '自動修煉', desc: 'AI 整理靈石 +10', effect: { type: 'quest_modify', questId: 'western_ai', rewardBonus: 10 } },
                        { id: 'west_t1_2', name: '筆記達人', desc: '西醫 Obsidian 靈石 +15', effect: { type: 'quest_modify', questId: 'western_obsidian', rewardBonus: 15 } },
                    ]
                },
                {
                    tier: 2, reqLevel: 5, skills: [
                        { id: 'west_t2_1', name: '融會西醫', desc: '每完成 5 堂整理 → 寶箱 + INT +1', effect: { type: 'milestone_gacha', threshold: 5 } },
                    ]
                },
            ],
        },
    },

    // === 稱號 ===
    titles: [
        { id: 't0', name: '毫無頭緒的見習生', condition: 'default', desc: '起始稱號' },
        { id: 't1', name: '經絡行者', condition: 'anki_count >= 100', desc: '累計 Anki 複習 100 次' },
        { id: 't2', name: '鐵臂書生', condition: 'gym_streak >= 28', desc: '連續健身打卡 4 週' },
        { id: 't3', name: '傷寒初悟', condition: 'study_count >= 30', desc: '完成 30 天讀書任務' },
        { id: 't4', name: '雙修奇才', condition: 'combo_day >= 5', desc: '5 天內完成 3 條主線' },
        { id: 't5', name: '休息也是修煉', condition: 'rest_streak >= 7', desc: '連續 7 天有觸發休息' },
        { id: 't6', name: '歐洲人', condition: 'legendary_pull >= 1', desc: '抽到傳說寶箱' },
        { id: 't7', name: '氪金戰士', condition: 'total_spent >= 2000', desc: '商城累計消費 2000 靈石' },
        { id: 't8', name: '十八般武藝', condition: 'all_quests_one_day >= 1', desc: '一天內完成所有任務' },
        { id: 't9', name: '不動如山', condition: 'streak >= 30', desc: '連續打卡 30 天' },
        { id: 't10', name: '大醫精誠', condition: 'level >= 20', desc: '達到 Lv.20' },
    ],

    // === 稀有度顏色 ===
    rarityColors: {
        common: '#aaaaaa',
        uncommon: '#55cc55',
        rare: '#5588ff',
        epic: '#aa44ff',
        legendary: '#ffaa00',
    },
};
