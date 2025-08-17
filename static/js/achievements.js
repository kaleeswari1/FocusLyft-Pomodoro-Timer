class CustomAchievements {
    constructor() {
        this.customGoals = JSON.parse(localStorage.getItem('custom_goals')) || [];
        this.completedGoals = JSON.parse(localStorage.getItem('completed_goals')) || [];
        this.subjectSessions = JSON.parse(localStorage.getItem('subject_sessions')) || {};
        this.consecutiveDays = JSON.parse(localStorage.getItem('consecutive_days')) || [];
        this.init();
    }

    init() {
        this.createGoalCreationModal();
        this.createAchievementInterface();
        this.updateGoalProgress();
    }

    createGoalCreationModal() {
        const modalHTML = `
            <div class="modal fade" id="customGoalModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-target me-2"></i>Create Custom Achievement
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Achievement Type:</label>
                                <select class="form-select" id="goalType">
                                    <option value="sessions">Complete Pomodoro Sessions</option>
                                    <option value="subject">Focus on Specific Subject</option>
                                    <option value="consecutive">Maintain Streak</option>
                                    <option value="time">Study for Total Time</option>
                                    <option value="custom">Custom Goal</option>
                                </select>
                            </div>
                            
                            <div class="mb-3" id="goalDetailsContainer">
                                <!-- Dynamic content based on goal type -->
                            </div>
                            
                            <div class="mb-3">
                                <label for="goalTitle" class="form-label">Achievement Title:</label>
                                <input type="text" class="form-control" id="goalTitle" placeholder="e.g., Math Master, Morning Warrior">
                            </div>
                            
                            <div class="mb-3">
                                <label for="goalDescription" class="form-label">Description:</label>
                                <textarea class="form-control" id="goalDescription" rows="2" placeholder="Describe what you want to achieve..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label for="goalReward" class="form-label">Personal Reward:</label>
                                <input type="text" class="form-control" id="goalReward" placeholder="e.g., Watch a movie, Buy a coffee, Take a walk">
                            </div>
                            
                            <div class="mb-3">
                                <label for="goalDeadline" class="form-label">Target Date (optional):</label>
                                <input type="date" class="form-control" id="goalDeadline">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success" id="saveCustomGoal">
                                <i class="fas fa-plus me-2"></i>Create Achievement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.getElementById('goalType').addEventListener('change', () => {
            this.updateGoalDetails();
        });
        
        document.getElementById('saveCustomGoal').addEventListener('click', () => {
            this.saveCustomGoal();
        });
        
        this.updateGoalDetails();
    }

    createAchievementInterface() {
        const interfaceHTML = `
            <div class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-trophy me-2"></i>Personal Achievements
                    </h5>
                    <button class="btn btn-success btn-sm" id="createGoalBtn">
                        <i class="fas fa-plus me-1"></i>New Goal
                    </button>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-bullseye me-2 text-primary"></i>Active Goals</h6>
                            <div id="activeGoalsList" class="goal-container mb-3">
                                <!-- Active goals will be inserted here -->
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-medal me-2 text-warning"></i>Completed Achievements</h6>
                            <div id="completedGoalsList" class="goal-container">
                                <!-- Completed goals will be inserted here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after reflection journal
        const lastCard = document.querySelector('.card:last-of-type');
        lastCard.insertAdjacentHTML('afterend', interfaceHTML);
        
        document.getElementById('createGoalBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('customGoalModal'));
            modal.show();
        });
        
        this.renderGoals();
    }

    updateGoalDetails() {
        const goalType = document.getElementById('goalType').value;
        const container = document.getElementById('goalDetailsContainer');
        
        let detailsHTML = '';
        
        switch(goalType) {
            case 'sessions':
                detailsHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Number of Sessions:</label>
                            <input type="number" class="form-control" id="sessionTarget" min="1" max="100" value="10">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Time Period:</label>
                            <select class="form-select" id="sessionPeriod">
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="total">All Time</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'subject':
                detailsHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Subject Name:</label>
                            <input type="text" class="form-control" id="subjectName" placeholder="e.g., Mathematics, History">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Sessions Required:</label>
                            <input type="number" class="form-control" id="subjectSessions" min="1" max="50" value="5">
                        </div>
                    </div>
                `;
                break;
                
            case 'consecutive':
                detailsHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Consecutive Days:</label>
                            <input type="number" class="form-control" id="consecutiveDays" min="2" max="365" value="7">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Time of Day:</label>
                            <select class="form-select" id="consecutiveTime">
                                <option value="any">Any Time</option>
                                <option value="morning">Morning (6-12 PM)</option>
                                <option value="afternoon">Afternoon (12-6 PM)</option>
                                <option value="evening">Evening (6-10 PM)</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'time':
                detailsHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Total Hours:</label>
                            <input type="number" class="form-control" id="timeTarget" min="1" max="1000" value="20">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Time Period:</label>
                            <select class="form-select" id="timePeriod">
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="total">All Time</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'custom':
                detailsHTML = `
                    <div class="mb-3">
                        <label class="form-label">Custom Metric:</label>
                        <input type="text" class="form-control" id="customMetric" placeholder="e.g., pages read, problems solved">
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Target Amount:</label>
                            <input type="number" class="form-control" id="customTarget" min="1">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Unit:</label>
                            <input type="text" class="form-control" id="customUnit" placeholder="e.g., pages, problems">
                        </div>
                    </div>
                `;
                break;
        }
        
        container.innerHTML = detailsHTML;
    }

    saveCustomGoal() {
        const goalType = document.getElementById('goalType').value;
        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const reward = document.getElementById('goalReward').value.trim();
        const deadline = document.getElementById('goalDeadline').value;
        
        if (!title || !description) {
            alert('Please fill in the title and description');
            return;
        }
        
        const goal = {
            id: Date.now(),
            type: goalType,
            title: title,
            description: description,
            reward: reward,
            deadline: deadline,
            createdDate: new Date().toISOString(),
            progress: 0,
            completed: false
        };
        
        // Add type-specific data
        switch(goalType) {
            case 'sessions':
                goal.targetSessions = parseInt(document.getElementById('sessionTarget').value);
                goal.period = document.getElementById('sessionPeriod').value;
                break;
            case 'subject':
                goal.subjectName = document.getElementById('subjectName').value.trim();
                goal.targetSessions = parseInt(document.getElementById('subjectSessions').value);
                break;
            case 'consecutive':
                goal.targetDays = parseInt(document.getElementById('consecutiveDays').value);
                goal.timeOfDay = document.getElementById('consecutiveTime').value;
                break;
            case 'time':
                goal.targetHours = parseInt(document.getElementById('timeTarget').value);
                goal.period = document.getElementById('timePeriod').value;
                break;
            case 'custom':
                goal.customMetric = document.getElementById('customMetric').value.trim();
                goal.targetAmount = parseInt(document.getElementById('customTarget').value);
                goal.unit = document.getElementById('customUnit').value.trim();
                break;
        }
        
        this.customGoals.push(goal);
        localStorage.setItem('custom_goals', JSON.stringify(this.customGoals));
        
        // Close modal and refresh display
        bootstrap.Modal.getInstance(document.getElementById('customGoalModal')).hide();
        this.renderGoals();
        
        // Clear form
        document.getElementById('goalTitle').value = '';
        document.getElementById('goalDescription').value = '';
        document.getElementById('goalReward').value = '';
        document.getElementById('goalDeadline').value = '';
        
        this.showSuccessMessage(`Achievement "${title}" created! Time to make it happen!`);
    }

    renderGoals() {
        const activeContainer = document.getElementById('activeGoalsList');
        const completedContainer = document.getElementById('completedGoalsList');
        
        // Clear containers
        activeContainer.innerHTML = '';
        completedContainer.innerHTML = '';
        
        const activeGoals = this.customGoals.filter(goal => !goal.completed);
        const completedGoals = this.completedGoals;
        
        if (activeGoals.length === 0) {
            activeContainer.innerHTML = '<p class="text-muted">No active goals. Create your first achievement!</p>';
        } else {
            activeGoals.forEach(goal => {
                activeContainer.appendChild(this.createGoalElement(goal, false));
            });
        }
        
        if (completedGoals.length === 0) {
            completedContainer.innerHTML = '<p class="text-muted">Complete goals to see them here!</p>';
        } else {
            completedGoals.slice(-5).forEach(goal => {
                completedContainer.appendChild(this.createGoalElement(goal, true));
            });
        }
    }

    createGoalElement(goal, isCompleted = false) {
        const div = document.createElement('div');
        div.className = `goal-item mb-3 p-3 border rounded ${isCompleted ? 'goal-completed' : ''}`;
        
        const progress = this.calculateProgress(goal);
        const progressPercent = Math.min((progress / this.getTarget(goal)) * 100, 100);
        
        let progressBar = '';
        if (!isCompleted) {
            progressBar = `
                <div class="progress mb-2" style="height: 8px;">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <small class="text-muted">${progress} / ${this.getTarget(goal)} ${this.getUnit(goal)}</small>
            `;
        }
        
        const deadlineText = goal.deadline ? 
            `<small class="text-muted">Target: ${new Date(goal.deadline).toLocaleDateString()}</small>` : '';
        
        const rewardText = goal.reward ? 
            `<div class="reward-text mt-2"><i class="fas fa-gift text-warning me-1"></i><small>${goal.reward}</small></div>` : '';
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="goal-title">${goal.title} ${isCompleted ? '<i class="fas fa-check-circle text-success"></i>' : ''}</h6>
                    <p class="goal-description small">${goal.description}</p>
                    ${progressBar}
                    ${deadlineText}
                    ${rewardText}
                </div>
                ${!isCompleted ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="customAchievements.deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        return div;
    }

    calculateProgress(goal) {
        const now = new Date();
        
        switch(goal.type) {
            case 'sessions':
                if (goal.period === 'week') {
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    return this.getSessionsInPeriod(weekStart);
                } else if (goal.period === 'month') {
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return this.getSessionsInPeriod(monthStart);
                } else {
                    return this.getTotalSessions();
                }
                
            case 'subject':
                return this.subjectSessions[goal.subjectName] || 0;
                
            case 'consecutive':
                return this.getCurrentStreak(goal.timeOfDay);
                
            case 'time':
                if (goal.period === 'week') {
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    return this.getStudyTimeInPeriod(weekStart);
                } else if (goal.period === 'month') {
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return this.getStudyTimeInPeriod(monthStart);
                } else {
                    return this.getTotalStudyTime();
                }
                
            case 'custom':
                return goal.progress || 0;
                
            default:
                return 0;
        }
    }

    getTarget(goal) {
        switch(goal.type) {
            case 'sessions':
                return goal.targetSessions;
            case 'subject':
                return goal.targetSessions;
            case 'consecutive':
                return goal.targetDays;
            case 'time':
                return goal.targetHours;
            case 'custom':
                return goal.targetAmount;
            default:
                return 1;
        }
    }

    getUnit(goal) {
        switch(goal.type) {
            case 'sessions':
            case 'subject':
                return 'sessions';
            case 'consecutive':
                return 'days';
            case 'time':
                return 'hours';
            case 'custom':
                return goal.unit || 'units';
            default:
                return '';
        }
    }

    // Helper methods for progress calculation
    getSessionsInPeriod(startDate) {
        const sessions = JSON.parse(localStorage.getItem('session_history')) || [];
        return sessions.filter(session => new Date(session.date) >= startDate).length;
    }

    getTotalSessions() {
        const sessions = JSON.parse(localStorage.getItem('session_history')) || [];
        return sessions.length;
    }

    getCurrentStreak(timeOfDay) {
        // Simplified streak calculation
        return this.consecutiveDays.length;
    }

    getStudyTimeInPeriod(startDate) {
        const sessions = JSON.parse(localStorage.getItem('session_history')) || [];
        const relevantSessions = sessions.filter(session => new Date(session.date) >= startDate);
        return relevantSessions.reduce((total, session) => total + (session.duration || 25), 0) / 60; // Convert to hours
    }

    getTotalStudyTime() {
        const sessions = JSON.parse(localStorage.getItem('session_history')) || [];
        return sessions.reduce((total, session) => total + (session.duration || 25), 0) / 60; // Convert to hours
    }

    // Called when a session is completed
    onSessionComplete(subject = 'General') {
        // Update subject sessions
        this.subjectSessions[subject] = (this.subjectSessions[subject] || 0) + 1;
        localStorage.setItem('subject_sessions', JSON.stringify(this.subjectSessions));
        
        // Update consecutive days
        const today = new Date().toDateString();
        if (!this.consecutiveDays.includes(today)) {
            this.consecutiveDays.push(today);
            localStorage.setItem('consecutive_days', JSON.stringify(this.consecutiveDays));
        }
        
        // Check for goal completions
        this.checkGoalCompletions();
        
        // Update progress display
        this.updateGoalProgress();
    }

    checkGoalCompletions() {
        this.customGoals.forEach(goal => {
            if (!goal.completed) {
                const progress = this.calculateProgress(goal);
                const target = this.getTarget(goal);
                
                if (progress >= target) {
                    this.completeGoal(goal);
                }
            }
        });
    }

    completeGoal(goal) {
        // Mark as completed
        goal.completed = true;
        goal.completedDate = new Date().toISOString();
        
        // Move to completed goals
        this.completedGoals.push({...goal});
        
        // Remove from active goals
        this.customGoals = this.customGoals.filter(g => g.id !== goal.id);
        
        // Save to storage
        localStorage.setItem('custom_goals', JSON.stringify(this.customGoals));
        localStorage.setItem('completed_goals', JSON.stringify(this.completedGoals));
        
        // Celebrate!
        this.celebrateGoalCompletion(goal);
        
        // Update display
        this.renderGoals();
    }

    celebrateGoalCompletion(goal) {
        // Trigger confetti
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
            }, 250);
            
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 400);
        }
        
        // Show achievement notification
        const achievementHTML = `
            <div class="achievement-notification position-fixed" style="top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1070;">
                <div class="card text-center" style="min-width: 350px; background: linear-gradient(45deg, #ffd700, #ff6b6b); color: white; border: none;">
                    <div class="card-body p-4">
                        <i class="fas fa-trophy fa-3x mb-3"></i>
                        <h4>Achievement Unlocked!</h4>
                        <h5>${goal.title}</h5>
                        <p>${goal.description}</p>
                        ${goal.reward ? `<div class="mt-3"><i class="fas fa-gift me-2"></i><strong>Your Reward:</strong> ${goal.reward}</div>` : ''}
                        <button class="btn btn-light mt-3" onclick="this.closest('.achievement-notification').remove()">
                            Awesome! 🎉
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', achievementHTML);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            const notification = document.querySelector('.achievement-notification');
            if (notification) notification.remove();
        }, 10000);
        
        // Play reward sound
        if (window.audioManager) {
            window.audioManager.playNotification('reward');
        }
    }

    updateGoalProgress() {
        this.renderGoals();
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.customGoals = this.customGoals.filter(goal => goal.id !== goalId);
            localStorage.setItem('custom_goals', JSON.stringify(this.customGoals));
            this.renderGoals();
            this.showSuccessMessage('Goal deleted successfully.');
        }
    }

    showSuccessMessage(message) {
        const alertHTML = `
            <div class="alert alert-success alert-dismissible fade show position-fixed" 
                style="top: 20px; right: 20px; z-index: 1060; max-width: 350px;">
                <i class="fas fa-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        setTimeout(() => {
            const alert = document.querySelector('.alert-success');
            if (alert) alert.remove();
        }, 5000);
    }
}

// Initialize custom achievements when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.customAchievements = new CustomAchievements();
});