/**
 * UI CONTROLLER
 * Manages Navigation, Icons, Selectors, and Popups
 */

const UI = {
    state: {
        currentStyle: 'NUMBER', // NUMBER or PHOTO
        currentSize: 4,
        currentMode: 'CLASSIC',
        customImage: null,
        isPaused: false
    },

    // 1. PREMIUM SVG ICON LIBRARY
    icons: {
        info: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/></svg>`,
        dash: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,3V9H21V3H13M13,21H21V11H13V21M3,21H11V15H3V21M3,13H11V3H3V13Z"/></svg>`,
        shuffle: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14.83,13.41L13.42,14.82L16.59,18H15A5,5 0 0,1 10,13V11A3,3 0 0,0 7,8H2V10H7A1,1 0 0,1 8,11V13A5,5 0 0,0 13,18H15V21L19,17L15,13V16H16.59L14.83,13.41M19,7L15,3V6H13.41L11,8.41L12.41,9.83L14.83,7.41L15,7.59V11H17V7.59L18.59,6L15,6V7H19M2,14H7A3,3 0 0,0 10,11L8.59,9.58A1,1 0 0,1 7,10H2V12H7V14H2Z"/></svg>`,
        undo: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.13,8 12.5,8Z"/></svg>`,
        pause: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>`,
        play: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>`,
        close: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>`,
        timer: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/></svg>`,
        moves: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15,11H13V5H15M19,11H17V5H19M11,11H9V5H11M7,11H5V5H7M15,19H13V13H15M19,19H17V13H19M11,19H9V13H11M7,19H5V13H7M21,1H3A2,2 0 0,0 1,3V21A2,2 0 0,0 3,23H21A2,2 0 0,0 23,21V3A2,2 0 0,0 21,1Z"/></svg>`,
        star: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>`,
        upload: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"/></svg>`
    },

    init() {
        this.injectIcons();
        this.setupEventListeners();
        this.setupSwipeHandling();
        this.updatePreview();
        
        // Safety: Auto-remove loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.remove('active');
        }, 1000);
    },

    injectIcons() {
        document.getElementById('nav-info-btn').innerHTML = this.icons.info;
        document.getElementById('nav-dash-btn').innerHTML = this.icons.dash;
        document.getElementById('prev-style').innerHTML = "◀";
        document.getElementById('next-style').innerHTML = "▶";
        document.getElementById('prev-size').innerHTML = "◀";
        document.getElementById('next-size').innerHTML = "▶";
        document.getElementById('prev-mode').innerHTML = "◀";
        document.getElementById('next-mode').innerHTML = "▶";
        document.getElementById('svg-play-icon').innerHTML = this.icons.play;
        document.getElementById('svg-moves-icon').innerHTML = this.icons.moves;
        document.getElementById('svg-timer-icon').innerHTML = this.icons.timer;
        document.getElementById('svg-upload-icon').innerHTML = this.icons.upload;
        
        document.getElementById('btn-shuffle').innerHTML = this.icons.shuffle;
        document.getElementById('btn-undo').innerHTML = this.icons.undo;
        document.getElementById('btn-pause').innerHTML = this.icons.pause;
        
        document.querySelectorAll('.close-btn').forEach(b => b.innerHTML = this.icons.close);
        document.querySelectorAll('.panel-icon-svg').forEach(el => {
            el.innerHTML = el.id.includes('info') ? this.icons.info : this.icons.dash;
        });
    },

    setupEventListeners() {
        // View Swapping
        document.getElementById('start-game-btn').onclick = () => this.startGame();
        document.getElementById('nav-info-btn').onclick = () => this.togglePanel('panel-info', true);
        document.getElementById('nav-dash-btn').onclick = () => this.togglePanel('panel-dash', true);
        document.querySelectorAll('[data-close]').forEach(b => {
            b.onclick = () => this.togglePanel(b.dataset.close, false);
        });

        // Selector Logic
        document.getElementById('next-style').onclick = () => this.cycleStyle(1);
        document.getElementById('prev-style').onclick = () => this.cycleStyle(-1);
        document.getElementById('next-size').onclick = () => this.cycleSize(1);
        document.getElementById('prev-size').onclick = () => this.cycleSize(-1);
        document.getElementById('next-mode').onclick = () => this.cycleMode(1);
        document.getElementById('prev-mode').onclick = () => this.cycleMode(-1);

        // Image Upload
        document.getElementById('trigger-upload').onclick = () => document.getElementById('image-input').click();
        document.getElementById('image-input').onchange = (e) => this.handleImage(e);

        // Game Controls
        document.getElementById('btn-shuffle').onclick = () => {
            if (engine.moves > 0) {
                if (confirm("Restart puzzle? Progress will be lost.")) engine.shuffle();
            } else {
                engine.shuffle();
            }
        };
    },

    setupSwipeHandling() {
        let startX = 0;
        const frame = document.getElementById('app-frame');
        
        frame.addEventListener('touchstart', e => startX = e.touches[0].clientX, {passive: true});
        frame.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 100) {
                if (diff > 0 && startX < 50) this.togglePanel('panel-info', true); // Swipe from left
                if (diff < 0 && startX > frame.offsetWidth - 50) this.togglePanel('panel-dash', true); // Swipe from right
            }
        }, {passive: true});
    },

    togglePanel(id, state) {
        document.getElementById(id).classList.toggle('active', state);
    },

    cycleStyle(dir) {
        this.state.currentStyle = this.state.currentStyle === 'NUMBER' ? 'PHOTO' : 'NUMBER';
        document.getElementById('current-style').innerText = this.state.currentStyle;
        
        // Requirement: Photo style supports only Classic
        const modeWrap = document.getElementById('mode-selector-container');
        const uploadWrap = document.getElementById('photo-upload-wrap');
        
        if (this.state.currentStyle === 'PHOTO') {
            modeWrap.classList.add('hidden');
            uploadWrap.classList.remove('hidden');
            this.state.currentMode = 'CLASSIC';
        } else {
            modeWrap.classList.remove('hidden');
            uploadWrap.classList.add('hidden');
        }
        this.updatePreview();
    },

    cycleSize(dir) {
        let s = this.state.currentSize + dir;
        if (s < 3) s = 7;
        if (s > 7) s = 3;
        this.state.currentSize = s;
        document.getElementById('current-size').innerText = `${s} × ${s}`;
        this.updatePreview();
    },

    cycleMode(dir) {
        const modes = ['CLASSIC', 'SNAKE', 'SPIRAL', 'UPSIDE DOWN'];
        let idx = modes.indexOf(this.state.currentMode) + dir;
        if (idx < 0) idx = modes.length - 1;
        if (idx >= modes.length) idx = 0;
        this.state.currentMode = modes[idx];
        document.getElementById('current-mode').innerText = this.state.currentMode;
        this.updatePreview();
    },

    updatePreview() {
        const board = document.getElementById('preview-board');
        board.innerHTML = '';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = `repeat(${this.state.currentSize}, 1fr)`;
        board.style.gap = '4px';

        const total = this.state.currentSize * this.state.currentSize;
        for (let i = 1; i < total; i++) {
            const dot = document.createElement('div');
            dot.style.aspectRatio = '1/1';
            dot.style.background = 'var(--wood-light)';
            dot.style.borderRadius = '2px';
            dot.style.display = 'flex';
            dot.style.alignItems = 'center';
            dot.style.justifyContent = 'center';
            dot.style.fontSize = '10px';
            dot.style.color = 'var(--wood-dark)';
            if (this.state.currentStyle === 'NUMBER') dot.innerText = i;
            board.appendChild(dot);
        }
    },

    handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const size = Math.min(img.width, img.height);
                canvas.width = 800;
                canvas.height = 800;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, 800, 800);
                this.state.customImage = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('preview-board').style.backgroundImage = `url(${this.state.customImage})`;
                document.getElementById('preview-board').style.backgroundSize = 'cover';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    },

    startGame() {
        document.getElementById('view-home').classList.remove('active');
        document.getElementById('view-game').classList.add('active');
        document.getElementById('game-board-label').innerText = `${this.state.currentSize}x${this.state.currentSize}`;
        
        engine.init(
            document.getElementById('game-board'),
            this.state.currentSize,
            this.state.currentStyle,
            this.state.currentMode,
            this.state.customImage || 'assets/images/photo1.jpg'
        );
        engine.shuffle();
    }
};

// Handle Win Event
window.addEventListener('puzzle-win', (e) => {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    modal.classList.add('active');
    content.innerHTML = `
        <div class="popup-box wooden win-anim">
            <h2 class="premium-text">CONGRATULATIONS</h2>
            <div class="stars">
                ${UI.icons.star}${UI.icons.star}${UI.icons.star}
            </div>
            <div class="win-stats">
                <p>Moves: <strong>${e.detail.moves}</strong></p>
                <p>Time: <strong>${e.detail.time}</strong></p>
            </div>
            <div class="win-btns">
                <button onclick="location.reload()">HOME</button>
                <button onclick="document.getElementById('modal-overlay').classList.remove('active'); engine.shuffle();">PLAY AGAIN</button>
            </div>
        </div>
    `;
    
    if (window.Stats) Stats.saveWin(UI.state.currentSize, UI.state.currentMode, e.detail.moves, e.detail.time);
});

UI.init();
