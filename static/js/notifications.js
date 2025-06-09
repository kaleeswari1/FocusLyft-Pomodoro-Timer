class NotificationManager {
    constructor() {
        this.hasPermission = false;
        this.checkPermission();
        this.reminderIntervals = [];
        this.notificationsBlocked = false;
        
        // Load saved reminders after a short delay to ensure permission is checked
        setTimeout(() => this.loadSavedReminders(), 1000);
    }

    async checkPermission() {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }

        if (Notification.permission === "granted") {
            this.hasPermission = true;
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === "granted";
        }
    }

    async blockNotifications() {
        if (!this.hasPermission) {
            await this.checkPermission();
        }

        // Set the block state
        this.notificationsBlocked = true;

        // Cancel any scheduled task reminders
        if (window.todoManager && typeof window.todoManager.scheduleReminders === 'function') {
            window.todoManager.scheduleReminders();
        }

        if (this.hasPermission) {
            // Create a focus notification before blocking
            new Notification("Focus Mode Activated", {
                body: "Notifications are now blocked for better concentration",
                icon: "/static/images/focus-icon.svg"
            });

            // If supported, use the Focus API to minimize distractions
            if ('Focus' in window) {
                try {
                    await window.Focus.request({ mode: 'focus' });
                } catch (error) {
                    console.log("Focus mode not supported");
                }
            }

            // Override the native Notification constructor to block all notifications
            const originalNotification = window.Notification;
            window.Notification = function(title, options) {
                if (notificationManager.notificationsBlocked) {
                    console.log("Notification blocked:", title);
                    return {
                        close: function() {}
                    };
                }
                return new originalNotification(title, options);
            };

            // Copy properties from the original Notification
            for (let prop in originalNotification) {
                if (originalNotification.hasOwnProperty(prop)) {
                    window.Notification[prop] = originalNotification[prop];
                }
            }

            // Store original for later restoration
            window.Notification._original = originalNotification;

            // Also disable audio notifications
            if (window.audioManager) {
                window.audioManager.setNotificationsEnabled(false);
            }
        }
    }

    async unblockNotifications() {
        // Reset the block state
        this.notificationsBlocked = false;

        // Restore original Notification if it was overridden
        if (window.Notification && window.Notification._original) {
            window.Notification = window.Notification._original;
        }

        // Re-schedule task reminders
        if (window.todoManager) {
            window.todoManager.scheduleReminders();
        }

        if ('Focus' in window) {
            try {
                await window.Focus.release();
            } catch (error) {
                console.log("Focus mode not supported");
            }
        }

        if (this.hasPermission) {
            new Notification("Break Time!", {
                body: "Notifications are now enabled",
                icon: "/static/images/break-icon.svg"
            });
        }

        // Re-enable audio notifications
        if (window.audioManager) {
            window.audioManager.setNotificationsEnabled(true);
        }
    }

    // New methods for enhanced reminders
    async setStudyReminder(minutes) {
        if (!this.hasPermission) return;

        const reminder = setTimeout(() => {
            new Notification("Study Reminder", {
                body: `${minutes} minutes left in your study session!`,
                icon: "/static/images/focus-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('reminder');
            }
        }, (minutes - 5) * 60 * 1000); // Notify 5 minutes before end

        this.reminderIntervals.push(reminder);
    }

    async setBreakReminder(minutes) {
        if (!this.hasPermission) return;

        const reminder = setTimeout(() => {
            new Notification("Break Reminder", {
                body: `Break time ends in 2 minutes!`,
                icon: "/static/images/break-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('break');
            }
        }, (minutes - 2) * 60 * 1000); // Notify 2 minutes before break ends

        this.reminderIntervals.push(reminder);
    }

    async setExamReminder(exam) {
        if (!this.hasPermission) return;

        const examDate = new Date(exam.date);
        const now = new Date();
        const daysUntilExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));

        // Set reminders for 7 days, 3 days, and 1 day before exam
        if (daysUntilExam <= 7) {
            new Notification("Exam Reminder", {
                body: `Your ${exam.subject} exam is in ${daysUntilExam} days!`,
                icon: "/static/images/focus-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('reminder');
            }
        }
    }

    clearAllReminders() {
        this.reminderIntervals.forEach(interval => clearTimeout(interval));
        this.reminderIntervals = [];
    }

    // Enhanced reminder features
    async setDailyStudyReminder(hours, minutes) {
        if (!this.hasPermission) return;

        const now = new Date();
        const reminder = new Date();
        reminder.setHours(hours, minutes, 0, 0);

        // If the time has passed today, set for tomorrow
        if (reminder <= now) {
            reminder.setDate(reminder.getDate() + 1);
        }

        const timeUntilReminder = reminder.getTime() - now.getTime();

        const reminderTimeout = setTimeout(() => {
            new Notification("Daily Study Reminder", {
                body: "Time to start your daily study session!",
                icon: "/static/images/focus-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('reminder');
            }
            // Set up for next day
            this.setDailyStudyReminder(hours, minutes);
        }, timeUntilReminder);

        this.reminderIntervals.push(reminderTimeout);
    }

    async setHydrationReminder(intervalMinutes = 30) {
        if (!this.hasPermission) return;

        const hydrationInterval = setInterval(() => {
            new Notification("Hydration Reminder", {
                body: "Time to drink some water! Stay hydrated for better focus.",
                icon: "/static/images/break-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('gentle');
            }
        }, intervalMinutes * 60 * 1000);

        this.reminderIntervals.push(hydrationInterval);
        localStorage.setItem('hydrationReminderInterval', intervalMinutes);
    }

    async setEyeRestReminder(intervalMinutes = 20) {
        if (!this.hasPermission) return;

        const eyeRestInterval = setInterval(() => {
            new Notification("Eye Rest Reminder", {
                body: "Follow the 20-20-20 rule: Look at something 20 feet away for 20 seconds!",
                icon: "/static/images/focus-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('gentle');
            }
        }, intervalMinutes * 60 * 1000);

        this.reminderIntervals.push(eyeRestInterval);
        localStorage.setItem('eyeRestReminderInterval', intervalMinutes);
    }

    async setPostureReminder(intervalMinutes = 45) {
        if (!this.hasPermission) return;

        const postureInterval = setInterval(() => {
            new Notification("Posture Check", {
                body: "Check your posture! Sit up straight and adjust your position.",
                icon: "/static/images/focus-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('gentle');
            }
        }, intervalMinutes * 60 * 1000);

        this.reminderIntervals.push(postureInterval);
        localStorage.setItem('postureReminderInterval', intervalMinutes);
    }

    async setCustomReminder(title, message, intervalMinutes) {
        if (!this.hasPermission) return;

        const customInterval = setInterval(() => {
            new Notification(title, {
                body: message,
                icon: "/static/images/focus-icon.svg"
            });
            if (window.audioManager) {
                window.audioManager.playNotification('reminder');
            }
        }, intervalMinutes * 60 * 1000);

        this.reminderIntervals.push(customInterval);
        
        // Save custom reminders to localStorage
        const customReminders = JSON.parse(localStorage.getItem('customReminders') || '[]');
        customReminders.push({ title, message, intervalMinutes, id: Date.now() });
        localStorage.setItem('customReminders', JSON.stringify(customReminders));
    }

    loadSavedReminders() {
        // Load and restart hydration reminders
        const hydrationInterval = localStorage.getItem('hydrationReminderInterval');
        if (hydrationInterval) {
            this.setHydrationReminder(parseInt(hydrationInterval));
        }

        // Load and restart eye rest reminders
        const eyeRestInterval = localStorage.getItem('eyeRestReminderInterval');
        if (eyeRestInterval) {
            this.setEyeRestReminder(parseInt(eyeRestInterval));
        }

        // Load and restart posture reminders
        const postureInterval = localStorage.getItem('postureReminderInterval');
        if (postureInterval) {
            this.setPostureReminder(parseInt(postureInterval));
        }

        // Load custom reminders
        const customReminders = JSON.parse(localStorage.getItem('customReminders') || '[]');
        customReminders.forEach(reminder => {
            this.setCustomReminder(reminder.title, reminder.message, reminder.intervalMinutes);
        });
    }

    removeCustomReminder(reminderId) {
        const customReminders = JSON.parse(localStorage.getItem('customReminders') || '[]');
        const filteredReminders = customReminders.filter(r => r.id !== reminderId);
        localStorage.setItem('customReminders', JSON.stringify(filteredReminders));
    }

    // Add a method to show in-app notifications
    showNotification(title, message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification`;
        notification.innerHTML = `
            <strong>${title}</strong>
            <p>${message}</p>
        `;

        // Add to DOM
        const container = document.getElementById('examNotification');
        if (container) {
            container.appendChild(notification);

            // Remove after duration
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }
    }
}

// Create a global notificationManager instance
const notificationManager = new NotificationManager();
window.notificationManager = notificationManager;

// Initialize notification controls when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Find notification toggle and status elements
    const toggleBtn = document.getElementById('toggleNotifications');
    const focusStatus = document.getElementById('focusStatus');

    // Only add event listeners if elements exist
    if (toggleBtn && focusStatus) {
        toggleBtn.addEventListener('click', async () => {
            if (notificationManager.notificationsBlocked) {
                // Unblock notifications
                await notificationManager.unblockNotifications();
                toggleBtn.innerHTML = '<i class="fas fa-bell"></i> Block Notifications';
                toggleBtn.classList.remove('btn-danger');
                toggleBtn.classList.add('btn-outline-secondary');
                focusStatus.classList.add('d-none');
            } else {
                // Block notifications
                await notificationManager.blockNotifications();
                toggleBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Unblock Notifications';
                toggleBtn.classList.remove('btn-outline-secondary');
                toggleBtn.classList.add('btn-danger');
                focusStatus.classList.remove('d-none');
            }
        });
    }

    // Enhanced reminder controls
    initializeReminderControls();
});

function initializeReminderControls() {
    // Hydration reminder
    const setHydrationBtn = document.getElementById('setHydration');
    if (setHydrationBtn) {
        setHydrationBtn.addEventListener('click', () => {
            const interval = document.getElementById('hydrationInterval').value || 30;
            notificationManager.setHydrationReminder(parseInt(interval));
            updateActiveRemindersDisplay();
            notificationManager.showNotification('Hydration Reminder Set', `Will remind you every ${interval} minutes to drink water`);
        });
    }

    // Eye rest reminder
    const setEyeRestBtn = document.getElementById('setEyeRest');
    if (setEyeRestBtn) {
        setEyeRestBtn.addEventListener('click', () => {
            const interval = document.getElementById('eyeRestInterval').value || 20;
            notificationManager.setEyeRestReminder(parseInt(interval));
            updateActiveRemindersDisplay();
            notificationManager.showNotification('Eye Rest Reminder Set', `Will remind you every ${interval} minutes to rest your eyes`);
        });
    }

    // Posture reminder
    const setPostureBtn = document.getElementById('setPosture');
    if (setPostureBtn) {
        setPostureBtn.addEventListener('click', () => {
            const interval = document.getElementById('postureInterval').value || 45;
            notificationManager.setPostureReminder(parseInt(interval));
            updateActiveRemindersDisplay();
            notificationManager.showNotification('Posture Reminder Set', `Will remind you every ${interval} minutes to check your posture`);
        });
    }

    // Daily study reminder
    const setDailyStudyBtn = document.getElementById('setDailyStudy');
    if (setDailyStudyBtn) {
        setDailyStudyBtn.addEventListener('click', () => {
            const timeInput = document.getElementById('dailyStudyTime').value;
            if (timeInput) {
                const [hours, minutes] = timeInput.split(':').map(Number);
                notificationManager.setDailyStudyReminder(hours, minutes);
                updateActiveRemindersDisplay();
                notificationManager.showNotification('Daily Study Reminder Set', `Will remind you daily at ${timeInput} to start studying`);
            }
        });
    }

    // Custom reminder
    const addCustomBtn = document.getElementById('addCustomReminder');
    if (addCustomBtn) {
        addCustomBtn.addEventListener('click', () => {
            const title = document.getElementById('customTitle').value;
            const message = document.getElementById('customMessage').value;
            const interval = document.getElementById('customInterval').value;

            if (title && message && interval) {
                notificationManager.setCustomReminder(title, message, parseInt(interval));
                updateActiveRemindersDisplay();
                notificationManager.showNotification('Custom Reminder Added', `"${title}" will remind you every ${interval} minutes`);
                
                // Clear inputs
                document.getElementById('customTitle').value = '';
                document.getElementById('customMessage').value = '';
                document.getElementById('customInterval').value = '';
            } else {
                notificationManager.showNotification('Error', 'Please fill in all fields for the custom reminder', 'warning');
            }
        });
    }

    // Clear all reminders
    const clearAllBtn = document.getElementById('clearAllReminders');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            notificationManager.clearAllReminders();
            // Clear saved reminders from localStorage
            localStorage.removeItem('hydrationReminderInterval');
            localStorage.removeItem('eyeRestReminderInterval');
            localStorage.removeItem('postureReminderInterval');
            localStorage.removeItem('customReminders');
            updateActiveRemindersDisplay();
            notificationManager.showNotification('All Reminders Cleared', 'All active reminders have been removed');
        });
    }

    // Load saved values into inputs
    loadSavedReminderSettings();
    updateActiveRemindersDisplay();
}

function loadSavedReminderSettings() {
    // Load saved intervals into input fields
    const hydrationInterval = localStorage.getItem('hydrationReminderInterval');
    if (hydrationInterval) {
        const input = document.getElementById('hydrationInterval');
        if (input) input.value = hydrationInterval;
    }

    const eyeRestInterval = localStorage.getItem('eyeRestReminderInterval');
    if (eyeRestInterval) {
        const input = document.getElementById('eyeRestInterval');
        if (input) input.value = eyeRestInterval;
    }

    const postureInterval = localStorage.getItem('postureReminderInterval');
    if (postureInterval) {
        const input = document.getElementById('postureInterval');
        if (input) input.value = postureInterval;
    }
}

function updateActiveRemindersDisplay() {
    const activeRemindersDiv = document.getElementById('activeReminders');
    if (!activeRemindersDiv) return;

    const reminders = [];
    
    // Check for active reminders
    if (localStorage.getItem('hydrationReminderInterval')) {
        reminders.push(`Hydration: Every ${localStorage.getItem('hydrationReminderInterval')} min`);
    }
    if (localStorage.getItem('eyeRestReminderInterval')) {
        reminders.push(`Eye Rest: Every ${localStorage.getItem('eyeRestReminderInterval')} min`);
    }
    if (localStorage.getItem('postureReminderInterval')) {
        reminders.push(`Posture: Every ${localStorage.getItem('postureReminderInterval')} min`);
    }

    const customReminders = JSON.parse(localStorage.getItem('customReminders') || '[]');
    customReminders.forEach(reminder => {
        reminders.push(`${reminder.title}: Every ${reminder.intervalMinutes} min`);
    });

    if (reminders.length === 0) {
        activeRemindersDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>No active reminders</span>
                <button class="btn btn-sm btn-outline-danger" id="clearAllReminders">Clear All</button>
            </div>
        `;
    } else {
        activeRemindersDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Active Reminders:</strong>
                <button class="btn btn-sm btn-outline-danger" id="clearAllReminders">Clear All</button>
            </div>
            ${reminders.map(reminder => `<div class="small text-muted">• ${reminder}</div>`).join('')}
        `;
    }

    // Re-attach clear button event listener
    const clearBtn = document.getElementById('clearAllReminders');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            notificationManager.clearAllReminders();
            localStorage.removeItem('hydrationReminderInterval');
            localStorage.removeItem('eyeRestReminderInterval');
            localStorage.removeItem('postureReminderInterval');
            localStorage.removeItem('customReminders');
            updateActiveRemindersDisplay();
            notificationManager.showNotification('All Reminders Cleared', 'All active reminders have been removed');
        });
    }
}