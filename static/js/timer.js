class PomodoroTimer {
    constructor() {
        // DOM elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modeIndicator = document.getElementById('currentMode');
        this.progressBar = document.getElementById('progressBar');
        this.sessionCountDisplay = document.getElementById('sessionCount');
        this.workDurationInput = document.getElementById('workDuration');
        this.breakDurationInput = document.getElementById('breakDuration');

        // Initialize timer values
        this.workTime = this.getWorkDuration();
        this.breakTime = this.getBreakDuration();
        this.currentTime = this.workTime;
        this.isWorkMode = true;
        this.isRunning = false;
        this.timer = null;
        this.sessionCount = 0;

        this.initializeEventListeners();
        this.updateDisplay();
    }

    getWorkDuration() {
        const duration = Math.min(Math.max(parseInt(this.workDurationInput.value) || 25, 1), 60);
        this.workDurationInput.value = duration;
        return duration * 60;
    }

    getBreakDuration() {
        const duration = Math.min(Math.max(parseInt(this.breakDurationInput.value) || 5, 1), 30);
        this.breakDurationInput.value = duration;
        return duration * 60;
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Add input validation and update timer on duration changes
        this.workDurationInput.addEventListener('change', () => {
            if (!this.isRunning) {
                this.workTime = this.getWorkDuration();
                if (this.isWorkMode) {
                    this.currentTime = this.workTime;
                    this.updateDisplay();
                }
            }
        });

        this.breakDurationInput.addEventListener('change', () => {
            if (!this.isRunning) {
                this.breakTime = this.getBreakDuration();
                if (!this.isWorkMode) {
                    this.currentTime = this.breakTime;
                    this.updateDisplay();
                }
            }
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.workDurationInput.disabled = true;
            this.breakDurationInput.disabled = true;

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
            this.workDurationInput.disabled = false;
            this.breakDurationInput.disabled = false;
        }
    }

    reset() {
        this.pause();
        this.isWorkMode = true;
        this.workTime = this.getWorkDuration();
        this.breakTime = this.getBreakDuration();
        this.currentTime = this.workTime;
        this.sessionCount = 0;
        this.sessionCountDisplay.textContent = this.sessionCount;
        this.updateDisplay();
        this.updateModeIndicator();
        this.workDurationInput.disabled = false;
        this.breakDurationInput.disabled = false;
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