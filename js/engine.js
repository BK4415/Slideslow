class SlidingEngine {
    constructor() {
        this.size = 4;
        this.tiles = [];
        this.empty = { x: 3, y: 3 };
        this.moves = 0;
        this.isLocked = false;
        this.startTime = null;
        this.timerInterval = null;
    }

    init(container, size, mode, isPhoto, image) {
        this.container = container;
        this.size = size;
        this.mode = mode;
        this.isPhoto = isPhoto;
        this.image = image;
        this.reset();
        this.createTiles();
    }

    reset() {
        this.moves = 0;
        this.isLocked = false;
        this.startTime = null;
        clearInterval(this.timerInterval);
        this.empty = { x: this.size - 1, y: this.size - 1 };
    }

    createTiles() {
        this.container.innerHTML = '';
        this.tiles = [];
        const layout = this.getLayout(this.mode);
        const tileSize = 100 / this.size;

        for (let i = 0; i < (this.size * this.size) - 1; i++) {
            const tile = {
                id: i + 1,
                x: layout[i].x, y: layout[i].y,
                cx: layout[i].x, cy: layout[i].y, // Correct positions
                el: document.createElement('div')
            };
            tile.el.className = 'tile';
            tile.el.style.width = `calc(${tileSize}% - 4px)`;
            tile.el.style.height = `calc(${tileSize}% - 4px)`;
            tile.el.dataset.id = tile.id;
            tile.el.innerHTML = `<span>${tile.id}</span>`;

            if (this.isPhoto && this.image) {
                tile.el.classList.add('photo-mode');
                tile.el.style.backgroundImage = `url(${this.image})`;
                tile.el.style.backgroundSize = `${this.size * 100}%`;
                tile.el.style.backgroundPosition = `${(tile.cx / (this.size - 1)) * 100}% ${(tile.cy / (this.size - 1)) * 100}%`;
            }

            tile.el.addEventListener('pointerdown', () => this.handleTileClick(tile));
            this.tiles.push(tile);
            this.container.appendChild(tile.el);
        }
        this.updateVisuals(true);
    }

    getLayout(mode) {
        let coords = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) coords.push({ x, y });
        }
        if (mode === 'UPSIDE DOWN') return coords.slice(0, -1).reverse();
        if (mode === 'SNAKE') {
            let snake = [];
            for (let y = 0; y < this.size; y++) {
                let row = [];
                for (let x = 0; x < this.size; x++) row.push({ x, y });
                if (y % 2 !== 0) row.reverse();
                snake.push(...row);
            }
            return snake.slice(0, -1);
        }
        return coords.slice(0, -1);
    }

    handleTileClick(tile) {
        if (this.isLocked) return;
        const affected = this.getAffectedTiles(tile);
        if (affected.length > 0) this.moveTiles(affected);
    }

    getAffectedTiles(tile) {
        let affected = [];
        if (tile.y === this.empty.y) {
            const min = Math.min(tile.x, this.empty.x);
            const max = Math.max(tile.x, this.empty.x);
            affected = this.tiles.filter(t => t.y === tile.y && t.x >= min && t.x <= max);
            affected.sort((a, b) => this.empty.x > tile.x ? b.x - a.x : a.x - b.x);
        } else if (tile.x === this.empty.x) {
            const min = Math.min(tile.y, this.empty.y);
            const max = Math.max(tile.y, this.empty.y);
            affected = this.tiles.filter(t => t.x === tile.x && t.y >= min && t.y <= max);
            affected.sort((a, b) => this.empty.y > tile.y ? b.y - a.y : a.y - b.y);
        }
        return affected;
    }

    moveTiles(tiles) {
        if (!this.startTime && this.moves === 0) this.startTimer();
        
        tiles.forEach(t => {
            const nextEmpty = { x: t.x, y: t.y };
            t.x = this.empty.x;
            t.y = this.empty.y;
            this.empty = nextEmpty;
            this.updateTileVisual(t);
        });

        this.moves++;
        document.getElementById('game-moves').innerText = this.moves;
        this.checkWin();
    }

    updateTileVisual(t) {
        t.el.style.transform = `translate(calc(${t.x * 100}% + 2px), calc(${t.y * 100}% + 2px))`;
    }

    updateVisuals(instant = false) {
        this.tiles.forEach(t => {
            if (instant) t.el.style.transition = 'none';
            else t.el.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
            this.updateTileVisual(t);
        });
    }

    shuffle() {
        this.isLocked = true;
        let count = 0;
        const max = this.size * 30;
        const walk = () => {
            const neighbors = this.tiles.filter(t => 
                (Math.abs(t.x - this.empty.x) === 1 && t.y === this.empty.y) ||
                (Math.abs(t.y - this.empty.y) === 1 && t.x === this.empty.x)
            );
            const random = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.moveTiles([random]);
            count++;
            if (count < max) requestAnimationFrame(walk);
            else {
                this.isLocked = false; this.moves = 0;
                document.getElementById('game-moves').innerText = '0';
            }
        };
        walk();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const diff = Math.floor((Date.now() - this.startTime) / 1000);
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            document.getElementById('game-timer').innerText = `${m}:${s}`;
        }, 1000);
    }

    checkWin() {
        const win = this.tiles.every(t => t.x === t.cx && t.y === t.cy);
        if (win && this.moves > 0) {
            clearInterval(this.timerInterval);
            window.dispatchEvent(new CustomEvent('gameWin', { detail: { moves: this.moves, size: this.size }}));
        }
    }
}
const engine = new SlidingEngine();
