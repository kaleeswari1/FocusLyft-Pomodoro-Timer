class EnvironmentSounds {
    constructor() {
        this.soundscapes = {
            'rain': {
                name: 'Gentle Rain',
                icon: 'fas fa-cloud-rain',
                description: 'Soft rainfall for deep focus',
                color: '#6c757d',
                audioData: this.generateRainSound()
            },
            'forest': {
                name: 'Forest Ambience',
                icon: 'fas fa-tree',
                description: 'Birds and rustling leaves',
                color: '#28a745',
                audioData: this.generateForestSound()
            },
            'cafe': {
                name: 'Coffee Shop',
                icon: 'fas fa-coffee',
                description: 'Ambient cafe chatter',
                color: '#6f4e37',
                audioData: this.generateCafeSound()
            },
            'ocean': {
                name: 'Ocean Waves',
                icon: 'fas fa-water',
                description: 'Calming ocean sounds',
                color: '#007bff',
                audioData: this.generateOceanSound()
            },
            'white-noise': {
                name: 'White Noise',
                icon: 'fas fa-broadcast-tower',
                description: 'Pure focus frequency',
                color: '#6c757d',
                audioData: this.generateWhiteNoise()
            },
            'library': {
                name: 'Quiet Library',
                icon: 'fas fa-book',
                description: 'Subtle background whispers',
                color: '#8b4513',
                audioData: this.generateLibrarySound()
            }
        };
        
        this.currentSoundscape = null;
        this.audioContext = null;
        this.gainNode = null;
        this.oscillators = [];
        this.isPlaying = false;
        this.volume = 0.3;
        
        this.init();
    }

    init() {
        this.createSoundInterface();
        this.initializeAudioContext();
    }

    createSoundInterface() {
        const soundHTML = `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-volume-up me-2"></i>Focus Sounds
                    </h5>
                    <div class="d-flex align-items-center">
                        <input type="range" class="form-range me-2" id="volumeSlider" 
                               min="0" max="100" value="30" style="width: 80px;">
                        <button class="btn btn-outline-danger btn-sm" id="stopSoundsBtn" style="display: none;">
                            <i class="fas fa-stop"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row" id="soundscapeOptions">
                        ${Object.entries(this.soundscapes).map(([key, sound]) => `
                            <div class="col-md-4 col-sm-6 mb-3">
                                <div class="soundscape-option" data-sound="${key}">
                                    <div class="sound-icon" style="color: ${sound.color}">
                                        <i class="${sound.icon} fa-2x"></i>
                                    </div>
                                    <h6 class="sound-name mt-2">${sound.name}</h6>
                                    <p class="sound-description small text-muted">${sound.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Background sounds can help maintain focus and block distractions
                        </small>
                    </div>
                </div>
            </div>
        `;

        // Insert after study buddy
        const studyBuddyCard = document.querySelector('.card:last-of-type');
        studyBuddyCard.insertAdjacentHTML('afterend', soundHTML);

        this.setupSoundEvents();
    }

    setupSoundEvents() {
        // Volume control
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        // Stop button
        document.getElementById('stopSoundsBtn').addEventListener('click', () => {
            this.stopAllSounds();
        });

        // Soundscape selection
        document.querySelectorAll('.soundscape-option').forEach(option => {
            option.addEventListener('click', () => {
                const soundKey = option.dataset.sound;
                this.toggleSoundscape(soundKey);
            });
        });
    }

    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;
        } catch (error) {
            console.warn('Web Audio API not supported');
        }
    }

    toggleSoundscape(soundKey) {
        if (this.currentSoundscape === soundKey) {
            this.stopAllSounds();
        } else {
            this.startSoundscape(soundKey);
        }
    }

    startSoundscape(soundKey) {
        if (!this.audioContext) {
            this.showErrorMessage('Audio not supported in this browser');
            return;
        }

        // Stop current sounds
        this.stopAllSounds();

        const soundscape = this.soundscapes[soundKey];
        if (!soundscape) return;

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Generate and play the soundscape
        this.playGeneratedSound(soundscape.audioData);
        
        this.currentSoundscape = soundKey;
        this.isPlaying = true;

        // Update UI
        this.updateSoundscapeUI();
        document.getElementById('stopSoundsBtn').style.display = 'block';
        
        this.showSuccessMessage(`Playing ${soundscape.name}`);
    }

    stopAllSounds() {
        // Stop all oscillators
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator may already be stopped
            }
        });
        this.oscillators = [];

        this.currentSoundscape = null;
        this.isPlaying = false;

        // Update UI
        this.updateSoundscapeUI();
        document.getElementById('stopSoundsBtn').style.display = 'none';
    }

    updateSoundscapeUI() {
        document.querySelectorAll('.soundscape-option').forEach(option => {
            const isActive = option.dataset.sound === this.currentSoundscape;
            option.classList.toggle('active', isActive);
        });
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }

    playGeneratedSound(audioData) {
        const { type, frequencies, noiseType } = audioData;

        if (type === 'oscillator') {
            frequencies.forEach(freq => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = freq.type || 'sine';
                oscillator.frequency.setValueAtTime(freq.frequency, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(freq.volume * this.volume, this.audioContext.currentTime);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                oscillator.start();
                this.oscillators.push(oscillator);
            });
        } else if (type === 'noise') {
            const bufferSize = this.audioContext.sampleRate * 2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            // Generate noise based on type
            for (let i = 0; i < bufferSize; i++) {
                if (noiseType === 'white') {
                    data[i] = Math.random() * 2 - 1;
                } else if (noiseType === 'pink') {
                    // Simplified pink noise generation
                    data[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 0.5);
                }
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(this.gainNode);
            source.start();
            this.oscillators.push(source);
        }
    }

    // Sound generation methods
    generateRainSound() {
        return {
            type: 'noise',
            noiseType: 'pink'
        };
    }

    generateForestSound() {
        return {
            type: 'oscillator',
            frequencies: [
                { frequency: 200, volume: 0.1, type: 'sine' },
                { frequency: 400, volume: 0.05, type: 'sine' },
                { frequency: 800, volume: 0.03, type: 'sine' }
            ]
        };
    }

    generateCafeSound() {
        return {
            type: 'oscillator',
            frequencies: [
                { frequency: 150, volume: 0.08, type: 'sine' },
                { frequency: 300, volume: 0.06, type: 'sine' },
                { frequency: 600, volume: 0.04, type: 'sine' },
                { frequency: 1200, volume: 0.02, type: 'sine' }
            ]
        };
    }

    generateOceanSound() {
        return {
            type: 'oscillator',
            frequencies: [
                { frequency: 80, volume: 0.15, type: 'sine' },
                { frequency: 160, volume: 0.1, type: 'sine' },
                { frequency: 320, volume: 0.05, type: 'sine' }
            ]
        };
    }

    generateWhiteNoise() {
        return {
            type: 'noise',
            noiseType: 'white'
        };
    }

    generateLibrarySound() {
        return {
            type: 'oscillator',
            frequencies: [
                { frequency: 100, volume: 0.03, type: 'sine' },
                { frequency: 250, volume: 0.02, type: 'sine' },
                { frequency: 500, volume: 0.01, type: 'sine' }
            ]
        };
    }

    // Integration with timer
    onWorkSessionStart() {
        // Auto-start preferred sound if configured
        const preferredSound = localStorage.getItem('preferred_focus_sound');
        if (preferredSound && !this.isPlaying) {
            this.startSoundscape(preferredSound);
        }
    }

    onBreakStart() {
        // Optionally lower volume or change to break sounds
        if (this.isPlaying) {
            this.setVolume(this.volume * 0.5); // Lower volume during break
        }
    }

    onBreakEnd() {
        // Restore volume for work session
        if (this.isPlaying) {
            const volumeSlider = document.getElementById('volumeSlider');
            this.setVolume(volumeSlider.value / 100);
        }
    }

    showSuccessMessage(message) {
        const alertHTML = `
            <div class="alert alert-success alert-dismissible fade show position-fixed" 
                style="top: 20px; right: 20px; z-index: 1060; max-width: 350px;">
                <i class="fas fa-volume-up me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        setTimeout(() => {
            const alert = document.querySelector('.alert-success');
            if (alert) alert.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const alertHTML = `
            <div class="alert alert-warning alert-dismissible fade show position-fixed" 
                style="top: 20px; right: 20px; z-index: 1060; max-width: 350px;">
                <i class="fas fa-exclamation-triangle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        setTimeout(() => {
            const alert = document.querySelector('.alert-warning');
            if (alert) alert.remove();
        }, 4000);
    }
}

// Initialize environment sounds when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.environmentSounds = new EnvironmentSounds();
});