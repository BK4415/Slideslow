/**
 * STATISTICS & RECORD MANAGER
 */
const Stats = {
    data: {
        bestTimes: {},   // Key format: "4x4-CLASSIC"
        bestMoves: {},
        gamesPlayed: 0,
        totalWins: 0,
        achievements: []
    },

    init() {
        const saved = localStorage.getItem('wood_slide_stats');
        if (saved) {
            this.data = JSON.parse(saved);
        }
        this.updateDashboard();
    },

    saveWin(size, mode, moves, timeStr) {
        const key = `${size}x${size}-${mode}`;
        
        // Convert time string "MM:SS" to total seconds
        const parts = timeStr.split(':');
        const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);

        // Update Best Moves
        if (!this.data.bestMoves[key] || moves < this.data.bestMoves[key]) {
            this.data.bestMoves[key] = moves;
        }

        // Update Best Time
        if (!this.data.bestTimes[key] || seconds < this.data.bestTimes[key]) {
            this.data.bestTimes[key] = seconds;
        }

        this.data.gamesPlayed++;
        this.data.totalWins++;
        
        // Save to LocalStorage
        localStorage.setItem('wood_slide_stats', JSON.stringify(this.data));
        
        // Save "Resume" info as the "Last Played" record
        localStorage.setItem('wood_slide_last', JSON.stringify({
            size, mode, moves, time: timeStr, timestamp: Date.now()
        }));

        this.updateDashboard();
    },

    updateDashboard() {
        const bestTimeEl = document.getElementById('stat-best-time');
        const bestMovesEl = document.getElementById('stat-best-moves');
        const playedEl = document.getElementById('stat-games-played');
        const winRateEl = document.getElementById('stat-completion');

        // Display overall stats in Dashboard Panel
        playedEl.innerText = this.data.gamesPlayed;
        winRateEl.innerText = this.data.gamesPlayed > 0 ? 
            Math.round((this.data.totalWins / this.data.gamesPlayed) * 100) + "%" : "0%";

        // Find the absolute best time/moves recorded across all categories
        const times = Object.values(this.data.bestTimes);
        if (times.length > 0) {
            const minTime = Math.min(...times);
            const m = Math.floor(minTime / 60).toString().padStart(2, '0');
            const s = (minTime % 60).toString().padStart(2, '0');
            bestTimeEl.innerText = `${m}:${s}`;
        }

        const moves = Object.values(this.data.bestMoves);
        if (moves.length > 0) {
            bestMovesEl.innerText = Math.min(...moves);
        }

        this.checkAchievements();
    },

    checkAchievements() {
        const list = document.getElementById('achievements-list');
        list.innerHTML = '';
        
        const possible = [
            { id: 'first', title: 'Novice', req: this.data.totalWins >= 1, desc: 'First puzzle solved' },
            { id: 'pro', title: 'Puzzle Pro', req: this.data.totalWins >= 10, desc: '10 puzzles solved' },
            { id: 'master', title: 'Grandmaster', req: this.data.totalWins >= 50, desc: '50 puzzles solved' }
        ];

        possible.forEach(ach => {
            if (ach.req) {
                list.innerHTML += `
                    <div class="ach-card">
                        <div class="ach-icon">${UI.icons.star}</div>
                        <div class="ach-info">
                            <strong>${ach.title}</strong>
                            <span>${ach.desc}</span>
                        </div>
                    </div>
                `;
            }
        });
    }
};

// Initialize on load
Stats.init();

// Resume logic check
window.addEventListener('load', () => {
    const last = localStorage.getItem('wood_slide_last');
    if (last) {
        const data = JSON.parse(last);
        document.getElementById('resume-container').classList.remove('hidden');
        document.getElementById('resume-info').innerText = `Last: ${data.size}x${data.size} ${data.mode}`;
    }
});
