document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const homeView = document.getElementById('home-view');
    const gameView = document.getElementById('game-view');
    const infoPanel = document.getElementById('info-panel');
    const dashPanel = document.getElementById('dash-panel');
    
    // Auto-hide loading screen (Prevent freeze)
    setTimeout(() => {
        loadingScreen.classList.remove('active');
    }, 1500);

    // Panel Controls
    document.getElementById('open-info').onclick = () => infoPanel.classList.add('active');
    document.getElementById('open-dash').onclick = () => dashPanel.classList.add('active');
    
    document.querySelectorAll('.close-panel-btn').forEach(btn => {
        btn.onclick = () => document.getElementById(btn.dataset.panel).classList.remove('active');
    });

    // Swipe Logic
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > 100) {
            if (diff > 0) infoPanel.classList.add('active'); // Right swipe
            else dashPanel.classList.add('active'); // Left swipe
        }
    });

    // Game Config Selection
    const sizes = ['3 × 3', '4 × 4', '5 × 5', '6 × 6', '7 × 7'];
    let currentSizeIdx = 1;

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.type === 'size') {
                currentSizeIdx = (currentSizeIdx + 1) % sizes.length;
                document.getElementById('current-size').innerText = sizes[currentSizeIdx];
            }
        };
    });

    // Start Game
    document.getElementById('play-btn').onclick = () => {
        homeView.classList.remove('active');
        gameView.classList.add('active');
        const size = parseInt(sizes[currentSizeIdx]);
        engine.init(document.getElementById('game-board-container'), size);
    };

    // Protection
    document.addEventListener('contextmenu', e => e.preventDefault());
});
// Image Upload Handler
const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Create a Square Canvas for Center Crop
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height);
            canvas.width = 1000; // High quality fixed size
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(
                img, 
                (img.width - size) / 2, (img.height - size) / 2, size, size, 
                0, 0, 1000, 1000
            );
            
            const processedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            // Save to state and update preview
            gameState.customImage = processedDataUrl;
            document.getElementById('preview-board').style.backgroundImage = `url(${processedDataUrl})`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// Security: Protect Local Assets
const protectImages = () => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.querySelectorAll('img, .tile').forEach(el => {
        el.style.webkitUserSelect = 'none';
        el.style.webkitTouchCallout = 'none';
    });
};

// Resume Feature: Auto-save on every move
const saveGameProgress = (data) => {
    localStorage.setItem('wood_slide_resume', JSON.stringify({
        ...data,
        timestamp: new Date().toLocaleString()
    }));
    updateResumeUI();
};

const updateResumeUI = () => {
    const saved = localStorage.getItem('wood_slide_resume');
    const section = document.getElementById('resume-section');
    if (saved) {
        const data = JSON.parse(saved);
        section.classList.remove('hidden');
        document.getElementById('resume-meta').innerText = 
            `Last: ${data.size}x${data.size} ${data.style} (${data.moves} moves)`;
    }
};
const updateModeVisibility = (style) => {
    const modeRow = document.getElementById('mode-selector-row');
    if (style === 'PHOTO') {
        modeRow.style.opacity = '0.3';
        modeRow.style.pointerEvents = 'none';
        document.getElementById('current-mode').innerText = 'CLASSIC';
    } else {
        modeRow.style.opacity = '1';
        modeRow.style.pointerEvents = 'auto';
    }
};
// Inside js/ui.js
window.addEventListener('gameWin', async (e) => {
    const { moves, time, size } = e.detail;
    
    // Fetch Star Ratings
    const response = await fetch('json/ratings.json');
    const data = await response.json();
    const thresholds = data.ratings[size];
    
    let stars = 1;
    if (moves <= thresholds["3star"]) stars = 3;
    else if (moves <= thresholds["2star"]) stars = 2;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="popup-box wooden win-popup animate-pop">
            <h2>Congratulations!</h2>
            <div class="star-rating">
                ${Array(3).fill(0).map((_, i) => `<span class="${i < stars ? 'active' : ''}">${ICONS.star}</span>`).join('')}
            </div>
            <div class="win-stats">
                <p>Size: <strong>${size}x${size}</strong></p>
                <p>Moves: <strong>${moves}</strong></p>
                <p>Time: <strong>${time}</strong></p>
            </div>
            <div class="popup-btns">
                <button onclick="location.reload()" class="icon-btn-large">${ICONS.play} Play Again</button>
                <button id="share-card-btn" class="icon-btn-large">${ICONS.share} Share</button>
            </div>
        </div>
    `;
    modal.classList.add('active');

    document.getElementById('share-card-btn').onclick = () => generateShareCard(e.detail, stars);
});
async function generateShareCard(gameData, stars) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // Portrait share aspect
    const ctx = canvas.getContext('2d');

    // 1. Background (Premium Wood Color)
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Logo Placeholder (You would replace this with your logo image)
    ctx.fillStyle = '#8b5a2b';
    ctx.roundRect(440, 100, 200, 200, 40);
    ctx.fill();

    // 3. Text Styles
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 80px Segoe UI';
    ctx.fillText('WOODEN SLIDE', 540, 400);

    ctx.font = '50px Segoe UI';
    ctx.fillText('PUZZLE SOLVED!', 540, 500);

    // 4. Stats Box
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.roundRect(140, 600, 800, 400, 20);
    ctx.fill();

    ctx.fillStyle = '#d2a679';
    ctx.font = 'bold 40px Segoe UI';
    ctx.fillText(`SIZE: ${gameData.size}x${gameData.size}`, 540, 700);
    ctx.fillText(`MOVES: ${gameData.moves}`, 540, 780);
    ctx.fillText(`TIME: ${gameData.time}`, 540, 860);

    // 5. Draw Stars
    ctx.fillStyle = '#f39c12';
    for(let i=0; i<3; i++) {
        const x = 440 + (i * 100);
        ctx.font = '80px Arial';
        ctx.fillText(i < stars ? '★' : '☆', x, 960);
    }

    // 6. Output to Image
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `WoodenSlide_Score_${gameData.moves}.png`;
    link.href = dataUrl;
    link.click();
}
const gameState = {
    size: 4,
    style: 'NUMBER',
    mode: 'CLASSIC',
    image: null,
    presets: ['assets/images/photo1.jpg', 'assets/images/photo2.jpg', 'assets/images/photo3.jpg']
};

// Toggle Style
function updateStyle(direction) {
    gameState.style = (gameState.style === 'NUMBER') ? 'PHOTO' : 'NUMBER';
    document.getElementById('current-style').innerText = gameState.style;
    
    const modeSelector = document.getElementById('mode-selector-row');
    const photoToggle = document.getElementById('photo-number-toggle');
    
    if (gameState.style === 'PHOTO') {
        modeSelector.style.display = 'none';
        photoToggle.classList.remove('hidden');
        gameState.mode = 'CLASSIC';
    } else {
        modeSelector.style.display = 'flex';
        photoToggle.classList.add('hidden');
    }
    updatePreview();
}

// Preview Board Generator (Miniature version of engine)
function updatePreview() {
    const preview = document.getElementById('preview-board');
    preview.innerHTML = '';
    const s = gameState.size;
    preview.style.display = 'grid';
    preview.style.gridTemplateColumns = `repeat(${s}, 1fr)`;
    
    for(let i=0; i < (s*s)-1; i++) {
        const dot = document.createElement('div');
        dot.className = 'preview-tile';
        if(gameState.style === 'NUMBER') dot.innerText = i+1;
        preview.appendChild(dot);
    }
}
