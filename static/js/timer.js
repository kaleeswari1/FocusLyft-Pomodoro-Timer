class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60;  // 5 minutes in seconds
        this.currentTime = this.workTime;
        this.isWorkMode = true;
        this.isRunning = false;
        this.timer = null;
        this.sessionCount = 0;

        // DOM elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modeIndicator = document.getElementById('currentMode');
        this.progressBar = document.getElementById('progressBar');
        this.sessionCountDisplay = document.getElementById('sessionCount');

        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.timer = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();

                if (this.currentTime <= 0) {
                    this.handleTimerComplete();
                }
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
        }
    }

    reset() {
        this.pause();
        this.isWorkMode = true;
        this.currentTime = this.workTime;
        this.updateDisplay();
        this.updateModeIndicator();
    }

    handleTimerComplete() {
        audioManager.playNotification(this.isWorkMode ? 'work' : 'break');
        
        if (this.isWorkMode) {
            this.sessionCount++;
            this.sessionCountDisplay.textContent = this.sessionCount;
            this.currentTime = this.breakTime;
            this.isWorkMode = false;
        } else {
            this.currentTime = this.workTime;
            this.isWorkMode = true;
        }

        this.updateModeIndicator();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');

        // Update progress bar
        const totalTime = this.isWorkMode ? this.workTime : this.breakTime;
        const progress = (this.currentTime / totalTime) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    updateModeIndicator() {
        this.modeIndicator.textContent = this.isWorkMode ? 'Work Time' : 'Break Time';
        this.modeIndicator.className = `badge ${this.isWorkMode ? 'bg-primary' : 'bg-success'} fs-5`;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const pomodoroTimer = new PomodoroTimer();
});
