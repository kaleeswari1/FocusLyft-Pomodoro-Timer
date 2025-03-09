class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialize();
    }

    initialize() {
        // Initialize Web Audio API
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
    }

    async playNotification(type) {
        if (!this.audioContext) {
            this.initialize();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sounds for work and break
        if (type === 'work') {
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        } else {
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        }

        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }
}

const audioManager = new AudioManager();
