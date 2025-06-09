
// Create global audio manager
window.AudioManager = class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialize();
        this.notificationsEnabled = true;
    }

    initialize() {
        // Initialize Web Audio API
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
    }
    
    setNotificationsEnabled(enabled) {
        this.notificationsEnabled = enabled;
    }

    async playNotification(type) {
        // Don't play sounds if notifications are disabled
        if (!this.notificationsEnabled) return;
        
        if (!this.audioContext) {
            this.initialize();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sound patterns for different notification types
        switch(type) {
            case 'work':
                oscillator.frequency.value = 440; // A4
                gainNode.gain.value = 0.5;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 500);
                break;
            case 'break':
                oscillator.frequency.value = 523.25; // C5
                gainNode.gain.value = 0.4;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 300);
                break;
            case 'reminder':
                oscillator.frequency.value = 349.23; // F4
                gainNode.gain.value = 0.3;
                oscillator.start();
                setTimeout(() => {
                    oscillator.frequency.value = 392.00; // G4
                    setTimeout(() => oscillator.stop(), 300);
                }, 300);
                break;
            case 'gentle':
                oscillator.frequency.value = 261.63; // C4
                gainNode.gain.value = 0.2;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 200);
                break;
            case 'reward':
                // Celebratory ascending melody for completed sessions
                oscillator.frequency.value = 523.25; // C5
                gainNode.gain.value = 0.4;
                oscillator.start();
                setTimeout(() => {
                    oscillator.frequency.value = 659.25; // E5
                    setTimeout(() => {
                        oscillator.frequency.value = 783.99; // G5
                        setTimeout(() => {
                            oscillator.frequency.value = 1046.50; // C6
                            setTimeout(() => oscillator.stop(), 400);
                        }, 200);
                    }, 200);
                }, 200);
                break;
            default:
                oscillator.frequency.value = 440;
                gainNode.gain.value = 0.3;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 200);
        }
    }
}

// Create global instance
window.audioManager = new window.AudioManager();
