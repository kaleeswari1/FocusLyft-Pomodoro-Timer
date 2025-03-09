class NotificationManager {
    constructor() {
        this.hasPermission = false;
        this.checkPermission();
        this.reminderIntervals = [];
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

        if (this.hasPermission) {
            // Create a focus notification
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
            
            // Also disable audio notifications
            if (window.audioManager) {
                window.audioManager.setNotificationsEnabled(false);
            }
        }
    }

    async unblockNotifications() {
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
            audioManager.playNotification('reminder');
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
            audioManager.playNotification('break');
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
            audioManager.playNotification('reminder');
        }
    }

    clearAllReminders() {
        this.reminderIntervals.forEach(interval => clearTimeout(interval));
        this.reminderIntervals = [];
    }
}

const notificationManager = new NotificationManager();

// Handle notification toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleNotifications');
    const focusStatus = document.getElementById('focusStatus');
    let notificationsBlocked = false;

    toggleBtn.addEventListener('click', async () => {
        if (notificationsBlocked) {
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
        notificationsBlocked = !notificationsBlocked;
    });
});