/**
 * PREMIUM SLIDING ENGINE
 */
class SlidingEngine {
    constructor() {
        this.config = {
            size: 4,
            mode: 'CLASSIC', // CLASSIC, SNAKE, SPIRAL, UPSIDE
            style: 'NUMBER', // NUMBER, PHOTO
            image: null
        };
        
        this.state = {
            tiles: [],
            empty: { x: 3, y: 3 },
            moves: 0,
            startTime: null,
            timerInterval: null,
            isLocked: false,
            history: []
        };
    }

    init(container, size = 4) {
        this.container = container;
        this.config.size = size;
        this.resetState();
        this.render();
    }

    resetState() {
        this.state.moves = 0;
        this.state.startTime = null;
        this.state.history = [];
        this.state.empty = { x: this.config.size - 1, y: this.config.size - 1 };
        
        const count = this.config.size * this.config.size;
        const layout = this.generateLayout(this.config.mode, this.config.size);
        
        this.state.tiles = [];
        for (let i = 0; i < count - 1; i++) {
            this.state.tiles.push({
                id: i + 1,
                currentX: layout[i].x,
                currentY: layout[i].y,
                correctX: layout[i].x,
                correctY: layout[i].y,
                visualX: layout[i].x,
                visualY: layout[i].y
            });
        }
    }

    generateLayout(mode, size) {
        let coords = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) coords.push({ x, y });
        }

        if (mode === 'UPSIDE') return coords.reverse();
        if (mode === 'SNAKE') {
            let snakeCoords = [];
            for (let y = 0; y < size; y++) {
                let row = [];
                for (let x = 0; x < size; x++) row.push({ x, y });
                if (y % 2 !== 0) row.reverse();
                snakeCoords.push(...row);
            }
            return snakeCoords;
        }
        // Classic default
        return coords;
    }

    // MULTI-TILE SLIDING LOGIC
    tryMove(tileId, isUserAction = true) {
        const tile = this.state.tiles.find(t => t.id === tileId);
        if (!tile) return false;

        const canMoveX = tile.currentY === this.state.empty.y;
        const canMoveY = tile.currentX === this.state.empty.x;

        if (!canMoveX && !canMoveY) return false;

        const affectedTiles = this.getAffectedTiles(tile);
        this.moveTiles(affectedTiles, isUserAction);
        return true;
    }

    getAffectedTiles(clickedTile) {
        const affected = [];
        const isX = clickedTile.currentY === this.state.empty.y;
        
        if (isX) {
            const min = Math.min(clickedTile.currentX, this.state.empty.x);
            const max = Math.max(clickedTile.currentX, this.state.empty.x);
            this.state.tiles.forEach(t => {
                if (t.currentY === clickedTile.currentY && t.currentX >= min && t.currentX <= max) {
                    affected.push(t);
                }
            });
            affected.sort((a, b) => (this.state.empty.x > clickedTile.currentX) ? b.currentX - a.currentX : a.currentX - b.currentX);
        } else {
            const min = Math.min(clickedTile.currentY, this.state.empty.y);
            const max = Math.max(clickedTile.currentY, this.state.empty.y);
            this.state.tiles.forEach(t => {
                if (t.currentX === clickedTile.currentX && t.currentY >= min && t.currentY <= max) {
                    affected.push(t);
                }
            });
            affected.sort((a, b) => (this.state.empty.y > clickedTile.currentY) ? b.currentY - a.currentY : a.currentY - b.currentY);
        }
        return affected;
    }

    moveTiles(tiles, isUserAction) {
        if (tiles.length === 0) return;

        // Save state for undo
        if (isUserAction) {
            this.state.history.push(JSON.stringify({
                tiles: this.state.tiles,
                empty: this.state.empty
            }));
            if (this.state.moves === 0) this.startTimer();
            this.state.moves++;
        }

        tiles.forEach(t => {
            const oldX = t.currentX;
            const oldY = t.currentY;
            t.currentX = this.state.empty.x;
            t.currentY = this.state.empty.y;
            this.state.empty = { x: oldX, y: oldY };
            this.animateTile(t);
        });

        if (isUserAction) this.checkWin();
    }

    animateTile(tile) {
        const el = document.querySelector(`[data-tile-id="${tile.id}"]`);
        const size = 100 / this.config.size;
        el.style.left = `${tile.currentX * size}%`;
        el.style.top = `${tile.currentY * size}%`;
    }

    shuffle() {
        this.state.isLocked = true;
        let shuffles = this.config.size * 50;
        const performShuffle = () => {
            const neighbors = this.state.tiles.filter(t => 
                (Math.abs(t.currentX - this.state.empty.x) === 1 && t.currentY === this.state.empty.y) ||
                (Math.abs(t.currentY - this.state.empty.y) === 1 && t.currentX === this.state.empty.x)
            );
            const randomTile = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.tryMove(randomTile.id, false);
            shuffles--;
            if (shuffles > 0) {
                requestAnimationFrame(performShuffle);
            } else {
                this.state.isLocked = false;
                this.state.moves = 0;
                this.state.startTime = null;
            }
        };
        performShuffle();
    }

    render() {
        this.container.innerHTML = '';
        const boardSize = this.container.clientWidth;
        const tileSize = boardSize / this.config.size;
        
        this.state.tiles.forEach(tile => {
            const el = document.createElement('div');
            el.className = 'tile';
            el.dataset.tileId = tile.id;
            el.dataset.num = tile.id;
            el.style.width = `${100 / this.config.size}%`;
            el.style.height = `${100 / this.config.size}%`;
            el.innerHTML = `<span>${tile.id}</span>`;
            
            if (this.config.style === 'PHOTO' && this.config.image) {
                el.classList.add('photo-mode');
                el.style.backgroundImage = `url(${this.config.image})`;
                el.style.backgroundSize = `${boardSize}px ${boardSize}px`;
                el.style.backgroundPosition = `-${tile.correctX * tileSize}px -${tile.correctY * tileSize}px`;
            }
            
            el.addEventListener('pointerdown', () => {
                if (!this.state.isLocked) this.tryMove(tile.id);
            });
            
            this.container.appendChild(el);
            this.animateTile(tile);
        });
    }

    startTimer() {
        this.state.startTime = Date.now();
        this.state.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
            const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('game-timer').innerText = `${m}:${s}`;
        }, 1000);
    }

    checkWin() {
        const win = this.state.tiles.every(t => t.currentX === t.correctX && t.currentY === t.correctY);
        if (win && this.state.moves > 0) {
            clearInterval(this.state.timerInterval);
            setTimeout(() => alert('You Won!'), 500);
        }
    }
}

const engine = new SlidingEngine();
