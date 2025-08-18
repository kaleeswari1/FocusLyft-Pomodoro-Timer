class StudyBuddy {
    constructor() {
        this.studyGroups = JSON.parse(localStorage.getItem('study_groups')) || [];
        this.currentGroup = localStorage.getItem('current_study_group') || null;
        this.virtualMates = this.getVirtualMates();
        this.currentMate = localStorage.getItem('current_virtual_mate') || 'alex';
        this.init();
    }

    getVirtualMates() {
        return {
            'alex': {
                name: 'Alex',
                personality: 'encouraging',
                avatar: '👨‍🎓',
                specialty: 'General Study',
                quotes: [
                    "You've got this! One step at a time.",
                    "Great progress! Keep that momentum going.",
                    "Remember, every expert was once a beginner.",
                    "Focus on progress, not perfection."
                ],
                celebrations: [
                    "Awesome work! 🎉",
                    "You're crushing it! 💪",
                    "Another win! Keep going! 🏆"
                ]
            },
            'maya': {
                name: 'Maya',
                personality: 'analytical',
                avatar: '👩‍🔬',
                specialty: 'STEM Fields',
                quotes: [
                    "Break down complex problems into smaller parts.",
                    "Data shows consistency beats intensity.",
                    "Your brain needs rest to consolidate learning.",
                    "Every mistake is a learning opportunity."
                ],
                celebrations: [
                    "Excellent analytical work! 🧠",
                    "Your systematic approach is paying off! 📊",
                    "Problem-solving skills on point! 🎯"
                ]
            },
            'zoe': {
                name: 'Zoe',
                personality: 'creative',
                avatar: '👩‍🎨',
                specialty: 'Arts & Languages',
                quotes: [
                    "Let your creativity flow during breaks.",
                    "Visualization helps memory retention.",
                    "Different perspectives unlock new ideas.",
                    "Art and science complement each other."
                ],
                celebrations: [
                    "Beautiful creative thinking! 🎨",
                    "Your imagination is your superpower! ✨",
                    "Inspired work today! 🌟"
                ]
            },
            'kai': {
                name: 'Kai',
                personality: 'motivational',
                avatar: '👨‍💼',
                specialty: 'Goal Achievement',
                quotes: [
                    "Champions are made in practice, not in competition.",
                    "Discipline is choosing what you want most over what you want now.",
                    "Small daily improvements compound over time.",
                    "Your future self will thank you for today's effort."
                ],
                celebrations: [
                    "Unstoppable energy! 🚀",
                    "You're building incredible habits! 🔥",
                    "That's the spirit of a champion! 👑"
                ]
            }
        };
    }

    init() {
        this.createBuddyInterface();
        this.setupVirtualMate();
    }

    createBuddyInterface() {
        const buddyHTML = `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-users me-2"></i>Study Buddy
                    </h5>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" id="virtualMateBtn">
                            <i class="fas fa-robot me-1"></i>Virtual
                        </button>
                        <button class="btn btn-outline-success" id="studyGroupBtn">
                            <i class="fas fa-user-friends me-1"></i>Groups
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Virtual Mate Section -->
                    <div id="virtualMateSection">
                        <div class="d-flex align-items-center mb-3">
                            <div class="mate-avatar me-3" id="mateAvatar">👨‍🎓</div>
                            <div>
                                <h6 class="mb-1" id="mateName">Alex</h6>
                                <small class="text-muted" id="mateSpecialty">General Study</small>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm ms-auto" id="changeMateBtn">
                                <i class="fas fa-sync me-1"></i>Change
                            </button>
                        </div>
                        <div class="mate-message p-3 rounded bg-light" id="mateMessage">
                            <i class="fas fa-quote-left text-muted me-2"></i>
                            <span id="mateQuote">Ready to focus? Let's achieve something great today!</span>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-outline-info btn-sm me-2" id="getMateAdviceBtn">
                                <i class="fas fa-lightbulb me-1"></i>Get Advice
                            </button>
                            <button class="btn btn-outline-primary btn-sm" id="shareProgressBtn">
                                <i class="fas fa-share me-1"></i>Share Progress
                            </button>
                        </div>
                    </div>

                    <!-- Study Groups Section -->
                    <div id="studyGroupSection" style="display: none;">
                        <div id="groupsList">
                            <p class="text-muted">Study groups help you stay accountable and motivated!</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-success" id="createGroupBtn">
                                    <i class="fas fa-plus me-2"></i>Create Study Group
                                </button>
                                <button class="btn btn-outline-primary" id="joinGroupBtn">
                                    <i class="fas fa-sign-in-alt me-2"></i>Join Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after focus zones
        const focusZonesCard = document.querySelector('.card');
        focusZonesCard.insertAdjacentHTML('afterend', buddyHTML);

        this.setupBuddyEvents();
        this.updateVirtualMateDisplay();
    }

    setupBuddyEvents() {
        document.getElementById('virtualMateBtn').addEventListener('click', () => {
            this.showVirtualMateSection();
        });

        document.getElementById('studyGroupBtn').addEventListener('click', () => {
            this.showStudyGroupSection();
        });

        document.getElementById('changeMateBtn').addEventListener('click', () => {
            this.showMateSelector();
        });

        document.getElementById('getMateAdviceBtn').addEventListener('click', () => {
            this.getMateAdvice();
        });

        document.getElementById('shareProgressBtn').addEventListener('click', () => {
            this.shareProgress();
        });

        document.getElementById('createGroupBtn').addEventListener('click', () => {
            this.createStudyGroup();
        });

        document.getElementById('joinGroupBtn').addEventListener('click', () => {
            this.joinStudyGroup();
        });
    }

    showVirtualMateSection() {
        document.getElementById('virtualMateSection').style.display = 'block';
        document.getElementById('studyGroupSection').style.display = 'none';
        
        // Update button states
        document.getElementById('virtualMateBtn').classList.add('active');
        document.getElementById('studyGroupBtn').classList.remove('active');
    }

    showStudyGroupSection() {
        document.getElementById('virtualMateSection').style.display = 'none';
        document.getElementById('studyGroupSection').style.display = 'block';
        
        // Update button states
        document.getElementById('virtualMateBtn').classList.remove('active');
        document.getElementById('studyGroupBtn').classList.add('active');
    }

    setupVirtualMate() {
        // Set initial virtual mate as active
        document.getElementById('virtualMateBtn').classList.add('active');
        this.updateVirtualMateDisplay();
    }

    updateVirtualMateDisplay() {
        const mate = this.virtualMates[this.currentMate];
        if (!mate) return;

        document.getElementById('mateAvatar').textContent = mate.avatar;
        document.getElementById('mateName').textContent = mate.name;
        document.getElementById('mateSpecialty').textContent = mate.specialty;
        
        // Show a random quote
        const randomQuote = mate.quotes[Math.floor(Math.random() * mate.quotes.length)];
        document.getElementById('mateQuote').textContent = randomQuote;
    }

    showMateSelector() {
        const selectorHTML = `
            <div class="row">
                ${Object.entries(this.virtualMates).map(([key, mate]) => `
                    <div class="col-md-6 mb-3">
                        <div class="mate-option ${this.currentMate === key ? 'selected' : ''}" data-mate="${key}">
                            <div class="text-center">
                                <div class="mate-avatar-large mb-2">${mate.avatar}</div>
                                <h6>${mate.name}</h6>
                                <small class="text-muted">${mate.specialty}</small>
                                <p class="small mt-2">"${mate.quotes[0]}"</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.showModal('Choose Your Study Buddy', selectorHTML, () => {
            // Add click handlers for mate selection
            document.querySelectorAll('.mate-option').forEach(option => {
                option.addEventListener('click', () => {
                    const mateKey = option.dataset.mate;
                    this.selectMate(mateKey);
                    bootstrap.Modal.getInstance(document.getElementById('dynamicModal')).hide();
                });
            });
        });
    }

    selectMate(mateKey) {
        this.currentMate = mateKey;
        localStorage.setItem('current_virtual_mate', mateKey);
        this.updateVirtualMateDisplay();
        
        const mate = this.virtualMates[mateKey];
        this.showSuccessMessage(`${mate.name} is now your study buddy!`);
    }

    getMateAdvice() {
        const mate = this.virtualMates[this.currentMate];
        const currentSubject = document.getElementById('currentSubject')?.value || 'General';
        
        // Get subject-specific or general advice
        let advice = mate.quotes[Math.floor(Math.random() * mate.quotes.length)];
        
        // Add some subject-specific advice
        const subjectAdvice = {
            'Mathematics': [
                "Practice makes perfect with math. Work through problems step by step.",
                "If you're stuck, try working backwards from the answer.",
                "Draw diagrams when possible - visualization helps with understanding."
            ],
            'Science': [
                "Understand the 'why' behind formulas, not just the 'how'.",
                "Connect new concepts to things you already know.",
                "Make predictions before experiments to engage your thinking."
            ],
            'History': [
                "Create timelines to see cause and effect relationships.",
                "Think about how historical events connect to today.",
                "Use memory techniques like acronyms for important dates."
            ],
            'English': [
                "Read your work aloud to catch errors and improve flow.",
                "Keep a vocabulary journal for new words you encounter.",
                "Practice writing in different styles to improve versatility."
            ],
            'Languages': [
                "Immerse yourself - change your phone to the target language!",
                "Practice speaking daily, even if it's just to yourself.",
                "Don't fear mistakes - they're part of the learning process."
            ]
        };

        if (subjectAdvice[currentSubject]) {
            const subjectTips = subjectAdvice[currentSubject];
            advice = subjectTips[Math.floor(Math.random() * subjectTips.length)];
        }

        // Update the display
        document.getElementById('mateQuote').textContent = advice;
        
        // Add a subtle animation
        const messageEl = document.getElementById('mateMessage');
        messageEl.style.transform = 'scale(0.95)';
        setTimeout(() => {
            messageEl.style.transform = 'scale(1)';
        }, 100);
    }

    shareProgress() {
        const sessionCount = window.pomodoroTimer?.sessionCount || 0;
        const mate = this.virtualMates[this.currentMate];
        
        let response;
        if (sessionCount === 0) {
            response = "Ready to start your first session? I believe in you!";
        } else if (sessionCount < 3) {
            response = mate.celebrations[0] || "Great start!";
        } else if (sessionCount < 7) {
            response = mate.celebrations[1] || "You're building momentum!";
        } else {
            response = mate.celebrations[2] || "Incredible dedication!";
        }

        // Show mate's response
        document.getElementById('mateQuote').textContent = response;
        
        // Trigger a small celebration
        if (window.confetti && sessionCount > 0) {
            confetti({
                particleCount: 50,
                spread: 45,
                origin: { x: 0.8, y: 0.8 }
            });
        }
    }

    onSessionComplete() {
        // Virtual mate celebrates with you
        const mate = this.virtualMates[this.currentMate];
        const celebration = mate.celebrations[Math.floor(Math.random() * mate.celebrations.length)];
        
        // Show celebration after a brief delay
        setTimeout(() => {
            document.getElementById('mateQuote').textContent = celebration;
        }, 2000);
    }

    createStudyGroup() {
        const groupHTML = `
            <form id="createGroupForm">
                <div class="mb-3">
                    <label class="form-label">Group Name</label>
                    <input type="text" class="form-control" id="groupName" placeholder="e.g., Math Study Squad">
                </div>
                <div class="mb-3">
                    <label class="form-label">Subject Focus</label>
                    <select class="form-select" id="groupSubject">
                        <option value="General">General Study</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                        <option value="English">English</option>
                        <option value="Languages">Languages</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Study Schedule</label>
                    <input type="text" class="form-control" id="groupSchedule" placeholder="e.g., Daily 7-9 PM">
                </div>
                <div class="mb-3">
                    <label class="form-label">Group Description</label>
                    <textarea class="form-control" id="groupDescription" rows="3" placeholder="What are your group's goals?"></textarea>
                </div>
                <button type="submit" class="btn btn-success">Create Group</button>
            </form>
        `;

        this.showModal('Create Study Group', groupHTML, () => {
            document.getElementById('createGroupForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNewGroup();
            });
        });
    }

    saveNewGroup() {
        const group = {
            id: Date.now(),
            name: document.getElementById('groupName').value,
            subject: document.getElementById('groupSubject').value,
            schedule: document.getElementById('groupSchedule').value,
            description: document.getElementById('groupDescription').value,
            created: new Date().toISOString(),
            members: 1, // Just you for now
            totalSessions: 0
        };

        this.studyGroups.push(group);
        localStorage.setItem('study_groups', JSON.stringify(this.studyGroups));
        
        bootstrap.Modal.getInstance(document.getElementById('dynamicModal')).hide();
        this.showSuccessMessage('Study group created! Share the details with friends to invite them.');
    }

    joinStudyGroup() {
        const joinHTML = `
            <form id="joinGroupForm">
                <div class="mb-3">
                    <label class="form-label">Group Invite Code</label>
                    <input type="text" class="form-control" id="inviteCode" placeholder="Enter group code">
                </div>
                <p class="text-muted small">
                    <i class="fas fa-info-circle me-1"></i>
                    Get the invite code from a group member or create your own group!
                </p>
                <button type="submit" class="btn btn-primary">Join Group</button>
            </form>
        `;

        this.showModal('Join Study Group', joinHTML, () => {
            document.getElementById('joinGroupForm').addEventListener('submit', (e) => {
                e.preventDefault();
                // For now, just show a message about future implementation
                this.showInfoMessage('Group joining feature coming soon! Create your own group to get started.');
                bootstrap.Modal.getInstance(document.getElementById('dynamicModal')).hide();
            });
        });
    }

    showModal(title, content, onShow = null) {
        const existingModal = document.getElementById('dynamicModal');
        if (existingModal) existingModal.remove();

        const modalHTML = `
            <div class="modal fade" id="dynamicModal" tabindex="-1">
                <div class="modal-dialog">
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
        
        if (onShow) {
            setTimeout(onShow, 100);
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

// Initialize study buddy when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.studyBuddy = new StudyBuddy();
});