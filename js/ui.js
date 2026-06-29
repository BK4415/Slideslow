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
