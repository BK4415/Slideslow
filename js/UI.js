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
