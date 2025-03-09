
class RewardsManager {
    constructor() {
        this.rewards = this.loadRewards();
        this.badges = [
            { id: 'beginner', name: 'Beginner', icon: '🔰', description: 'Complete your first pomodoro session', achieved: false },
            { id: 'focused', name: 'Focused Mind', icon: '🧠', description: 'Complete 5 pomodoro sessions', achieved: false },
            { id: 'productive', name: 'Productivity Master', icon: '⚡', description: 'Complete 20 pomodoro sessions', achieved: false },
            { id: 'organized', name: 'Task Organizer', icon: '📋', description: 'Complete 10 tasks', achieved: false },
            { id: 'punctual', name: 'Punctuality Pro', icon: '⏰', description: 'Complete 5 tasks before their due date', achieved: false },
            { id: 'consistent', name: 'Consistency King', icon: '👑', description: 'Use the app for 7 consecutive days', achieved: false },
        ];
        
        this.streaks = {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null
        };
        
        this.initializeUI();
        this.checkStreak();
    }
    
    loadRewards() {
        const stored = localStorage.getItem('pomodoro_rewards');
        return stored ? JSON.parse(stored) : {
            points: 0,
            completedPomodoros: 0,
            completedTasks: 0,
            achievedBadges: []
        };
    }
    
    saveRewards() {
        localStorage.setItem('pomodoro_rewards', JSON.stringify(this.rewards));
    }
    
    addPoints(amount, reason) {
        this.rewards.points += amount;
        this.saveRewards();
        this.updatePointsDisplay();
        
        // Show animation
        this.showPointsAnimation(amount, reason);
        
        // Check for achievements
        this.checkAchievements();
    }
    
    recordCompletedPomodoro() {
        this.rewards.completedPomodoros += 1;
        this.addPoints(20, 'Completed Pomodoro');
        this.saveRewards();
        this.checkAchievements();
    }
    
    recordCompletedTask(task) {
        this.rewards.completedTasks += 1;
        
        // Bonus points for completing before due date
        let points = 10;
        let reason = 'Completed Task';
        
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            if (dueDate > new Date()) {
                points = 15;
                reason = 'Completed Task Early';
            }
        }
        
        // Bonus points based on priority
        if (task.priority === 'high') {
            points += 5;
        }
        
