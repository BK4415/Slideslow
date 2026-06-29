/**
 * SERVICE WORKER REGISTRATION
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Game Offline Ready'))
            .catch(err => console.log('Offline Setup Failed', err));
    });
}

// Security: Disable Long Press & Context Menu for Image protection
document.addEventListener('contextmenu', e => e.preventDefault());
