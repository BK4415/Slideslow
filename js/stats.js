/**
 * STATS MANAGER - TRACKS RECORDS & PERSISTENCE
 */
const StatsManager = {
    // Initial Data Structure
    data: {
        gamesPlayed: 0,
        completionRate: 0,
        bestTimes: {}, // e.g., "4x4-CLASSIC": 120 (seconds)
        bestMoves: {},
        currentStreak: 0,
        longestStreak: 0,
        favMode: "Classic",
        lastPlayed: null
    },

    init() {
        const saved = localStorage.getItem('slide_puzzle_stats');
        if (saved) {
            this.data = JSON.parse(saved);
        }
        this.updateDashboardUI();
    },

    saveRecord(size, mode, moves, timeSeconds) {
        const key = `${size}x${size}-${mode}`;
        
        // Update Best Moves
        if (!this.data.bestMoves[key] || moves < this.data.bestMoves[key]) {
            this.data.bestMoves[key] = moves;
        }

        // Update Best Time
        if (!this.data.bestTimes[key] || timeSeconds < this.data.bestTimes[key]) {
            this.data.bestTimes[key] = timeSeconds;
        }

        this.data.gamesPlayed++;
        this.data.lastPlayed = { size, mode, moves, timeSeconds, date: Date.now() };
        
        localStorage.setItem('slide_puzzle_stats', JSON.stringify(this.data));
        this.updateDashboardUI();
    },

    updateDashboardUI() {
        document.getElementById('stat-played').innerText = this.data.gamesPlayed;
        
        // Find overall best time across any 4x4 classic
        const bestTime = this.data.bestTimes["4x4-CLASSIC"];
        if (bestTime) {
            const m = Math.floor(bestTime / 60).toString().padStart(2, '0');
            const s = (bestTime % 60).toString().padStart(2, '0');
            document.getElementById('stat-best-time').innerText = `${m}:${s}`;
        }
        
        // Update Achievements (Simple logic)
        const achContainer = document.getElementById('achievements-list');
        achContainer.innerHTML = '';
        if (this.data.gamesPlayed >= 1) this.addAchievement('First Slide', 'Completed your first game.');
        if (this.data.gamesPlayed >= 10) this.addAchievement('Puzzle Master', 'Completed 10 games.');
    },

    addAchievement(title, desc) {
        const achContainer = document.getElementById('achievements-list');
        achContainer.innerHTML += `
            <div class="ach-item">
                <div class="ach-icon">${ICONS.star}</div>
                <div class="ach-text">
                    <strong>${title}</strong>
                    <span>${desc}</span>
                </div>
            </div>
        `;
    }
};

StatsManager.init();
