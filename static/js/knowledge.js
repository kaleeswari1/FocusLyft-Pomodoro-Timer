class KnowledgeReminders {
    constructor() {
        this.subjectKnowledge = {
            'Mathematics': {
                formulas: [
                    "Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a",
                    "Pythagorean Theorem: a² + b² = c²",
                    "Area of Circle: A = πr²",
                    "Slope Formula: m = (y₂ - y₁) / (x₂ - x₁)",
                    "Distance Formula: d = √[(x₂-x₁)² + (y₂-y₁)²]",
                    "Logarithm Rule: log(ab) = log(a) + log(b)",
                    "Sin² + Cos² = 1 (Pythagorean Identity)",
                    "Derivative of x^n: nx^(n-1)",
                    "Integration by Parts: ∫udv = uv - ∫vdu"
                ],
                concepts: [
                    "Remember: When solving equations, whatever you do to one side, do to the other",
                    "Tip: Check your answers by substituting back into the original equation",
                    "Think: What does this graph tell you about the real-world situation?",
                    "Strategy: Break complex problems into smaller, manageable steps",
                    "Pattern: Look for relationships between numbers or variables"
                ]
            },
            'Science': {
                formulas: [
                    "Force: F = ma (Newton's Second Law)",
                    "Energy: E = mc² (Einstein's Mass-Energy)",
                    "Ideal Gas Law: PV = nRT",
                    "Ohm's Law: V = IR",
                    "Wavelength: λ = c/f",
                    "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
                    "pH = -log[H⁺]",
                    "Kinetic Energy: KE = ½mv²",
                    "Momentum: p = mv"
                ],
                concepts: [
                    "Remember: Scientific method - Observe, Hypothesize, Experiment, Conclude",
                    "Tip: Always include units in your calculations and answers",
                    "Think: How does this concept apply to everyday life?",
                    "Strategy: Draw diagrams to visualize physics problems",
                    "Pattern: Look for cause and effect relationships in experiments"
                ]
            },
            'History': {
                facts: [
                    "World War II: 1939-1945",
                    "American Declaration of Independence: July 4, 1776",
                    "Fall of Berlin Wall: November 9, 1989",
                    "French Revolution: 1789-1799",
                    "Industrial Revolution: ~1760-1840",
                    "Renaissance Period: 14th-17th centuries",
                    "Roman Empire fell: 476 CE",
                    "Magna Carta signed: 1215",
                    "Columbus reached Americas: 1492"
                ],
                concepts: [
                    "Remember: History is about understanding cause and effect over time",
                    "Tip: Create timelines to visualize the sequence of events",
                    "Think: How did this event shape the world we live in today?",
                    "Strategy: Compare different historical perspectives on the same event",
                    "Pattern: Look for recurring themes across different time periods"
                ]
            },
            'English': {
                grammar: [
                    "Your vs You're: Your = possessive, You're = you are",
                    "Their vs There vs They're: Their = possessive, There = place, They're = they are",
                    "Affect vs Effect: Affect = verb (to influence), Effect = noun (result)",
                    "Who vs Whom: Who = subject, Whom = object",
                    "Lie vs Lay: Lie = to recline, Lay = to place something down",
                    "Semicolon (;) connects two related independent clauses",
                    "Oxford comma: Use it for clarity in lists of three or more items",
                    "Active voice is usually stronger than passive voice"
                ],
                concepts: [
                    "Remember: Read your work aloud to catch errors and improve flow",
                    "Tip: Vary your sentence structure to keep readers engaged",
                    "Think: What is the main message you want to communicate?",
                    "Strategy: Use specific examples to support your arguments",
                    "Pattern: Look for literary devices that enhance meaning"
                ]
            },
            'Languages': {
                tips: [
                    "Practice speaking daily, even if just to yourself",
                    "Immerse yourself: change your phone language settings",
                    "Watch movies with subtitles in the target language",
                    "Keep a vocabulary journal with new words",
                    "Focus on high-frequency words first",
                    "Don't be afraid to make mistakes - they're part of learning",
                    "Practice pronunciation using online tools",
                    "Find language exchange partners online"
                ],
                phrases: [
                    "Spanish: ¿Cómo estás? (How are you?)",
                    "French: Bon appétit! (Enjoy your meal!)",
                    "German: Wie geht's? (How's it going?)",
                    "Italian: Prego (You're welcome/Please)",
                    "Japanese: Arigatou gozaimasu (Thank you very much)",
                    "Mandarin: Nǐ hǎo (Hello)",
                    "Portuguese: Obrigado/Obrigada (Thank you)",
                    "Russian: Spasibo (Thank you)"
                ]
            },
            'General': {
                study_tips: [
                    "The Feynman Technique: Explain concepts in simple terms",
                    "Spaced repetition: Review material at increasing intervals",
                    "Active recall: Test yourself instead of just re-reading",
                    "Pomodoro Technique: 25min focused work + 5min break",
                    "Mind maps: Visualize connections between concepts",
                    "Teach someone else: Best way to solidify your understanding",
                    "Change your study location occasionally",
                    "Take handwritten notes when possible - better retention"
                ],
                motivation: [
                    "Progress, not perfection",
                    "Every expert was once a beginner",
                    "Consistency beats intensity",
                    "Mistakes are proof you're trying",
                    "Growth happens outside your comfort zone",
                    "Focus on the process, not just the outcome",
                    "Small daily improvements compound over time",
                    "Your only competition is who you were yesterday"
                ]
            }
        };
        
        this.currentSubject = 'General';
        this.reminderHistory = JSON.parse(localStorage.getItem('knowledge_reminders')) || [];
        this.init();
    }

    init() {
        this.createKnowledgeModal();
        this.createSubjectSelector();
    }

    createKnowledgeModal() {
        const modalHTML = `
            <div class="modal fade" id="knowledgeReminderModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-brain me-2"></i>Quick Knowledge Boost
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div id="knowledgeContent">
                                <div class="knowledge-item mb-3">
                                    <div class="knowledge-icon mb-2">
                                        <i class="fas fa-lightbulb fa-2x text-warning"></i>
                                    </div>
                                    <p class="knowledge-text lead" id="knowledgeText"></p>
                                    <small class="text-muted" id="knowledgeSubject"></small>
                                </div>
                            </div>
                            <div class="mt-3">
                                <button class="btn btn-outline-primary btn-sm me-2" id="nextKnowledgeBtn">
                                    <i class="fas fa-forward me-1"></i>Next Tip
                                </button>
                                <button class="btn btn-outline-success btn-sm" id="saveKnowledgeBtn">
                                    <i class="fas fa-bookmark me-1"></i>Save This
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <small class="text-muted">💡 Knowledge breaks help reinforce learning</small>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it!</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.getElementById('nextKnowledgeBtn').addEventListener('click', () => {
            this.showRandomKnowledge();
        });
        
        document.getElementById('saveKnowledgeBtn').addEventListener('click', () => {
            this.saveCurrentKnowledge();
        });
    }

    createSubjectSelector() {
        // Add subject selector to timer settings
        const timerSettings = document.querySelector('.timer-settings .row');
        const subjectSelectorHTML = `
            <div class="col-6 col-sm-4">
                <label for="currentSubject" class="form-label">Current Subject</label>
                <select class="form-select" id="currentSubject">
                    <option value="General">General Study</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="English">English</option>
                    <option value="Languages">Languages</option>
                </select>
            </div>
        `;
        
        timerSettings.insertAdjacentHTML('beforeend', subjectSelectorHTML);
        
        // Add event listener
        document.getElementById('currentSubject').addEventListener('change', (e) => {
            this.currentSubject = e.target.value;
            localStorage.setItem('current_subject', this.currentSubject);
        });
        
        // Load saved subject
        const savedSubject = localStorage.getItem('current_subject');
        if (savedSubject) {
            this.currentSubject = savedSubject;
            document.getElementById('currentSubject').value = savedSubject;
        }
    }

    showBreakKnowledge() {
        const knowledge = this.getKnowledgeForSubject(this.currentSubject);
        this.displayKnowledge(knowledge, this.currentSubject);
        
        const modal = new bootstrap.Modal(document.getElementById('knowledgeReminderModal'));
        modal.show();
    }

    getKnowledgeForSubject(subject) {
        const subjectData = this.subjectKnowledge[subject] || this.subjectKnowledge['General'];
        const allItems = [];
        
        // Collect all knowledge items for the subject
        Object.keys(subjectData).forEach(category => {
            allItems.push(...subjectData[category].map(item => ({
                text: item,
                category: category,
                subject: subject
            })));
        });
        
        // Filter out recently shown items to provide variety
        const recentItems = this.reminderHistory.slice(-10).map(item => item.text);
        const freshItems = allItems.filter(item => !recentItems.includes(item.text));
        
        // If we've shown everything recently, reset and use all items
        const availableItems = freshItems.length > 0 ? freshItems : allItems;
        
        // Return random item
        return availableItems[Math.floor(Math.random() * availableItems.length)];
    }

    showRandomKnowledge() {
        const subjects = Object.keys(this.subjectKnowledge);
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const knowledge = this.getKnowledgeForSubject(randomSubject);
        this.displayKnowledge(knowledge, randomSubject);
    }

    displayKnowledge(knowledge, subject) {
        const textElement = document.getElementById('knowledgeText');
        const subjectElement = document.getElementById('knowledgeSubject');
        const iconElement = document.querySelector('.knowledge-icon i');
        
        // Update content
        textElement.textContent = knowledge.text;
        subjectElement.textContent = `${subject} • ${knowledge.category}`;
        
        // Update icon based on category
        const iconMap = {
            formulas: 'fas fa-calculator',
            concepts: 'fas fa-lightbulb',
            facts: 'fas fa-scroll',
            grammar: 'fas fa-pen',
            tips: 'fas fa-star',
            phrases: 'fas fa-comments',
            study_tips: 'fas fa-graduation-cap',
            motivation: 'fas fa-heart'
        };
        
        iconElement.className = `${iconMap[knowledge.category] || 'fas fa-lightbulb'} fa-2x text-warning`;
        
        // Store current knowledge for saving
        this.currentKnowledge = knowledge;
        
        // Add to history
        this.reminderHistory.push({
            ...knowledge,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 items in history
        if (this.reminderHistory.length > 50) {
            this.reminderHistory = this.reminderHistory.slice(-50);
        }
        
        localStorage.setItem('knowledge_reminders', JSON.stringify(this.reminderHistory));
    }

    saveCurrentKnowledge() {
        if (!this.currentKnowledge) return;
        
        const savedKnowledge = JSON.parse(localStorage.getItem('saved_knowledge')) || [];
        
        // Check if already saved
        const alreadySaved = savedKnowledge.some(item => item.text === this.currentKnowledge.text);
        
        if (!alreadySaved) {
            savedKnowledge.push({
                ...this.currentKnowledge,
                savedDate: new Date().toISOString()
            });
            
            localStorage.setItem('saved_knowledge', JSON.stringify(savedKnowledge));
            
            // Update button to show saved state
            const saveBtn = document.getElementById('saveKnowledgeBtn');
            saveBtn.innerHTML = '<i class="fas fa-check me-1"></i>Saved!';
            saveBtn.classList.replace('btn-outline-success', 'btn-success');
            
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-bookmark me-1"></i>Save This';
                saveBtn.classList.replace('btn-success', 'btn-outline-success');
            }, 2000);
        } else {
            // Already saved
            const saveBtn = document.getElementById('saveKnowledgeBtn');
            saveBtn.innerHTML = '<i class="fas fa-info me-1"></i>Already Saved';
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-bookmark me-1"></i>Save This';
            }, 2000);
        }
    }

    // Called when break starts
    onBreakStart() {
        // Wait a moment before showing knowledge reminder
        setTimeout(() => {
            this.showBreakKnowledge();
        }, 2000);
    }

    // Method to view saved knowledge
    showSavedKnowledge() {
        const savedKnowledge = JSON.parse(localStorage.getItem('saved_knowledge')) || [];
        
        if (savedKnowledge.length === 0) {
            this.showInfoMessage("No saved knowledge yet. Save useful tips during break reminders!");
            return;
        }
        
        let contentHTML = '<div class="saved-knowledge-list">';
        
        savedKnowledge.slice(-20).reverse().forEach(item => {
            const date = new Date(item.savedDate).toLocaleDateString();
            contentHTML += `
                <div class="saved-knowledge-item mb-3 p-3 border rounded">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-info">${item.subject}</span>
                        <small class="text-muted">${date}</small>
                    </div>
                    <p class="knowledge-text">${item.text}</p>
                    <small class="text-muted">${item.category}</small>
                </div>
            `;
        });
        
        contentHTML += '</div>';
        
        this.showModal('Saved Knowledge', contentHTML);
    }

    showModal(title, content) {
        const existingModal = document.getElementById('dynamicKnowledgeModal');
        if (existingModal) existingModal.remove();

        const modalHTML = `
            <div class="modal fade" id="dynamicKnowledgeModal" tabindex="-1">
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
        const modal = new bootstrap.Modal(document.getElementById('dynamicKnowledgeModal'));
        modal.show();
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

// Initialize knowledge reminders when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.knowledgeReminders = new KnowledgeReminders();
});