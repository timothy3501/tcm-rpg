// ========================================
// 中醫冒險者 — 遊戲引擎 + 頁面渲染
// ========================================

const App = {
    currentPage: 'dashboard',
    pendingPhotoQuest: null,
    pendingPhotoData: null,

    // === Initialization ===
    init() {
        const state = this.loadState();
        if (!state.player) {
            document.getElementById('name-modal').classList.remove('hidden');
            document.getElementById('name-confirm').addEventListener('click', () => this.createPlayer());
            document.getElementById('name-input').addEventListener('keydown', e => { if (e.key === 'Enter') this.createPlayer(); });
        } else {
            this.startApp();
        }
        document.getElementById('photo-input').addEventListener('change', e => this.handlePhotoSelect(e));
        setTimeout(() => { document.getElementById('loading-screen').style.display = 'none'; }, 2500);
    },

    createPlayer() {
        const name = document.getElementById('name-input').value.trim() || GAME_CONFIG.player.defaultName;
        const state = {
            player: {
                name,
                totalXP: 0,
                currency: 0,
                level: 1,
                skillPoints: 0,
                attributes: {},
                currentTitle: 't0',
                unlockedTitles: ['t0'],
                unlockedSkills: [],
            },
            quests: {},
            streak: { count: 0, lastDate: null },
            gacha: { history: [], lastFreeDate: null },
            shop: { currentItems: [], lastRefresh: null, purchaseHistory: [] },
            dailyModifier: { date: null, modifierId: null },
            stats: { totalQuestsCompleted: 0, totalCurrencyEarned: 0, totalCurrencySpent: 0, legendaryPulls: 0, photos: [] },
        };
        this.saveState(state);
        document.getElementById('name-modal').classList.add('hidden');
        this.startApp();
    },

    startApp() {
        document.getElementById('app').classList.remove('hidden');
        this.ensureDailyReset();
        this.updateHeader();
        this.navigate('dashboard');
    },

    // === State Management ===
    loadState() { try { return JSON.parse(localStorage.getItem('tcm_rpg_state') || '{}'); } catch { return {}; } },
    saveState(state) { localStorage.setItem('tcm_rpg_state', JSON.stringify(state)); },
    getState() { return this.loadState(); },
    setState(fn) { const s = this.getState(); fn(s); this.saveState(s); this.updateHeader(); },

    // === Daily Reset ===
    ensureDailyReset() {
        const today = this.getToday();
        this.setState(s => {
            const lastQuestDate = s.quests._date;
            if (lastQuestDate !== today) {
                // Update streak
                const yesterday = this.getDateStr(new Date(Date.now() - 86400000));
                if (s.streak.lastDate === yesterday) {
                    // streak continues
                } else if (s.streak.lastDate !== today) {
                    s.streak.count = 0; // broken
                }
                s.quests = { _date: today };
            }
            // Daily modifier
            if (s.dailyModifier.date !== today) {
                const mods = GAME_CONFIG.dailyModifiers;
                s.dailyModifier = { date: today, modifierId: mods[Math.floor(Math.random() * mods.length)].id };
            }
            // Shop refresh (weekly, every Monday)
            if (!s.shop.lastRefresh || this.daysSince(s.shop.lastRefresh) >= 7) {
                s.shop.currentItems = this.generateShopItems();
                s.shop.lastRefresh = today;
            }
        });
    },

    generateShopItems() {
        const pool = [...GAME_CONFIG.shopItems];
        const items = [];
        const count = GAME_CONFIG.shopSize;
        for (let i = 0; i < count && pool.length > 0; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            items.push({ ...pool.splice(idx, 1)[0], sold: false });
        }
        return items;
    },

    // === Date Utils ===
    getToday() { return this.getDateStr(new Date()); },
    getDateStr(d) { return d.toISOString().split('T')[0]; },
    daysSince(dateStr) { return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000); },

    // === Game Logic ===
    calculateReward(quest) {
        const s = this.getState();
        let reward = quest.baseReward;
        // Skill bonuses
        for (const sid of s.player.unlockedSkills) {
            const skill = this.findSkillById(sid);
            if (!skill) continue;
            if (skill.effect.type === 'quest_modify' && skill.effect.questId === quest.id) {
                reward += skill.effect.rewardBonus || 0;
            }
            if (skill.effect.type === 'quest_multiply' && skill.effect.questId === quest.id) {
                reward = Math.round(reward * skill.effect.multiplier);
            }
        }
        // Daily modifier
        const mod = this.getCurrentModifier();
        if (mod) {
            if (mod.effect.type === 'category_bonus' && mod.effect.category === quest.category) {
                reward = Math.round(reward * mod.effect.multiplier);
            }
            if (mod.effect.type === 'flat_bonus') reward += mod.effect.bonus;
            if (mod.effect.type === 'hard_mode') reward = Math.round(reward * mod.effect.multiplier);
        }
        // Streak bonus
        const streakBonus = this.getStreakBonus(s.streak.count);
        reward = Math.round(reward * (1 + streakBonus));
        return reward;
    },

    getStreakBonus(count) {
        let bonus = 0;
        for (const s of GAME_CONFIG.streaks) { if (count >= s.days) bonus = s.bonus; }
        return bonus;
    },

    getCurrentModifier() {
        const s = this.getState();
        return GAME_CONFIG.dailyModifiers.find(m => m.id === s.dailyModifier.modifierId) || null;
    },

    getDailyMinimum() {
        const mod = this.getCurrentModifier();
        if (mod && mod.effect.type === 'reduced_minimum') return mod.effect.minimum;
        return GAME_CONFIG.dailyMinimum;
    },

    getCompletedCount() {
        const s = this.getState();
        return Object.keys(s.quests).filter(k => k !== '_date' && s.quests[k]).length;
    },

    completeQuest(questId) {
        const quest = GAME_CONFIG.quests.find(q => q.id === questId);
        if (!quest) return;
        if (quest.requirePhoto) {
            this.pendingPhotoQuest = questId;
            document.getElementById('photo-quest-name').textContent = quest.name;
            document.getElementById('photo-modal').classList.remove('hidden');
            return;
        }
        this.finalizeQuestCompletion(questId);
    },

    finalizeQuestCompletion(questId) {
        const quest = GAME_CONFIG.quests.find(q => q.id === questId);
        const reward = this.calculateReward(quest);
        this.setState(s => {
            s.quests[questId] = true;
            s.player.currency += reward;
            s.player.totalXP += reward;
            s.stats.totalQuestsCompleted++;
            s.stats.totalCurrencyEarned += reward;
            // Check level up
            this.checkLevelUp(s);
            // Update streak
            const today = this.getToday();
            const completedCount = Object.keys(s.quests).filter(k => k !== '_date' && s.quests[k]).length;
            if (completedCount >= this.getDailyMinimum()) {
                if (s.streak.lastDate !== today) {
                    s.streak.count++;
                    s.streak.lastDate = today;
                }
            }
            // Hard mode bonus
            const mod = this.getCurrentModifier();
            if (mod && mod.effect.type === 'hard_mode') {
                const allDone = GAME_CONFIG.quests.every(q => s.quests[q.id]);
                if (allDone) {
                    s.player.currency += mod.effect.bonusAll;
                    s.player.totalXP += mod.effect.bonusAll;
                    s.stats.totalCurrencyEarned += mod.effect.bonusAll;
                }
            }
        });
        this.renderPage();
    },

    uncompleteQuest(questId) {
        this.setState(s => {
            if (!s.quests[questId]) return;
            const quest = GAME_CONFIG.quests.find(q => q.id === questId);
            const reward = this.calculateReward(quest);
            s.quests[questId] = false;
            s.player.currency = Math.max(0, s.player.currency - reward);
            s.player.totalXP = Math.max(0, s.player.totalXP - reward);
            s.stats.totalQuestsCompleted = Math.max(0, s.stats.totalQuestsCompleted - 1);
            this.checkLevelUp(s);
        });
        this.renderPage();
    },

    checkLevelUp(s) {
        const levels = GAME_CONFIG.levels;
        let newLevel = 1;
        for (const l of levels) { if (s.player.totalXP >= l.xp) newLevel = l.level; }
        if (newLevel > s.player.level) {
            const gained = newLevel - s.player.level;
            s.player.skillPoints += gained;
            s.player.level = newLevel;
        } else {
            s.player.level = newLevel;
        }
    },

    // === Photo ===
    handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            this.pendingPhotoData = ev.target.result;
            document.getElementById('photo-img').src = ev.target.result;
            document.getElementById('photo-preview').classList.remove('hidden');
            document.getElementById('photo-confirm').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    },

    confirmPhoto() {
        if (this.pendingPhotoQuest && this.pendingPhotoData) {
            const questId = this.pendingPhotoQuest;
            this.setState(s => {
                s.stats.photos.push({ questId, date: this.getToday(), data: this.pendingPhotoData.substring(0, 200) + '...' });
            });
            this.closePhotoModal();
            this.finalizeQuestCompletion(questId);
        }
    },

    closePhotoModal() {
        document.getElementById('photo-modal').classList.add('hidden');
        document.getElementById('photo-preview').classList.add('hidden');
        document.getElementById('photo-confirm').classList.add('hidden');
        document.getElementById('photo-input').value = '';
        this.pendingPhotoQuest = null;
        this.pendingPhotoData = null;
    },

    // === Gacha ===
    canPullGacha() {
        const s = this.getState();
        return s.gacha.lastFreeDate !== this.getToday() && this.getCompletedCount() >= this.getDailyMinimum();
    },

    pullGacha() {
        if (!this.canPullGacha()) return;
        const s = this.getState();
        const probs = { ...GAME_CONFIG.gacha.baseProbabilities };
        // Modifier upgrade
        const mod = this.getCurrentModifier();
        let upgradeChest = false;
        if (mod && mod.effect.type === 'gacha_upgrade') upgradeChest = true;
        // Roll
        const roll = Math.random();
        let chestType = 'copper';
        if (roll < probs.legendary) chestType = 'legendary';
        else if (roll < probs.legendary + probs.gold) chestType = 'gold';
        else if (roll < probs.legendary + probs.gold + probs.silver) chestType = 'silver';
        if (upgradeChest) {
            if (chestType === 'copper') chestType = 'silver';
            else if (chestType === 'silver') chestType = 'gold';
            else if (chestType === 'gold') chestType = 'legendary';
        }
        const chest = GAME_CONFIG.gacha.chests[chestType];
        const reward = chest.rewards[Math.floor(Math.random() * chest.rewards.length)];
        this.setState(s2 => {
            s2.gacha.lastFreeDate = this.getToday();
            s2.gacha.history.unshift({ date: this.getToday(), type: chestType, reward });
            if (s2.gacha.history.length > 30) s2.gacha.history = s2.gacha.history.slice(0, 30);
            if (chestType === 'legendary') s2.stats.legendaryPulls = (s2.stats.legendaryPulls || 0) + 1;
        });
        this.showGachaAnimation(chestType, chest, reward);
    },

    showGachaAnimation(type, chest, reward) {
        const modal = document.getElementById('gacha-modal');
        const anim = document.getElementById('gacha-animation');
        const result = document.getElementById('gacha-result');
        const chestTypeEl = document.getElementById('gacha-chest-type');
        const rewardEl = document.getElementById('gacha-reward-text');
        result.classList.add('hidden');
        anim.innerHTML = '📦';
        anim.style.animation = 'chestBounce 0.3s ease infinite';
        modal.classList.remove('hidden');
        setTimeout(() => {
            anim.style.animation = 'chestOpen 0.5s ease';
            anim.innerHTML = chest.emoji;
            setTimeout(() => {
                anim.style.animation = '';
                result.classList.remove('hidden');
                chestTypeEl.textContent = chest.name;
                chestTypeEl.style.color = chest.color;
                rewardEl.textContent = reward;
            }, 500);
        }, 1500);
    },

    closeGachaModal() {
        document.getElementById('gacha-modal').classList.add('hidden');
        this.renderPage();
    },

    // === Shop ===
    buyShopItem(idx) {
        this.setState(s => {
            const item = s.shop.currentItems[idx];
            if (!item || item.sold || s.player.currency < item.cost) return;
            s.player.currency -= item.cost;
            s.shop.currentItems[idx].sold = true;
            s.stats.totalCurrencySpent += item.cost;
            s.shop.purchaseHistory.push({ ...item, date: this.getToday() });
        });
        this.renderPage();
    },

    // === Skills ===
    unlockSkill(skillId) {
        this.setState(s => {
            if (s.player.skillPoints <= 0) return;
            if (s.player.unlockedSkills.includes(skillId)) return;
            const skill = this.findSkillById(skillId);
            if (!skill) return;
            // Check tier req
            const tree = this.findTreeForSkill(skillId);
            if (!tree) return;
            const tier = tree.tiers.find(t => t.skills.some(sk => sk.id === skillId));
            if (tier.reqLevel > s.player.level) return;
            // Check prerequisite (need at least one from previous tier)
            if (tier.tier > 1) {
                const prevTier = tree.tiers.find(t => t.tier === tier.tier - 1);
                const hasPrev = prevTier && prevTier.skills.some(sk => s.player.unlockedSkills.includes(sk.id));
                if (!hasPrev) return;
            }
            s.player.unlockedSkills.push(skillId);
            s.player.skillPoints--;
            // Apply milestone bonus effects
            if (skill.effect.type === 'milestone_bonus') {
                s.player.currency += skill.effect.bonus;
                s.player.totalXP += skill.effect.bonus;
                s.stats.totalCurrencyEarned += skill.effect.bonus;
            }
        });
        this.renderPage();
    },

    findSkillById(id) {
        for (const tree of Object.values(GAME_CONFIG.skillTrees)) {
            for (const tier of tree.tiers) {
                const skill = tier.skills.find(s => s.id === id);
                if (skill) return skill;
            }
        }
        return null;
    },

    findTreeForSkill(id) {
        for (const tree of Object.values(GAME_CONFIG.skillTrees)) {
            for (const tier of tree.tiers) {
                if (tier.skills.some(s => s.id === id)) return tree;
            }
        }
        return null;
    },

    // === Navigation ===
    navigate(page) {
        this.currentPage = page;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
        this.renderPage();
    },

    renderPage() {
        const content = document.getElementById('page-content');
        this.updateHeader();
        switch (this.currentPage) {
            case 'dashboard': content.innerHTML = this.renderDashboard(); break;
            case 'quests': content.innerHTML = this.renderQuests(); break;
            case 'character': content.innerHTML = this.renderCharacter(); break;
            case 'skills': content.innerHTML = this.renderSkills(); break;
            case 'shop': content.innerHTML = this.renderShop(); break;
            default: content.innerHTML = this.renderDashboard();
        }
    },

    updateHeader() {
        const s = this.getState();
        if (!s.player) return;
        document.getElementById('header-level').textContent = `Lv.${s.player.level}`;
        document.getElementById('header-name').textContent = s.player.name;
        document.getElementById('header-currency').textContent = s.player.currency;
    },

    // === Character Sprite HTML ===
    renderCharacterSprite(size = '', showPlate = false) {
        const s = this.getState();
        const title = GAME_CONFIG.titles.find(t => t.id === s.player.currentTitle);
        let html = `<div class="character-container ${size}">`;
        if (showPlate) {
            html += `<div class="character-name-plate">Lv.${s.player.level} ${s.player.name}</div>`;
            html += `<div class="character-title-plate">— ${title ? title.name : '冒險者'} —</div>`;
        }
        html += `<div class="pixel-character">
            <div class="char-head">
                <div class="char-hat"></div>
                <div class="char-eyes"><div class="char-eye"></div><div class="char-eye"></div></div>
                <div class="char-mouth"></div>
            </div>
            <div class="char-body"></div>
            <div class="char-sash"></div>
            <div class="char-arm-l"></div>
            <div class="char-arm-r"></div>
            <div class="char-needle"></div>
            <div class="char-legs"><div class="char-leg"></div><div class="char-leg"></div></div>
            <div class="char-particles">
                <div class="char-particle"></div><div class="char-particle"></div>
                <div class="char-particle"></div><div class="char-particle"></div>
            </div>
        </div>`;
        html += '</div>';
        return html;
    },

    // === Page: Dashboard ===
    renderDashboard() {
        const s = this.getState();
        const mod = this.getCurrentModifier();
        const completed = this.getCompletedCount();
        const total = GAME_CONFIG.quests.length;
        const minimum = this.getDailyMinimum();
        const dayComplete = completed >= minimum;
        const streakInfo = GAME_CONFIG.streaks.filter(st => s.streak.count >= st.days).pop();
        const currentLevel = GAME_CONFIG.levels.find(l => l.level === s.player.level);
        const nextLevel = GAME_CONFIG.levels.find(l => l.level === s.player.level + 1);
        const xpForNext = nextLevel ? nextLevel.xp : currentLevel.xp;
        const xpCurrent = s.player.totalXP - (currentLevel ? currentLevel.xp : 0);
        const xpNeeded = xpForNext - (currentLevel ? currentLevel.xp : 0);
        const xpPercent = xpNeeded > 0 ? Math.min(100, (xpCurrent / xpNeeded) * 100) : 100;

        let html = '';

        // 角色小人
        html += this.renderCharacterSprite();

        // 每日詞條
        if (mod) {
            html += `<div class="modifier-card">
        <div class="modifier-title">✨ 今日詞條</div>
        <div class="modifier-name">${mod.name}</div>
        <div class="modifier-desc">${mod.desc}</div>
      </div>`;
        }

        // XP 進度
        html += `<div class="xp-bar-container">
      <div class="xp-bar-label"><span>Lv.${s.player.level}</span><span>${s.player.totalXP} / ${xpForNext} XP</span></div>
      <div class="xp-bar-bg"><div class="xp-bar-fill" style="width:${xpPercent}%"></div></div>
    </div>`;

        // 今日進度
        if (dayComplete) {
            html += `<div class="settlement-card">
        <h3>✅ 今日任務完成！</h3>
        <p>你已完成 ${completed}/${total} 個任務</p>
        <p style="margin-top:0.5rem;color:var(--text-secondary)">你可以安心休息了 😌</p>
      </div>`;
        } else {
            html += `<div class="card">
        <div class="card-title">📋 今日進度</div>
        <div class="summary-row"><span class="summary-label">已完成</span><span class="summary-value">${completed} / ${minimum} (最低)</span></div>
        <div class="summary-row"><span class="summary-label">總任務</span><span class="summary-value">${completed} / ${total}</span></div>
      </div>`;
        }

        // 連續天數
        if (s.streak.count > 0) {
            html += `<div class="streak-display">🔥 連續 ${s.streak.count} 天 ${streakInfo ? streakInfo.label : ''}</div>`;
        }


        // Gacha button
        const canPull = this.canPullGacha();
        html += `<div class="gacha-page-btn ${canPull ? '' : 'disabled'}" onclick="App.pullGacha()">
      <div class="chest-icon">📦</div>
      <div class="chest-label">${canPull ? '開啟每日寶箱！' : (this.getCompletedCount() < this.getDailyMinimum() ? `完成 ${this.getDailyMinimum()} 個任務解鎖` : '今日已開啟')}</div>
    </div>`;

        return html;
    },

    // === Page: Quests ===
    renderQuests() {
        const s = this.getState();
        let html = '<div class="card"><div class="card-title">⚔️ 每日任務</div>';
        const categories = { study: '📖 學習', practice: '📍 實操', fitness: '💪 健身', rest: '😴 休息' };
        for (const [cat, label] of Object.entries(categories)) {
            const quests = GAME_CONFIG.quests.filter(q => q.category === cat);
            if (quests.length === 0) continue;
            html += `<div style="font-family:var(--font-pixel);font-size:0.5rem;color:var(--text-secondary);margin:0.75rem 0 0.5rem">${label}</div>`;
            for (const q of quests) {
                const done = !!s.quests[q.id];
                const reward = this.calculateReward(q);
                html += `<div class="quest-item ${done ? 'completed' : ''}" onclick="App.${done ? 'uncompleteQuest' : 'completeQuest'}('${q.id}')">
          <div class="quest-checkbox">${done ? '✓' : ''}</div>
          <div class="quest-info">
            <div class="quest-name">${q.name} ${q.requirePhoto ? '<span class="quest-photo-badge">📸</span>' : ''}</div>
            <div class="quest-desc">${q.desc}</div>
          </div>
          <div class="quest-reward">💎${reward}</div>
        </div>`;
            }
        }
        html += '</div>';
        return html;
    },

    // === Page: Character ===
    renderCharacter() {
        const s = this.getState();
        const currentLevel = GAME_CONFIG.levels.find(l => l.level === s.player.level);
        const nextLevel = GAME_CONFIG.levels.find(l => l.level === s.player.level + 1);
        const title = GAME_CONFIG.titles.find(t => t.id === s.player.currentTitle);

        // 角色大展示
        let html = this.renderCharacterSprite('char-large', true);

        html += `<div class="card card-gold">
      <div class="card-title">👤 角色資訊</div>
      <div class="summary-row"><span class="summary-label">名稱</span><span class="summary-value">${s.player.name}</span></div>
      <div class="summary-row"><span class="summary-label">等級</span><span class="summary-value text-gold">Lv.${s.player.level}</span></div>
      <div class="summary-row"><span class="summary-label">稱號</span><span class="summary-value text-purple">${title ? title.name : '無'}</span></div>
      <div class="summary-row"><span class="summary-label">靈石</span><span class="summary-value text-gold">💎 ${s.player.currency}</span></div>
      <div class="summary-row"><span class="summary-label">累計 XP</span><span class="summary-value">${s.player.totalXP}</span></div>
      <div class="summary-row"><span class="summary-label">技能點</span><span class="summary-value text-green">${s.player.skillPoints} SP</span></div>
      <div class="summary-row"><span class="summary-label">連續天數</span><span class="summary-value">🔥 ${s.streak.count}</span></div>
      ${nextLevel ? `<div class="summary-row"><span class="summary-label">下一級</span><span class="summary-value">${nextLevel.xp - s.player.totalXP} XP</span></div>` : ''}
      ${currentLevel && currentLevel.reward ? `<div style="margin-top:0.5rem;padding:0.5rem;background:#111;font-size:0.8rem;color:var(--text-green)">${currentLevel.reward}</div>` : ''}
    </div>`;



        // Titles
        html += `<div class="card"><div class="card-title">🎖️ 稱號</div>`;
        for (const t of GAME_CONFIG.titles) {
            const unlocked = s.player.unlockedTitles.includes(t.id);
            const equipped = s.player.currentTitle === t.id;
            html += `<div class="title-item ${equipped ? 'equipped' : ''} ${unlocked ? '' : 'locked'}"
        ${unlocked ? `onclick="App.equipTitle('${t.id}')"` : ''}>
        <div><div class="title-name">${unlocked ? t.name : '???'}</div><div class="title-desc">${t.desc}</div></div>
        ${equipped ? '<span class="text-gold" style="font-family:var(--font-pixel);font-size:0.4rem">裝備中</span>' : ''}
      </div>`;
        }
        html += '</div>';

        // Stats
        html += `<div class="card"><div class="card-title">📈 統計</div>
      <div class="summary-row"><span class="summary-label">總完成任務</span><span class="summary-value">${s.stats.totalQuestsCompleted}</span></div>
      <div class="summary-row"><span class="summary-label">總獲得靈石</span><span class="summary-value text-gold">${s.stats.totalCurrencyEarned}</span></div>
      <div class="summary-row"><span class="summary-label">總消費靈石</span><span class="summary-value">${s.stats.totalCurrencySpent}</span></div>
      <div class="summary-row"><span class="summary-label">傳說抽獎次數</span><span class="summary-value text-purple">${s.stats.legendaryPulls || 0}</span></div>
    </div>`;

        // Reset button
        html += `<div class="text-center mt-2"><button class="pixel-btn btn-red btn-sm" onclick="if(confirm('確定要重置所有資料嗎？'))App.resetAll()">⚠️ 重置遊戲</button></div>`;

        return html;
    },

    equipTitle(titleId) {
        this.setState(s => { s.player.currentTitle = titleId; });
        this.renderPage();
    },

    resetAll() {
        localStorage.removeItem('tcm_rpg_state');
        location.reload();
    },

    // === Save Sync ===
    openSyncModal() {
        document.getElementById('sync-modal').classList.remove('hidden');
        document.getElementById('export-status').textContent = '';
        document.getElementById('import-status').textContent = '';
        document.getElementById('import-data').value = '';
    },

    closeSyncModal() {
        document.getElementById('sync-modal').classList.add('hidden');
    },

    exportSave() {
        try {
            const data = localStorage.getItem('tcm_rpg_state');
            if (!data) { document.getElementById('export-status').textContent = '❌ 沒有存檔'; return; }
            const encoded = btoa(unescape(encodeURIComponent(data)));
            navigator.clipboard.writeText(encoded).then(() => {
                document.getElementById('export-status').textContent = '✅ 已複製到剪貼簿！';
            }).catch(() => {
                // Fallback for mobile / no clipboard API
                const ta = document.createElement('textarea');
                ta.value = encoded;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                document.getElementById('export-status').textContent = '✅ 已複製到剪貼簿！';
            });
        } catch (e) {
            document.getElementById('export-status').textContent = '❌ 匯出失敗';
        }
    },

    importSave() {
        const statusEl = document.getElementById('import-status');
        try {
            const encoded = document.getElementById('import-data').value.trim();
            if (!encoded) { statusEl.textContent = '❌ 請先貼上存檔代碼'; statusEl.style.color = 'var(--text-red)'; return; }
            const decoded = decodeURIComponent(escape(atob(encoded)));
            const parsed = JSON.parse(decoded);
            if (!parsed.player) { statusEl.textContent = '❌ 無效的存檔格式'; statusEl.style.color = 'var(--text-red)'; return; }
            if (!confirm(`確定要匯入 ${parsed.player.name}（Lv.${parsed.player.level}）的存檔嗎？\n⚠️ 這會覆蓋當前進度！`)) return;
            localStorage.setItem('tcm_rpg_state', decoded);
            statusEl.textContent = '✅ 匯入成功！重新載入中...';
            statusEl.style.color = 'var(--text-green)';
            setTimeout(() => location.reload(), 1000);
        } catch (e) {
            statusEl.textContent = '❌ 代碼無效，請確認複製正確';
            statusEl.style.color = 'var(--text-red)';
        }
    },

    // === Page: Skills ===
    renderSkills() {
        const s = this.getState();
        let html = `<div class="card"><div class="card-title">🌳 技能樹</div>
      <div class="summary-row"><span class="summary-label">可用技能點</span><span class="summary-value text-green">${s.player.skillPoints} SP</span></div>
    </div>`;

        for (const [key, tree] of Object.entries(GAME_CONFIG.skillTrees)) {
            html += `<div class="skill-tree-section">
        <div class="skill-tree-header">${tree.emoji} ${tree.name} — ${tree.desc}</div>`;
            for (const tier of tree.tiers) {
                const tierLocked = s.player.level < tier.reqLevel;
                // Check if prev tier has any unlocked
                const prevTierUnlocked = tier.tier === 1 ? true : tree.tiers.find(t => t.tier === tier.tier - 1)?.skills.some(sk => s.player.unlockedSkills.includes(sk.id));
                html += `<div class="skill-tier">
          <div class="skill-tier-label">TIER ${tier.tier} — 需要 Lv.${tier.reqLevel}${tierLocked ? ' 🔒' : ''}</div>`;
                for (const skill of tier.skills) {
                    const unlocked = s.player.unlockedSkills.includes(skill.id);
                    const canUnlock = !unlocked && !tierLocked && prevTierUnlocked && s.player.skillPoints > 0;
                    const locked = !unlocked && !canUnlock;
                    html += `<div class="skill-node ${unlocked ? 'unlocked' : ''} ${locked ? 'locked' : ''}"
            ${canUnlock ? `onclick="App.unlockSkill('${skill.id}')"` : ''}>
            <div class="skill-node-icon">${unlocked ? '✅' : canUnlock ? '⭐' : '🔒'}</div>
            <div class="skill-node-info">
              <div class="skill-node-name">${skill.name}</div>
              <div class="skill-node-desc">${skill.desc}</div>
            </div>
            ${canUnlock ? '<div class="skill-sp-cost">1 SP</div>' : ''}
          </div>`;
                }
                html += '</div>';
            }
            html += '</div>';
        }
        return html;
    },

    // === Page: Shop ===
    renderShop() {
        const s = this.getState();
        const daysLeft = 7 - this.daysSince(s.shop.lastRefresh);

        let html = `<div class="card"><div class="card-title">🏪 商城</div>
      <div class="summary-row"><span class="summary-label">你的靈石</span><span class="summary-value text-gold">💎 ${s.player.currency}</span></div>
      <div class="summary-row"><span class="summary-label">商品刷新</span><span class="summary-value">${daysLeft > 0 ? daysLeft + ' 天後' : '今日刷新'}</span></div>
    </div>`;

        html += '<div class="shop-grid">';
        for (let i = 0; i < s.shop.currentItems.length; i++) {
            const item = s.shop.currentItems[i];
            const canBuy = !item.sold && s.player.currency >= item.cost;
            const rarityColor = GAME_CONFIG.rarityColors[item.rarity] || '#aaa';
            html += `<div class="shop-item" style="border-color:${item.sold ? '#333' : rarityColor};${item.sold ? 'opacity:0.4' : ''}">
        <div>
          <div class="shop-item-name">${item.name}</div>
          <div class="rarity-badge" style="color:${rarityColor};border:1px solid ${rarityColor}">${item.rarity.toUpperCase()}</div>
        </div>
        <div style="text-align:right">
          <div class="shop-item-cost">💎 ${item.cost}</div>
          ${item.sold ? '<div style="font-family:var(--font-pixel);font-size:0.4rem;color:var(--text-red);margin-top:4px">已購買</div>' :
                    canBuy ? `<button class="pixel-btn btn-gold btn-sm" style="margin-top:4px" onclick="event.stopPropagation();App.buyShopItem(${i})">購買</button>` :
                        '<div style="font-family:var(--font-pixel);font-size:0.4rem;color:var(--text-red);margin-top:4px">靈石不足</div>'}
        </div>
      </div>`;
        }
        html += '</div>';

        // Gacha section
        html += `<div class="card mt-2"><div class="card-title">🎰 寶箱紀錄</div>`;
        if (s.gacha.history.length === 0) {
            html += '<p style="color:var(--text-secondary);font-size:0.85rem">尚無紀錄</p>';
        } else {
            for (const h of s.gacha.history.slice(0, 10)) {
                const chest = GAME_CONFIG.gacha.chests[h.type];
                html += `<div class="gacha-history-item">
          <span>${chest.emoji} ${chest.name} — ${h.reward}</span>
          <span class="gacha-history-date">${h.date}</span>
        </div>`;
            }
        }
        html += '</div>';

        // Purchase history
        if (s.shop.purchaseHistory && s.shop.purchaseHistory.length > 0) {
            html += `<div class="card"><div class="card-title">🧾 購買紀錄</div>`;
            for (const p of s.shop.purchaseHistory.slice(-10).reverse()) {
                html += `<div class="gacha-history-item">
          <span>${p.name}</span>
          <span class="gacha-history-date">💎${p.cost} — ${p.date}</span>
        </div>`;
            }
            html += '</div>';
        }

        return html;
    },
};

// === Boot ===
document.addEventListener('DOMContentLoaded', () => App.init());
