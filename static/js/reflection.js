class ReflectionJournal {
    constructor() {
        this.reflections = JSON.parse(localStorage.getItem('study_reflections')) || [];
        this.distractions = JSON.parse(localStorage.getItem('distractions')) || [];
        this.currentSessionCount = 0;
        this.reflectionTriggerCount = 3; // Trigger after 3-4 sessions
        this.lastReflectionSession = 0;
        this.init();
    }

    init() {
        this.createReflectionModal();
        this.createDistractionModal();
        this.createJournalView();
        this.setupVisibilityHandler();
    }

    createReflectionModal() {
        const modalHTML = `
            <div class="modal fade" id="reflectionModal" tabindex="-1" aria-labelledby="reflectionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="reflectionModalLabel">
                                <i class="fas fa-lightbulb me-2"></i>Study Reflection
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div id="reflectionPrompt" class="mb-3">
                                <p class="lead text-center" id="reflectionQuestion"></p>
                            </div>
                            <div class="mb-3">
                                <label for="reflectionText" class="form-label">Your reflection:</label>
                                <textarea class="form-control" id="reflectionText" rows="4" 
                                    placeholder="Take a moment to think about your study session..."></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="subjectTag" class="form-label">Subject studied:</label>
                                <input type="text" class="form-control" id="subjectTag" 
                                    placeholder="e.g., Mathematics, History, Biology">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">How productive did you feel?</label>
                                <div class="d-flex justify-content-between">
                                    <button class="btn btn-outline-danger reflection-rating" data-rating="1">😫 Poor</button>
                                    <button class="btn btn-outline-warning reflection-rating" data-rating="2">😐 Okay</button>
                                    <button class="btn btn-outline-info reflection-rating" data-rating="3">🙂 Good</button>
                                    <button class="btn btn-outline-success reflection-rating" data-rating="4">😊 Great</button>
                                    <button class="btn btn-outline-primary reflection-rating" data-rating="5">🤩 Amazing</button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Skip</button>
                            <button type="button" class="btn btn-primary" id="saveReflection" disabled>
                                <i class="fas fa-save me-2"></i>Save Reflection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        document.querySelectorAll('.reflection-rating').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.reflection-rating').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedRating = parseInt(e.target.dataset.rating);
                this.updateSaveButton();
            });
        });

        document.getElementById('reflectionText').addEventListener('input', () => {
            this.updateSaveButton();
        });

        document.getElementById('saveReflection').addEventListener('click', () => {
            this.saveReflection();
        });
    }

    createDistractionModal() {
        const modalHTML = `
            <div class="modal fade" id="distractionModal" tabindex="-1" aria-labelledby="distractionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title" id="distractionModalLabel">
                                <i class="fas fa-eye me-2"></i>Quick Check
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <p>What pulled your attention away?</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary distraction-btn" data-distraction="social-media">
                                    <i class="fab fa-instagram me-2"></i>Social Media
                                </button>
                                <button class="btn btn-outline-primary distraction-btn" data-distraction="phone-call">
                                    <i class="fas fa-phone me-2"></i>Phone Call/Text
                                </button>
                                <button class="btn btn-outline-primary distraction-btn" data-distraction="tired">
                                    <i class="fas fa-bed me-2"></i>Feeling Tired
                                </button>
                                <button class="btn btn-outline-primary distraction-btn" data-distraction="hungry">
                                    <i class="fas fa-utensils me-2"></i>Hungry/Thirsty
                                </button>
                                <button class="btn btn-outline-primary distraction-btn" data-distraction="noise">
                                    <i class="fas fa-volume-up me-2"></i>Noise/Environment
                                </button>
                                <button class="btn btn-outline-primary distraction-btn" data-distraction="other">
                                    <i class="fas fa-question me-2"></i>Other
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.querySelectorAll('.distraction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const distraction = e.currentTarget.dataset.distraction;
                this.recordDistraction(distraction);
                bootstrap.Modal.getInstance(document.getElementById('distractionModal')).hide();
            });
        });
    }

    createJournalView() {
        // This will be added to the main interface
        const journalHTML = `
            <div class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-journal-whills me-2"></i>Study Journal & Insights
                    </h5>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" id="viewReflections">
                            <i class="fas fa-book me-1"></i>Journal
                        </button>
                        <button class="btn btn-sm btn-outline-warning" id="viewDistractions">
                            <i class="fas fa-chart-bar me-1"></i>Distractions
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="journalContent">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="insight-box">
                                    <h6><i class="fas fa-trophy text-warning me-2"></i>Recent Achievement</h6>
                                    <p id="recentAchievement" class="text-muted">Complete your first reflection to see insights!</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="insight-box">
                                    <h6><i class="fas fa-exclamation-triangle text-danger me-2"></i>Top Distraction</h6>
                                    <p id="topDistraction" class="text-muted">Track your focus patterns here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after task management section
        const taskSection = document.querySelector('.card').parentNode;
        taskSection.insertAdjacentHTML('afterend', journalHTML);

        // Add event listeners
        document.getElementById('viewReflections').addEventListener('click', () => {
            this.showJournalEntries();
        });

        document.getElementById('viewDistractions').addEventListener('click', () => {
            this.showDistractionReport();
        });

        this.updateInsights();
    }

    setupVisibilityHandler() {
        let wasVisible = true;
        let sessionStartTime = Date.now();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page became hidden
                wasVisible = false;
                sessionStartTime = Date.now();
            } else {
                // Page became visible again
                if (!wasVisible) {
                    const timeAway = Date.now() - sessionStartTime;
                    // If away for more than 30 seconds during an active session
                    if (timeAway > 30000 && window.pomodoroTimer && window.pomodoroTimer.isRunning) {
                        setTimeout(() => {
                            this.showDistractionCapture();
                        }, 1000); // Small delay to let user settle back in
                    }
                }
                wasVisible = true;
            }
        });
    }

    onSessionComplete() {
        this.currentSessionCount++;
        
        // Trigger reflection after 3-4 sessions (with some randomness)
        const triggerPoint = this.reflectionTriggerCount + Math.floor(Math.random() * 2);
        const sessionsSinceLastReflection = this.currentSessionCount - this.lastReflectionSession;
        
        if (sessionsSinceLastReflection >= triggerPoint) {
            setTimeout(() => {
                this.showReflectionPrompt();
            }, 3000); // Show after celebration settles
        }
    }

    showReflectionPrompt() {
        const questions = [
            "What did you accomplish in these study sessions?",
            "What was the most challenging part of your study today?",
            "What concept finally clicked for you?",
            "How would you approach this topic differently next time?",
            "What are you most proud of completing today?",
            "What would help you stay more focused next time?"
        ];

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        document.getElementById('reflectionQuestion').textContent = randomQuestion;
        
        const modal = new bootstrap.Modal(document.getElementById('reflectionModal'));
        modal.show();
    }

    showDistractionCapture() {
        const modal = new bootstrap.Modal(document.getElementById('distractionModal'));
        modal.show();
    }

    updateSaveButton() {
        const text = document.getElementById('reflectionText').value.trim();
        const hasRating = this.selectedRating !== undefined;
        const saveBtn = document.getElementById('saveReflection');
        
        saveBtn.disabled = !(text.length > 0 && hasRating);
    }

    saveReflection() {
        const reflection = {
            date: new Date().toISOString(),
            text: document.getElementById('reflectionText').value.trim(),
            subject: document.getElementById('subjectTag').value.trim() || 'General',
            rating: this.selectedRating,
            sessionCount: this.currentSessionCount,
            question: document.getElementById('reflectionQuestion').textContent
        };

        this.reflections.push(reflection);
        this.lastReflectionSession = this.currentSessionCount;
        
        localStorage.setItem('study_reflections', JSON.stringify(this.reflections));
        
        // Reset form
        document.getElementById('reflectionText').value = '';
        document.getElementById('subjectTag').value = '';
        document.querySelectorAll('.reflection-rating').forEach(btn => btn.classList.remove('active'));
        this.selectedRating = undefined;
        
        // Close modal and update insights
        bootstrap.Modal.getInstance(document.getElementById('reflectionModal')).hide();
        this.updateInsights();
        
        // Show success message
        this.showSuccessMessage("Reflection saved! Your insights are building up.");
    }

    recordDistraction(type) {
        const distraction = {
            date: new Date().toISOString(),
            type: type,
            timeOfDay: new Date().getHours()
        };

        this.distractions.push(distraction);
        localStorage.setItem('distractions', JSON.stringify(this.distractions));
        this.updateInsights();
    }

    showJournalEntries() {
        if (this.reflections.length === 0) {
            this.showInfoMessage("No reflections yet! Complete a few study sessions to start building your journal.");
            return;
        }

        const recentReflections = this.reflections.slice(-10).reverse();
        let entriesHTML = '<div class="reflection-entries">';
        
        recentReflections.forEach(reflection => {
            const date = new Date(reflection.date).toLocaleDateString();
            const stars = '⭐'.repeat(reflection.rating);
            
            entriesHTML += `
                <div class="reflection-entry mb-3 p-3 border rounded">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-primary">${reflection.subject}</span>
                        <small class="text-muted">${date}</small>
                    </div>
                    <p class="reflection-question text-muted small">${reflection.question}</p>
                    <p class="reflection-text">${reflection.text}</p>
                    <div class="text-end">
                        <span class="rating">${stars}</span>
                    </div>
                </div>
            `;
        });
        
        entriesHTML += '</div>';
        
        this.showModal('Study Journal', entriesHTML);
    }

    showDistractionReport() {
        if (this.distractions.length === 0) {
            this.showInfoMessage("No distractions tracked yet. The timer will help you identify patterns over time.");
            return;
        }

        // Analyze distractions
        const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentDistractions = this.distractions.filter(d => new Date(d.date) > lastWeek);
        
        // Count by type
        const counts = {};
        recentDistractions.forEach(d => {
            counts[d.type] = (counts[d.type] || 0) + 1;
        });

        // Count by time of day
        const timePattern = {};
        recentDistractions.forEach(d => {
            const hour = d.timeOfDay;
            const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
            timePattern[timeSlot] = (timePattern[timeSlot] || 0) + 1;
        });

        let reportHTML = `
            <div class="distraction-report">
                <h6>This Week's Distractions</h6>
                <div class="row mb-3">
                    <div class="col-6">
                        <strong>Top Distractions:</strong>
                        <ul class="list-unstyled mt-2">
        `;

        Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .forEach(([type, count]) => {
                const label = type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                reportHTML += `<li><span class="badge bg-warning">${count}x</span> ${label}</li>`;
            });

        reportHTML += `
                        </ul>
                    </div>
                    <div class="col-6">
                        <strong>Time Patterns:</strong>
                        <ul class="list-unstyled mt-2">
        `;

        Object.entries(timePattern)
            .sort(([,a], [,b]) => b - a)
            .forEach(([time, count]) => {
                reportHTML += `<li><span class="badge bg-info">${count}x</span> ${time}</li>`;
            });

        reportHTML += `
                        </ul>
                    </div>
                </div>
                <div class="alert alert-info">
                    <strong>💡 Insight:</strong> ${this.generateDistractionInsight(counts, timePattern)}
                </div>
            </div>
        `;

        this.showModal('Distraction Report', reportHTML);
    }

    generateDistractionInsight(counts, timePattern) {
        const topDistraction = Object.entries(counts).sort(([,a], [,b]) => b - a)[0];
        const topTime = Object.entries(timePattern).sort(([,a], [,b]) => b - a)[0];

        if (!topDistraction) return "Keep tracking to see patterns!";

        const [distractionType] = topDistraction;
        const [timeSlot] = topTime || ['', 0];

        const insights = {
            'social-media': "Consider using website blockers or putting your phone in another room during study sessions.",
            'phone-call': "Try setting your phone to 'Do Not Disturb' mode or informing others about your study schedule.",
            'tired': "Consider taking more breaks, adjusting your sleep schedule, or studying during your peak energy hours.",
            'hungry': "Plan your meals and have healthy snacks ready before starting long study sessions.",
            'noise': "Look for quieter study spaces or consider using noise-canceling headphones.",
            'other': "Try to identify the specific distraction and create a plan to minimize it."
        };

        let insight = insights[distractionType] || "Keep tracking to identify patterns.";
        
        if (timeSlot) {
            insight += ` You seem most distracted during ${timeSlot.toLowerCase()} - consider adjusting your study schedule.`;
        }

        return insight;
    }

    updateInsights() {
        // Update recent achievement
        if (this.reflections.length > 0) {
            const latest = this.reflections[this.reflections.length - 1];
            const achievementText = `Last reflection: ${latest.rating}⭐ in ${latest.subject}`;
            document.getElementById('recentAchievement').textContent = achievementText;
        }

        // Update top distraction
        if (this.distractions.length > 0) {
            const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const recentDistractions = this.distractions.filter(d => new Date(d.date) > lastWeek);
            
            if (recentDistractions.length > 0) {
                const counts = {};
                recentDistractions.forEach(d => {
                    counts[d.type] = (counts[d.type] || 0) + 1;
                });
                
                const topDistraction = Object.entries(counts).sort(([,a], [,b]) => b - a)[0];
                if (topDistraction) {
                    const [type, count] = topDistraction;
                    const label = type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    document.getElementById('topDistraction').textContent = `${label} (${count}x this week)`;
                }
            }
        }
    }

    showModal(title, content) {
        const existingModal = document.getElementById('dynamicModal');
        if (existingModal) existingModal.remove();

        const modalHTML = `
            <div class="modal fade" id="dynamicModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">${content}</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('dynamicModal'));
        modal.show();
    }

    showSuccessMessage(message) {
        // Create a temporary success alert
        const alertHTML = `
            <div class="alert alert-success alert-dismissible fade show position-fixed" 
                style="top: 20px; right: 20px; z-index: 1060; max-width: 350px;">
                <i class="fas fa-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.alert-success');
            if (alert) alert.remove();
        }, 5000);
    }

    showInfoMessage(message) {
        const alertHTML = `
            <div class="alert alert-info alert-dismissible fade show position-fixed" 
                style="top: 20px; right: 20px; z-index: 1060; max-width: 350px;">
                <i class="fas fa-info-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        setTimeout(() => {
            const alert = document.querySelector('.alert-info');
            if (alert) alert.remove();
        }, 5000);
    }
}

// Initialize reflection journal when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.reflectionJournal = new ReflectionJournal();
});