        this.addPoints(points, reason);
        this.saveRewards();
        this.checkAchievements();
    }
    
    checkAchievements() {
        // Check for badge achievements
        const newAchievements = [];
        
        this.badges.forEach(badge => {
            // Skip already achieved badges
            if (this.rewards.achievedBadges.includes(badge.id)) {
                badge.achieved = true;
                return;
            }
            
            let achieved = false;
            
            switch(badge.id) {
                case 'beginner':
                    achieved = this.rewards.completedPomodoros >= 1;
                    break;
                case 'focused':
                    achieved = this.rewards.completedPomodoros >= 5;
                    break;
                case 'productive':
                    achieved = this.rewards.completedPomodoros >= 20;
                    break;
                case 'organized':
                    achieved = this.rewards.completedTasks >= 10;
                    break;
                case 'punctual':
                    // This is tracked separately when tasks are completed
                    break;
                case 'consistent':
                    achieved = this.streaks.currentStreak >= 7;
                    break;
            }
            
            if (achieved && !badge.achieved) {
                badge.achieved = true;
                this.rewards.achievedBadges.push(badge.id);
                newAchievements.push(badge);
                
                // Award points for achievement
                this.addPoints(50, `${badge.name} Achievement Unlocked`);
            }
        });
        
        // Show achievement notifications
        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
        }
        
        this.saveRewards();
        this.updateBadgesDisplay();
    }
    
    checkStreak() {
        const today = new Date().toDateString();
        const lastActive = this.streaks.lastActiveDate;
        
        if (!lastActive) {
            // First time using the app
            this.streaks.currentStreak = 1;
            this.streaks.longestStreak = 1;
            this.streaks.lastActiveDate = today;
        } else if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toDateString();
            
            if (lastActive === yesterdayString) {
                // Consecutive day
                this.streaks.currentStreak += 1;
                if (this.streaks.currentStreak > this.streaks.longestStreak) {
                    this.streaks.longestStreak = this.streaks.currentStreak;
                }
            } else {
                // Streak broken
                this.streaks.currentStreak = 1;
            }
            
            this.streaks.lastActiveDate = today;
        }
        
        localStorage.setItem('pomodoro_streaks', JSON.stringify(this.streaks));
        this.updateStreakDisplay();
    }
    
    showPointsAnimation(points, reason) {
        const container = document.getElementById('rewardsPointsContainer');
        if (!container) return;
        
        const animation = document.createElement('div');
        animation.className = 'points-animation';
        animation.innerHTML = `+${points} <small>${reason}</small>`;
        
        container.appendChild(animation);
        
        // Trigger animation
        setTimeout(() => {
            animation.classList.add('show');
        }, 10);
        
        // Remove after animation completes
        setTimeout(() => {
            animation.classList.remove('show');
            setTimeout(() => {
                animation.remove();
            }, 500);
        }, 2000);
    }
    
    showAchievementNotification(achievements) {
        achievements.forEach(badge => {
            // Show notification if available
            if (window.notificationManager && Notification.permission === 'granted') {
                const notification = new Notification('Achievement Unlocked!', {
                    body: `${badge.icon} ${badge.name}: ${badge.description}`,
                    icon: '/static/images/badge-icon.png'
                });
                
                setTimeout(() => notification.close(), 5000);
            }
            
            // Show in-app notification
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Achievement Unlocked!',
                    `${badge.icon} ${badge.name}: ${badge.description}`,
                    'success',
                    8000
                );
            }
            
            // Add animation
            const badgeElement = document.createElement('div');
            badgeElement.className = 'achievement-popup';
            badgeElement.innerHTML = `
                <div class="achievement-icon">${badge.icon}</div>
                <div class="achievement-details">
                    <h4>Achievement Unlocked!</h4>
                    <p>${badge.name}</p>
                    <p>${badge.description}</p>
                </div>
            `;
            
            document.body.appendChild(badgeElement);
            
            setTimeout(() => {
                badgeElement.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                badgeElement.classList.remove('show');
                setTimeout(() => {
                    badgeElement.remove();
                }, 500);
            }, 5000);
        });
    }
    
    updatePointsDisplay() {
        const pointsElement = document.getElementById('rewardsPoints');
        if (pointsElement) {
            pointsElement.textContent = this.rewards.points;
        }
    }
    
    updateBadgesDisplay() {
        const badgesElement = document.getElementById('badgesList');
        if (!badgesElement) return;
        
        badgesElement.innerHTML = '';
        
        this.badges.forEach(badge => {
            const badgeItem = document.createElement('div');
            badgeItem.className = `badge-item ${badge.achieved ? 'achieved' : 'locked'}`;
            badgeItem.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-details">
                    <h5>${badge.name}</h5>
                    <p>${badge.description}</p>
                </div>
            `;
            
            badgesElement.appendChild(badgeItem);
        });
    }
    
    updateStreakDisplay() {
        const streakElement = document.getElementById('currentStreak');
        if (streakElement) {
            streakElement.textContent = this.streaks.currentStreak;
        }
        
        const longestStreakElement = document.getElementById('longestStreak');
        if (longestStreakElement) {
            longestStreakElement.textContent = this.streaks.longestStreak;
        }
    }
    
    initializeUI() {
        // We'll initialize UI only after DOM is fully loaded
        if (document.readyState === 'complete') {
            this.renderRewardsUI();
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                this.renderRewardsUI();
            });
        }
    }
    
    renderRewardsUI() {
        const rewardsTab = document.getElementById('rewardsTab');
        
        if (rewardsTab) {
            this.updatePointsDisplay();
            this.updateBadgesDisplay();
            this.updateStreakDisplay();
        } else {
            console.warn('Rewards tab element not found');
        }
    }
}

// Initialize rewards manager when the page loads
let rewardsManager;
if (document.readyState === 'complete') {
    rewardsManager = new RewardsManager();
    window.rewardsManager = rewardsManager;
} else {
    window.addEventListener('DOMContentLoaded', () => {
        rewardsManager = new RewardsManager();
        window.rewardsManager = rewardsManager;
    });
}
