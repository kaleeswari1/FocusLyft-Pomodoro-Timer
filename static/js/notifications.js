class NotificationManager {
    constructor() {
        this.hasPermission = false;
        this.checkPermission();
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
    }
}

const notificationManager = new NotificationManager();
