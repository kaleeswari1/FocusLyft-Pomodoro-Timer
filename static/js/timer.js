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

        // Add new tracking variables
        this.pauseCount = 0;
        this.totalPauseTime = 0;
        this.lastPauseTime = null;
        this.rewardMessage = document.getElementById('rewardMessage'); // Added for reward message

        // Initialize timer values
        this.workTime = this.getWorkDuration();
        this.breakTime = this.getBreakDuration();
        this.currentTime = this.workTime;
        this.isWorkMode = true;
        this.isRunning = false;
        this.timer = null;
        this.sessionCount = 0;

        // Add focus mode status element
        this.focusStatus = document.getElementById('focusStatus');

        this.initializeEventListeners();
        this.updateDisplay();
        this.updateStats();
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
            // Calculate pause duration if resuming from pause
            if (this.lastPauseTime) {
                this.totalPauseTime += Math.floor((Date.now() - this.lastPauseTime) / 1000);
                this.lastPauseTime = null;
            }

            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.workDurationInput.disabled = true;
            this.breakDurationInput.disabled = true;

            // Enable focus mode and set reminders when starting work session
            if (this.isWorkMode) {
                notificationManager.blockNotifications();
                this.focusStatus.classList.remove('d-none');
                // Set reminder for 5 minutes before end of work session
                notificationManager.setStudyReminder(this.workTime / 60);
            } else {
                // Set reminder for break time
                notificationManager.setBreakReminder(this.breakTime / 60);
            }

            this.timer = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();

                if (this.currentTime <= 0) {
                    this.handleTimerComplete();
                }
            }, 1000);

            this.updateStats();
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

            // Track pause statistics
            if (this.isWorkMode) {
                this.pauseCount++;
                this.lastPauseTime = Date.now();
            }
            this.updateStats();
        }
    }

    reset() {
        this.pause();
        this.isWorkMode = true;
        this.workTime = this.getWorkDuration();
        this.breakTime = this.getBreakDuration();
        this.currentTime = this.workTime;
        this.sessionCount = 0;
        this.pauseCount = 0;
        this.totalPauseTime = 0;
        this.lastPauseTime = null;
        this.sessionCountDisplay.textContent = this.sessionCount;
        this.updateDisplay();
        this.updateModeIndicator();
        this.updateStats();
        this.workDurationInput.disabled = false;
        this.breakDurationInput.disabled = false;
        notificationManager.clearAllReminders();
    }

    handleTimerComplete() {
        if (this.isWorkMode) {
            // Play reward sound and show celebration when work session is completed
            audioManager.playNotification('reward');
            this.showReward();

            // Reset pause statistics on successful completion of work session
            this.pauseCount = 0;
            this.totalPauseTime = 0;
            this.lastPauseTime = null;

            // Disable focus mode when work session ends
            notificationManager.unblockNotifications();
            this.focusStatus.classList.add('d-none');

            this.sessionCount++;
            this.sessionCountDisplay.textContent = this.sessionCount;
            this.currentTime = this.breakTime;
            this.isWorkMode = false;
        } else {
            audioManager.playNotification('break');
            this.currentTime = this.workTime;
            this.isWorkMode = true;

            // Re-enable focus mode when starting new work session
            notificationManager.blockNotifications();
            this.focusStatus.classList.remove('d-none');
        }

        this.updateModeIndicator();
        this.updateStats();
    }

    showReward() {
        // Trigger confetti animation
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Show motivational message
        const messages = [
            "Great work! 🌟",
            "You're crushing it! 💪",
            "Keep up the momentum! 🚀",
            "Excellent focus! 🎯",
            "Amazing progress! ⭐"
        ];

        this.rewardMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
        this.rewardMessage.classList.add('show');

        // Hide message after 3 seconds
        setTimeout(() => {
            this.rewardMessage.classList.remove('show');
        }, 3000);
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

    updateStats() {
        const statsElement = document.getElementById('pauseStats');
        if (this.isWorkMode && (this.pauseCount > 0 || this.totalPauseTime > 0)) {
            statsElement.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <small>
                        Pauses this session: ${this.pauseCount}<br>
                        Total pause time: ${Math.floor(this.totalPauseTime / 60)}m ${this.totalPauseTime % 60}s
                    </small>
                </div>`;
        } else {
            statsElement.innerHTML = '';
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const pomodoroTimer = new PomodoroTimer();
});