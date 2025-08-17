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

            // Show motivational quote when starting a new work session
            if (this.isWorkMode && window.quotesManager) {
                window.quotesManager.showSessionStartQuote();
            }

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
            // Break completed - encourage next session
            audioManager.playNotification('break');
            this.showBreakCompleteMessage();
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
        // Enhanced confetti celebration
        this.triggerCelebration();

        // Show congratulatory message based on session count milestones
        let selectedMessage;
        
        if (this.sessionCount === 1) {
            selectedMessage = "Congratulations! First Session Complete! 🎉";
        } else if (this.sessionCount === 5) {
            selectedMessage = "Amazing! 5 Sessions Completed! You're Building Great Habits! 🏆";
        } else if (this.sessionCount === 10) {
            selectedMessage = "Incredible! 10 Sessions Done! You're a Focus Master! 👑";
        } else if (this.sessionCount % 25 === 0) {
            selectedMessage = `Phenomenal! ${this.sessionCount} Sessions! You're Unstoppable! 🌟`;
        } else if (this.sessionCount % 10 === 0) {
            selectedMessage = `Outstanding! ${this.sessionCount} Sessions Completed! 🚀`;
        } else if (this.sessionCount % 5 === 0) {
            selectedMessage = `Excellent! ${this.sessionCount} Sessions Done! Keep It Up! 💪`;
        } else {
            const congratsMessages = [
                "Well Done! Session Complete! 🌟", 
                "Excellent Work! You Stayed Focused! 💪",
                "Outstanding Focus! Another Win! 🚀",
                "Fantastic Job! Keep Going! ⭐",
                "Bravo! You Crushed That Session! 🎯",
                "Superb Concentration! Well Earned Break! 🏆",
                "Great Dedication! You're Doing Amazing! 🔥"
            ];
            selectedMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
        }
        this.rewardMessage.textContent = selectedMessage;
        this.rewardMessage.classList.add('show');
        
        // Add special milestone styling for significant achievements
        if (this.sessionCount === 1 || this.sessionCount === 5 || this.sessionCount === 10 || 
            this.sessionCount % 25 === 0 || this.sessionCount % 10 === 0) {
            this.rewardMessage.classList.add('milestone-celebration');
            // Extra confetti for milestones
            setTimeout(() => {
                confetti({
                    particleCount: 200,
                    spread: 160,
                    origin: { y: 0.5 },
                    colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD', '#F0E68C']
                });
            }, 1000);
        }
        
        // Show celebration notification
        if (window.notificationManager) {
            window.notificationManager.showNotification(
                "Session Complete!", 
                "Congratulations on completing your Pomodoro session!", 
                'success', 
                4000
            );
        }
        
        // Add rewards points and record completed pomodoro
        if (window.rewardsManager) {
            window.rewardsManager.recordCompletedPomodoro();
        }

        // Hide message after 4 seconds (longer to enjoy the celebration)
        setTimeout(() => {
            this.rewardMessage.classList.remove('show');
            this.rewardMessage.classList.remove('milestone-celebration');
        }, 4000);
    }

    triggerCelebration() {
        // Multiple confetti bursts for more celebration
        confetti({
            particleCount: 150,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        });

        // Second burst with different pattern
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 120,
                origin: { y: 0.8 },
                colors: ['#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE', '#74B9FF']
            });
        }, 300);

        // Third burst from corners
        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 45,
                origin: { x: 0, y: 0.6 }
            });
            confetti({
                particleCount: 50,
                spread: 45,
                origin: { x: 1, y: 0.6 }
            });
        }, 600);
    }

    showBreakCompleteMessage() {
        const breakMessages = [
            "Break Complete! Ready for Another Session? 💪",
            "Refreshed and Ready! Let's Focus Again! 🚀",
            "Break Time Over! Time to Get Back to Work! ⭐",
            "Recharged! Let's Continue the Momentum! 🔥",
            "Break Done! Ready to Tackle the Next Session! 🎯"
        ];

        const selectedMessage = breakMessages[Math.floor(Math.random() * breakMessages.length)];
        this.rewardMessage.textContent = selectedMessage;
        this.rewardMessage.classList.add('show');
        
        // Show encouraging notification
        if (window.notificationManager) {
            window.notificationManager.showNotification(
                "Break Complete!", 
                "Time to start your next focus session!", 
                'info', 
                3000
            );
        }

        // Light confetti for break completion
        confetti({
            particleCount: 50,
            spread: 45,
            origin: { y: 0.7 },
            colors: ['#17a2b8', '#20c997', '#6f42c1']
        });

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