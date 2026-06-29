class SlidingEngine {
    constructor() {
        this.container = null;
        this.size = 4;
        this.tiles = [];
        this.emptyPos = { x: 3, y: 3 };
        this.isLocked = false;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        this.isPhoto = false;
        this.imageSrc = null;

        // Multi-tile drag state
        this.drag = { active: false, axis: null, affected: [], start: 0 };
    }

    init(container, size, style, mode, image = null) {
        this.container = container;
        this.size = size;
        this.isPhoto = style === 'PHOTO';
        this.imageSrc = image;
        this.mode = mode;
        this.reset();
        this.buildLevel();
    }

    reset() {
        this.moves = 0;
        this.gameActive = false;
        this.startTime = null;
        clearInterval(this.timerInterval);
        this.emptyPos = { x: this.size - 1, y: this.size - 1 };
    }

    buildLevel() {
        this.container.innerHTML = '';
        this.tiles = [];
        const count = this.size * this.size;
        
        // Generate layout based on mode
        const layout = this.generateCoords();

        for (let i = 0; i < count - 1; i++) {
            const tile = {
                id: i + 1,
                x: layout[i].x,
                y: layout[i].y,
                correctX: layout[i].x,
                correctY: layout[i].y,
                el: this.createTileEl(i + 1, layout[i])
            };
            this.tiles.push(tile);
            this.container.appendChild(tile.el);
        }
        this.updateVisuals(true);
    }

    generateCoords() {
        let coords = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) coords.push({ x, y });
        }

        if (this.mode === 'UPSIDE DOWN') return coords.slice(0, -1).reverse();
        if (this.mode === 'SNAKE') {
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

    createTileEl(id, pos) {
        const el = document.createElement('div');
        el.className = 'tile';
        if (this.isPhoto) el.classList.add('photo-mode');
        
        const percent = 100 / this.size;
        el.style.width = `calc(${percent}% - 4px)`;
        el.style.height = `calc(${percent}% - 4px)`;
        el.innerHTML = `<span>${id}</span>`;

        if (this.isPhoto && this.imageSrc) {
            el.style.backgroundImage = `url(${this.imageSrc})`;
            el.style.backgroundSize = `${this.size * 100}%`;
            el.style.backgroundPosition = `${(pos.x / (this.size - 1)) * 100}% ${(pos.y / (this.size - 1)) * 100}%`;
        }

        el.addEventListener('pointerdown', (e) => this.onPointerDown(e, id));
        return el;
    }

    onPointerDown(e, id) {
        if (this.isLocked) return;
        const tile = this.tiles.find(t => t.id === id);
        const canMoveX = tile.y === this.emptyPos.y;
        const canMoveY = tile.x === this.emptyPos.x;

        if (!canMoveX && !canMoveY) return;

        this.drag.active = true;
        this.drag.axis = canMoveX ? 'x' : 'y';
        this.drag.start = canMoveX ? e.clientX : e.clientY;
        this.drag.affected = this.getAffected(tile);

        const moveBound = this.onPointerMove.bind(this);
        const upBound = () => {
            this.onPointerUp();
            window.removeEventListener('pointermove', moveBound);
            window.removeEventListener('pointerup', upBound);
        };

        window.addEventListener('pointermove', moveBound);
        window.addEventListener('pointerup', upBound);
    }

    getAffected(clicked) {
        const affected = [];
        const isX = this.drag.axis === 'x';
        const axis = isX ? 'x' : 'y';
        const cross = isX ? 'y' : 'x';

        const min = Math.min(clicked[axis], this.emptyPos[axis]);
        const max = Math.max(clicked[axis], this.emptyPos[axis]);

        this.tiles.forEach(t => {
            if (t[cross] === clicked[cross] && t[axis] >= min && t[axis] <= max) {
                affected.push(t);
            }
        });

        // Sort so the one closest to the empty space moves first
        affected.sort((a, b) => {
            return Math.abs(a[axis] - this.emptyPos[axis]) - Math.abs(b[axis] - this.emptyPos[axis]);
        });

        return affected;
    }

    onPointerMove(e) {
        if (!this.drag.active) return;
        const current = this.drag.axis === 'x' ? e.clientX : e.clientY;
        const delta = current - this.drag.start;
        const max = this.container.offsetWidth / this.size;
        
        // Visual clamp
        const move = Math.max(-max, Math.min(max, delta));
        
        this.drag.affected.forEach(t => {
            const offX = this.drag.axis === 'x' ? move : 0;
            const offY = this.drag.axis === 'y' ? move : 0;
            t.el.style.transform = `translate(calc(${t.x * 100}% + ${offX}px), calc(${t.y * 100}% + ${offY}px))`;
        });
    }

    onPointerUp() {
        if (!this.drag.active) return;
        this.drag.active = false;
        this.executeMove(this.drag.affected);
    }

    executeMove(tiles) {
        if (!this.gameActive && tiles.length > 0) {
            this.gameActive = true;
            this.startTimer();
        }

        const dir = this.drag.axis === 'x' ? 
            (tiles[0].x < this.emptyPos.x ? 1 : -1) : 
            (tiles[0].y < this.emptyPos.y ? 1 : -1);

        tiles.forEach(t => {
            if (this.drag.axis === 'x') t.x += dir;
            else t.y += dir;
        });

        this.emptyPos.x -= (this.drag.axis === 'x' ? dir * tiles.length : 0);
        this.emptyPos.y -= (this.drag.axis === 'y' ? dir * tiles.length : 0);

        this.moves++;
        this.updateVisuals();
        this.checkWin();
    }

    updateVisuals(instant = false) {
        this.tiles.forEach(t => {
            t.el.style.transition = instant ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
            t.el.style.transform = `translate(${t.x * 100}%, ${t.y * 100}%)`;
        });
    }

    shuffle() {
        this.isLocked = true;
        let count = 0;
        const max = this.size * 25;
        const interval = setInterval(() => {
            const adj = this.tiles.filter(t => 
                (Math.abs(t.x - this.emptyPos.x) === 1 && t.y === this.emptyPos.y) ||
                (Math.abs(t.y - this.emptyPos.y) === 1 && t.x === this.emptyPos.x)
            );
            const rand = adj[Math.floor(Math.random() * adj.length)];
            this.drag.axis = rand.y === this.emptyPos.y ? 'x' : 'y';
            this.executeMove([rand]);
            count++;
            if (count >= max) {
                clearInterval(interval);
                this.isLocked = false;
                this.moves = 0; // Reset after shuffle
                this.startTime = null;
            }
        }, 30);
    }

    checkWin() {
        const win = this.tiles.every(t => t.x === t.correctX && t.y === t.correctY);
        if (win && this.gameActive) {
            this.gameActive = false;
            clearInterval(this.timerInterval);
            window.dispatchEvent(new CustomEvent('puzzle-win', { 
                detail: { moves: this.moves, time: document.getElementById('game-timer').innerText } 
            }));
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const s = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('game-timer').innerText = 
                `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
        }, 1000);
    }
}

const engine = new SlidingEngine();
