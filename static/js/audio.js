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

        // Different sounds for different events
        switch(type) {
            case 'work':
                oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
                break;
            case 'break':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
                break;
            case 'reward':
                // Play a happy reward melody
                const now = this.audioContext.currentTime;
                oscillator.frequency.setValueAtTime(523.25, now); // C5
                oscillator.frequency.setValueAtTime(659.25, now + 0.2); // E5
                oscillator.frequency.setValueAtTime(783.99, now + 0.4); // G5
                break;
            case 'reminder':
                // Gentle reminder sound
                const reminderTime = this.audioContext.currentTime;
                oscillator.frequency.setValueAtTime(587.33, reminderTime); // D5
                oscillator.frequency.setValueAtTime(739.99, reminderTime + 0.2); // F#5
                break;
        }

        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + (type === 'reward' || type === 'reminder' ? 1.5 : 1));
    }
}

const audioManager = new AudioManager();