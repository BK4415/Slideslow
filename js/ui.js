const UI = {
    state: { size: 4, style: 'NUMBER', mode: 'CLASSIC', image: null },
    
    init() {
        this.setupSwipes();
        this.updatePreview();
        
        // Auto-close loading
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 2000);

        document.getElementById('btn-play').onclick = () => this.startGame();
    },

    togglePanel(id, show) {
        document.getElementById(id).classList.toggle('active', show);
    },

    setupSwipes() {
        let startX = 0;
        document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
        document.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - startX;
            if (diff > 100) this.togglePanel('panel-info', true);
            if (diff < -100) this.togglePanel('panel-dash', true);
        });
    },

    changeSize(dir) {
        this.state.size = Math.max(3, Math.min(7, this.state.size + dir));
        document.getElementById('label-size').innerText = `${this.state.size} × ${this.state.size}`;
        this.updatePreview();
    },

    changeStyle(dir) {
        this.state.style = this.state.style === 'NUMBER' ? 'PHOTO' : 'NUMBER';
        document.getElementById('label-style').innerText = this.state.style;
        document.getElementById('mode-selector-wrap').style.display = 
            this.state.style === 'PHOTO' ? 'none' : 'flex';
        this.updatePreview();
    },

    updatePreview() {
        const prev = document.getElementById('preview-board');
        prev.innerHTML = '';
        prev.style.display = 'grid';
        prev.style.gridTemplateColumns = `repeat(${this.state.size}, 1fr)`;
        const total = this.state.size * this.state.size;
        for(let i=0; i<total-1; i++) {
            const d = document.createElement('div');
            d.className = 'tile-preview';
            if(this.state.style === 'NUMBER') d.innerText = i+1;
            prev.appendChild(d);
        }
    },

    startGame() {
        document.getElementById('view-home').classList.remove('active');
        document.getElementById('view-game').classList.add('active');
        const board = document.getElementById('game-board-wrapper');
        const size = document.querySelector('.app-frame').offsetWidth - 40;
        board.style.width = size + 'px';
        board.style.height = size + 'px';
        
        engine.init(board, this.state.size, this.state.mode, this.state.style === 'PHOTO', this.state.image);
    }
};

UI.init();
