class SessionFeedback {
    constructor() {
        this.currentRating = null;
        this.selectedTags = [];
        this.sessionHistory = this.loadSessionHistory();
        this.initializeEventListeners();
    }

    loadSessionHistory() {
        return JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    }

    saveSessionHistory() {
        localStorage.setItem('sessionHistory', JSON.stringify(this.sessionHistory));
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupModalEventListeners();
        });
    }

    setupModalEventListeners() {
        // Emoji rating buttons
        const emojiButtons = document.querySelectorAll('.feedback-emoji');
        emojiButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectRating(button);
            });
        });

        // Tag buttons
        const tagButtons = document.querySelectorAll('.feedback-tag');
        tagButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.toggleTag(button);
            });
        });

        // Submit and skip buttons
        const submitBtn = document.getElementById('submitFeedback');
        const skipBtn = document.getElementById('skipFeedback');

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitFeedback();
            });
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.skipFeedback();
            });
        }

        // Modal reset when hidden
        const modal = document.getElementById('sessionFeedbackModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        }
    }

    selectRating(button) {
        // Remove selection from all emoji buttons
        document.querySelectorAll('.feedback-emoji').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked button
        button.classList.add('selected');
        this.currentRating = parseInt(button.dataset.rating);

        // Enable submit button if rating is selected
        const submitBtn = document.getElementById('submitFeedback');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }

    toggleTag(button) {
        const tag = button.dataset.tag;
        
        if (button.classList.contains('selected')) {
            button.classList.remove('selected');
            this.selectedTags = this.selectedTags.filter(t => t !== tag);
        } else {
            button.classList.add('selected');
            this.selectedTags.push(tag);
        }
    }

    showFeedbackModal() {
        const modal = new bootstrap.Modal(document.getElementById('sessionFeedbackModal'));
        modal.show();
    }

    submitFeedback() {
        const notes = document.getElementById('sessionNotes').value;
        const sessionData = {
            date: new Date().toISOString(),
            rating: this.currentRating,
            tags: [...this.selectedTags],
            notes: notes,
            sessionNumber: this.sessionHistory.length + 1
        };

        this.sessionHistory.push(sessionData);
        this.saveSessionHistory();

        // Show thank you message
        if (window.notificationManager) {
            window.notificationManager.showNotification(
                'Feedback Saved!', 
                'Thank you for rating your session. This helps track your progress!', 
                'success', 
                3000
            );
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('sessionFeedbackModal'));
        modal.hide();

        // Update statistics display
        this.updateStatisticsDisplay();

        // Show insights if enough data
        setTimeout(() => {
            this.showInsights();
        }, 1000);
    }

    skipFeedback() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('sessionFeedbackModal'));
        modal.hide();
    }

    resetForm() {
        this.currentRating = null;
        this.selectedTags = [];

        // Reset emoji selection
        document.querySelectorAll('.feedback-emoji').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Reset tag selection
        document.querySelectorAll('.feedback-tag').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Clear notes
        const notesField = document.getElementById('sessionNotes');
        if (notesField) {
            notesField.value = '';
        }

        // Disable submit button
        const submitBtn = document.getElementById('submitFeedback');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    showInsights() {
        if (this.sessionHistory.length < 3) return;

        const recentSessions = this.sessionHistory.slice(-5);
        const avgRating = recentSessions.reduce((sum, session) => sum + session.rating, 0) / recentSessions.length;
        
        let insightMessage = '';
        
        if (avgRating >= 4) {
            insightMessage = `Your focus is excellent! Average rating: ${avgRating.toFixed(1)}/5 stars`;
        } else if (avgRating >= 3) {
            insightMessage = `Good progress! Average rating: ${avgRating.toFixed(1)}/5. Keep building your focus habits`;
        } else {
            insightMessage = `Your focus is improving! Average rating: ${avgRating.toFixed(1)}/5. Try adjusting your environment`;
        }

        // Find most common tags
        const tagCounts = {};
        recentSessions.forEach(session => {
            session.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const topTag = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b, '');
        if (topTag) {
            insightMessage += `. Most common mood: ${topTag}`;
        }

        if (window.notificationManager) {
            window.notificationManager.showNotification(
                'Session Insights', 
                insightMessage, 
                'info', 
                6000
            );
        }
    }

    getSessionStats() {
        const totalSessions = this.sessionHistory.length;
        if (totalSessions === 0) return null;

        const avgRating = this.sessionHistory.reduce((sum, session) => sum + session.rating, 0) / totalSessions;
        
        const tagCounts = {};
        this.sessionHistory.forEach(session => {
            session.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const recentSessions = this.sessionHistory.slice(-7);
        const recentAvg = recentSessions.reduce((sum, session) => sum + session.rating, 0) / recentSessions.length;

        return {
            totalSessions,
            averageRating: avgRating,
            recentAverageRating: recentAvg,
            topTags: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
            lastSession: this.sessionHistory[this.sessionHistory.length - 1]
        };
    }

    updateStatisticsDisplay() {
        const stats = this.getSessionStats();
        const statsCard = document.getElementById('sessionStatsCard');
        
        if (!stats || stats.totalSessions === 0) {
            if (statsCard) {
                statsCard.style.display = 'none';
            }
            return;
        }

        // Show stats card
        if (statsCard) {
            statsCard.style.display = 'block';
        }

        // Update stat values
        const totalElement = document.getElementById('totalSessionsCount');
        const avgElement = document.getElementById('averageRating');
        const recentElement = document.getElementById('recentRating');
        const topMoodElement = document.getElementById('topMood');

        if (totalElement) totalElement.textContent = stats.totalSessions;
        if (avgElement) avgElement.textContent = stats.averageRating.toFixed(1);
        if (recentElement) recentElement.textContent = stats.recentAverageRating.toFixed(1);
        if (topMoodElement && stats.topTags.length > 0) {
            topMoodElement.textContent = stats.topTags[0][0];
        }

        // Update recent sessions timeline
        this.updateSessionTimeline();
    }

    updateSessionTimeline() {
        const timelineElement = document.getElementById('recentSessionsChart');
        if (!timelineElement) return;

        const recentSessions = this.sessionHistory.slice(-10); // Show last 10 sessions
        
        if (recentSessions.length === 0) {
            timelineElement.innerHTML = '<p class="text-muted text-center">No sessions yet</p>';
            return;
        }

        const sessionDots = recentSessions.map((session, index) => {
            const ratingEmojis = ['😞', '😐', '🙂', '😊', '🤩'];
            const emoji = ratingEmojis[session.rating - 1];
            const date = new Date(session.date).toLocaleDateString();
            
            return `
                <div class="session-dot rating-${session.rating}" 
                     title="Session ${session.sessionNumber} - Rating: ${session.rating}/5 - ${date}">
                    ${emoji}
                </div>
            `;
        }).join('');

        timelineElement.innerHTML = sessionDots;
    }

    // Initialize statistics display on page load
    initializeStatisticsDisplay() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateStatisticsDisplay();
        });
    }
}

// Create global feedback manager
window.sessionFeedback = new SessionFeedback();
window.sessionFeedback.initializeStatisticsDisplay();