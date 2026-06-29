/**
 * PREMIUM SLIDING ENGINE - CORE
 */
class SlidingEngine {
    constructor() {
        this.container = null;
        this.size = 4;
        this.tiles = [];
        this.emptyPos = { x: 3, y: 3 };
        this.mode = 'CLASSIC';
        this.isPhoto = false;
        this.imageSrc = null;
        this.isLocked = false;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameStarted = false;
        
        // Interaction
        this.dragData = { active: false, axis: null, tiles: [], startPos: 0 };
    }

    init(container, size, mode, style, image = null) {
        this.container = container;
        this.size = size;
        this.mode = mode;
        this.isPhoto = style === 'PHOTO';
        this.imageSrc = image;
        this.resetGame();
        this.createBoard();
    }

    resetGame() {
        this.moves = 0;
        this.gameStarted = false;
        this.startTime = null;
        clearInterval(this.timerInterval);
        document.getElementById('move-count').innerText = '0';
        document.getElementById('game-timer').innerText = '00:00';
    }

    createBoard() {
        this.container.innerHTML = '';
        this.tiles = [];
        this.emptyPos = { x: this.size - 1, y: this.size - 1 };
        
        const count = this.size * this.size;
        const layout = this.getModeLayout();

        for (let i = 0; i < count - 1; i++) {
            const tile = {
                id: i + 1,
                x: layout[i].x,
                y: layout[i].y,
                targetX: layout[i].x,
                targetY: layout[i].y,
                correctX: layout[i].x,
                correctY: layout[i].y,
                el: this.createTileElement(i + 1, layout[i])
            };
            this.tiles.push(tile);
            this.container.appendChild(tile.el);
        }
        this.updateTilePositions(true);
    }

    getModeLayout() {
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

    createTileElement(id, pos) {
        const el = document.createElement('div');
        el.className = 'tile';
        el.style.width = `calc(100% / ${this.size})`;
        el.style.height = `calc(100% / ${this.size})`;
        el.innerHTML = `<span>${id}</span>`;
        el.dataset.id = id;

        if (this.isPhoto && this.imageSrc) {
            el.classList.add('photo-tile');
            el.style.backgroundImage = `url(${this.imageSrc})`;
            el.style.backgroundSize = `${this.size * 100}%`;
            el.style.backgroundPosition = `${(pos.x / (this.size - 1)) * 100}% ${(pos.y / (this.size - 1)) * 100}%`;
        }

        el.addEventListener('pointerdown', (e) => this.handlePointerDown(e, id));
        return el;
    }

    handlePointerDown(e, id) {
        if (this.isLocked) return;
        const tile = this.tiles.find(t => t.id === id);
        const canMoveX = tile.y === this.emptyPos.y;
        const canMoveY = tile.x === this.emptyPos.x;

        if (!canMoveX && !canMoveY) return;

        this.dragData.active = true;
        this.dragData.axis = canMoveX ? 'x' : 'y';
        this.dragData.startPos = canMoveX ? e.clientX : e.clientY;
        this.dragData.tiles = this.getAffectedTiles(tile);
        
        const moveFn = (me) => this.handlePointerMove(me);
        const upFn = () => {
            this.handlePointerUp();
            window.removeEventListener('pointermove', moveFn);
            window.removeEventListener('pointerup', upFn);
        };

        window.addEventListener('pointermove', moveFn);
        window.addEventListener('pointerup', upFn);
    }

    getAffectedTiles(clickedTile) {
        const affected = [];
        if (this.dragData.axis === 'x') {
            const min = Math.min(clickedTile.x, this.emptyPos.x);
            const max = Math.max(clickedTile.x, this.emptyPos.x);
            this.tiles.forEach(t => {
                if (t.y === clickedTile.y && t.x >= min && t.x <= max) affected.push(t);
            });
        } else {
            const min = Math.min(clickedTile.y, this.emptyPos.y);
            const max = Math.max(clickedTile.y, this.emptyPos.y);
            this.tiles.forEach(t => {
                if (t.x === clickedTile.x && t.y >= min && t.y <= max) affected.push(t);
            });
        }
        return affected;
    }

    handlePointerMove(e) {
        if (!this.dragData.active) return;
        const currentPos = this.dragData.axis === 'x' ? e.clientX : e.clientY;
        const delta = currentPos - this.dragData.startPos;
        
        // Apply visual offset to affected tiles (clamped)
        const containerSize = this.container.offsetWidth / this.size;
        const clampedDelta = Math.max(-containerSize, Math.min(containerSize, delta));
        
        this.dragData.tiles.forEach(t => {
            const offset = this.dragData.axis === 'x' ? `translateX(${clampedDelta}px)` : `translateY(${clampedDelta}px)`;
            t.el.style.transform = `translate(${t.x * 100}%, ${t.y * 100}%) ${offset}`;
        });
    }

    handlePointerUp() {
        if (!this.dragData.active) return;
        this.dragData.active = false;
        
        // For simplicity in this vanilla version, any significant move triggers the swap
        // In a premium version, we calculate if it passed 50% threshold
        this.executeMove(this.dragData.tiles);
    }

    executeMove(tiles) {
        if (tiles.length === 0) return;
        
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }

        const dir = this.dragData.axis === 'x' ? 
            (tiles[0].x < this.emptyPos.x ? 1 : -1) : 
            (tiles[0].y < this.emptyPos.y ? 1 : -1);

        tiles.forEach(t => {
            if (this.dragData.axis === 'x') t.x += dir;
            else t.y += dir;
        });

        this.emptyPos.x -= (this.dragData.axis === 'x' ? dir * tiles.length : 0);
        this.emptyPos.y -= (this.dragData.axis === 'y' ? dir * tiles.length : 0);

        this.moves++;
        document.getElementById('move-count').innerText = this.moves;
        this.updateTilePositions();
        this.checkWin();
    }

    updateTilePositions(instant = false) {
        this.tiles.forEach(t => {
            t.el.style.transition = instant ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            t.el.style.transform = `translate(${t.x * 100}%, ${t.y * 100}%)`;
        });
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - this.startTime) / 1000);
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            document.getElementById('game-timer').innerText = `${m}:${s}`;
        }, 1000);
    }

    shuffle() {
        this.isLocked = true;
        let count = 0;
        const max = this.size * 20;
        const interval = setInterval(() => {
            const validTiles = this.tiles.filter(t => 
                (Math.abs(t.x - this.emptyPos.x) === 1 && t.y === this.emptyPos.y) ||
                (Math.abs(t.y - this.emptyPos.y) === 1 && t.x === this.emptyPos.x)
            );
            const randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];
            this.executeMove([randomTile]);
            count++;
            if (count >= max) {
                clearInterval(interval);
                this.isLocked = false;
                this.resetGame(); // Reset moves after shuffle
            }
        }, 50);
    }

    checkWin() {
        const isWin = this.tiles.every(t => t.x === t.correctX && t.y === t.correctY);
        if (isWin && this.gameStarted) {
            this.gameStarted = false;
            clearInterval(this.timerInterval);
            this.showWinPopup();
        }
    }

    showWinPopup() {
        // Logic for triggering the Win Overlay in ui.js
        window.dispatchEvent(new CustomEvent('gameWin', { detail: { 
            moves: this.moves, 
            time: document.getElementById('game-timer').innerText,
            size: this.size
        }}));
    }
}
