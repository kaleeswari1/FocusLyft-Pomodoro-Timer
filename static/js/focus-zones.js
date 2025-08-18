class FocusZones {
    constructor() {
        this.focusZones = JSON.parse(localStorage.getItem('focus_zones')) || this.getDefaultZones();
        this.currentZone = localStorage.getItem('current_focus_zone') || 'balanced';
        this.init();
    }

    getDefaultZones() {
        return {
            'deep-work': {
                name: 'Deep Work',
                description: 'Intense focus for complex tasks',
                workTime: 45,
                breakTime: 15,
                longBreakTime: 30,
                icon: 'fas fa-brain',
                color: '#dc3545',
                environment: {
                    quotes: 'focus',
                    distractions: 'strict',
                    celebrations: 'minimal'
                }
            },
            'balanced': {
                name: 'Balanced Study',
                description: 'Standard Pomodoro technique',
                workTime: 25,
                breakTime: 5,
                longBreakTime: 15,
                icon: 'fas fa-balance-scale',
                color: '#0d6efd',
                environment: {
                    quotes: 'mixed',
                    distractions: 'normal',
                    celebrations: 'standard'
                }
            },
            'creative': {
                name: 'Creative Flow',
                description: 'Longer sessions for creative work',
                workTime: 90,
                breakTime: 20,
                longBreakTime: 45,
                icon: 'fas fa-palette',
                color: '#6f42c1',
                environment: {
                    quotes: 'inspiration',
                    distractions: 'relaxed',
                    celebrations: 'artistic'
                }
            },
            'review': {
                name: 'Review & Practice',
                description: 'Short bursts for memorization',
                workTime: 15,
                breakTime: 5,
                longBreakTime: 10,
                icon: 'fas fa-redo',
                color: '#198754',
                environment: {
                    quotes: 'memory',
                    distractions: 'moderate',
                    celebrations: 'encouraging'
                }
            },
            'exam-prep': {
                name: 'Exam Preparation',
                description: 'Intensive study with frequent breaks',
                workTime: 35,
                breakTime: 10,
                longBreakTime: 25,
                icon: 'fas fa-graduation-cap',
                color: '#fd7e14',
                environment: {
                    quotes: 'motivation',
                    distractions: 'strict',
                    celebrations: 'milestone'
                }
            }
        };
    }

    init() {
        this.createZoneSelector();
        this.createZoneCustomizer();
        this.applyCurrentZone();
    }

    createZoneSelector() {
        const selectorHTML = `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-crosshairs me-2"></i>Focus Zone
                    </h5>
                    <button class="btn btn-outline-primary btn-sm" id="customizeZonesBtn">
                        <i class="fas fa-cog me-1"></i>Customize
                    </button>
                </div>
                <div class="card-body">
                    <div class="row" id="focusZoneOptions">
                        <!-- Zone options will be inserted here -->
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Each zone adapts your timer settings and environment for different types of work
                        </small>
                    </div>
                </div>
            </div>
        `;

        // Insert after the quote container
        const quoteContainer = document.querySelector('.quote-container').parentNode;
        quoteContainer.insertAdjacentHTML('afterend', selectorHTML);

        this.renderZoneOptions();
        
        document.getElementById('customizeZonesBtn').addEventListener('click', () => {
            this.showZoneCustomizer();
        });
    }

    renderZoneOptions() {
        const container = document.getElementById('focusZoneOptions');
        container.innerHTML = '';

        Object.entries(this.focusZones).forEach(([key, zone]) => {
            const isActive = this.currentZone === key;
            const zoneElement = document.createElement('div');
            zoneElement.className = 'col-md-6 col-lg-4 mb-3';
            
            zoneElement.innerHTML = `
                <div class="focus-zone-option ${isActive ? 'active' : ''}" data-zone="${key}">
                    <div class="zone-icon" style="color: ${zone.color}">
                        <i class="${zone.icon} fa-2x"></i>
                    </div>
                    <h6 class="zone-name mt-2">${zone.name}</h6>
                    <p class="zone-description small text-muted">${zone.description}</p>
                    <div class="zone-timing">
                        <small class="badge bg-secondary">${zone.workTime}m work</small>
                        <small class="badge bg-light text-dark">${zone.breakTime}m break</small>
                    </div>
                </div>
            `;

            zoneElement.addEventListener('click', () => {
                this.selectZone(key);
            });

            container.appendChild(zoneElement);
        });
    }

    selectZone(zoneKey) {
        this.currentZone = zoneKey;
        localStorage.setItem('current_focus_zone', zoneKey);
        
        // Update visual selection
        document.querySelectorAll('.focus-zone-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-zone="${zoneKey}"]`).classList.add('active');
        
        // Apply zone settings
        this.applyCurrentZone();
        
        // Show confirmation
        this.showZoneChangeNotification();
    }

    applyCurrentZone() {
        const zone = this.focusZones[this.currentZone];
        if (!zone) return;

        // Update timer settings
        if (window.pomodoroTimer) {
            window.pomodoroTimer.setWorkTime(zone.workTime);
            window.pomodoroTimer.setBreakTime(zone.breakTime);
            
            // Update the UI inputs
            const workInput = document.getElementById('workDuration');
            const breakInput = document.getElementById('breakDuration');
            if (workInput) workInput.value = zone.workTime;
            if (breakInput) breakInput.value = zone.breakTime;
        }

        // Apply environment settings
        this.applyEnvironmentSettings(zone.environment);
    }

    applyEnvironmentSettings(environment) {
        // Store environment preferences for other systems to use
        localStorage.setItem('current_environment', JSON.stringify(environment));
        
        // You can extend this to modify other system behaviors
        // For example, change quote types, distraction sensitivity, etc.
    }

    createZoneCustomizer() {
        const customizerHTML = `
            <div class="modal fade" id="zoneCustomizerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-palette me-2"></i>Customize Focus Zones
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <h6>Select Zone to Edit</h6>
                                    <div class="list-group" id="zoneEditList">
                                        <!-- Zone list will be populated here -->
                                    </div>
                                    <button class="btn btn-outline-success btn-sm mt-2 w-100" id="addNewZoneBtn">
                                        <i class="fas fa-plus me-1"></i>Add New Zone
                                    </button>
                                </div>
                                <div class="col-md-8">
                                    <div id="zoneEditor" style="display: none;">
                                        <form id="zoneEditForm">
                                            <div class="mb-3">
                                                <label class="form-label">Zone Name</label>
                                                <input type="text" class="form-control" id="editZoneName">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Description</label>
                                                <input type="text" class="form-control" id="editZoneDescription">
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label class="form-label">Work Time (min)</label>
                                                    <input type="number" class="form-control" id="editWorkTime" min="5" max="180">
                                                </div>
                                                <div class="col-md-4">
                                                    <label class="form-label">Break Time (min)</label>
                                                    <input type="number" class="form-control" id="editBreakTime" min="1" max="60">
                                                </div>
                                                <div class="col-md-4">
                                                    <label class="form-label">Long Break (min)</label>
                                                    <input type="number" class="form-control" id="editLongBreakTime" min="5" max="120">
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Icon</label>
                                                <select class="form-select" id="editZoneIcon">
                                                    <option value="fas fa-brain">Brain</option>
                                                    <option value="fas fa-fire">Fire</option>
                                                    <option value="fas fa-bolt">Lightning</option>
                                                    <option value="fas fa-star">Star</option>
                                                    <option value="fas fa-heart">Heart</option>
                                                    <option value="fas fa-rocket">Rocket</option>
                                                    <option value="fas fa-eye">Eye</option>
                                                    <option value="fas fa-gem">Gem</option>
                                                </select>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Color</label>
                                                <input type="color" class="form-control form-control-color" id="editZoneColor">
                                            </div>
                                            <div class="d-flex gap-2">
                                                <button type="submit" class="btn btn-success">Save Changes</button>
                                                <button type="button" class="btn btn-danger" id="deleteZoneBtn">Delete Zone</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div id="zoneEditorPlaceholder" class="text-center text-muted">
                                        <i class="fas fa-arrow-left fa-2x mb-3"></i>
                                        <p>Select a zone to edit its settings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', customizerHTML);
        this.setupCustomizerEvents();
    }

    setupCustomizerEvents() {
        document.getElementById('zoneEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveZoneEdits();
        });

        document.getElementById('addNewZoneBtn').addEventListener('click', () => {
            this.addNewZone();
        });

        document.getElementById('deleteZoneBtn').addEventListener('click', () => {
            this.deleteCurrentZone();
        });
    }

    showZoneCustomizer() {
        this.populateZoneEditList();
        const modal = new bootstrap.Modal(document.getElementById('zoneCustomizerModal'));
        modal.show();
    }

    populateZoneEditList() {
        const list = document.getElementById('zoneEditList');
        list.innerHTML = '';

        Object.entries(this.focusZones).forEach(([key, zone]) => {
            const item = document.createElement('button');
            item.className = 'list-group-item list-group-item-action';
            item.dataset.zone = key;
            item.innerHTML = `
                <i class="${zone.icon} me-2" style="color: ${zone.color}"></i>
                ${zone.name}
            `;
            item.addEventListener('click', () => {
                this.editZone(key);
            });
            list.appendChild(item);
        });
    }

    editZone(zoneKey) {
        this.currentEditingZone = zoneKey;
        const zone = this.focusZones[zoneKey];

        // Populate form
        document.getElementById('editZoneName').value = zone.name;
        document.getElementById('editZoneDescription').value = zone.description;
        document.getElementById('editWorkTime').value = zone.workTime;
        document.getElementById('editBreakTime').value = zone.breakTime;
        document.getElementById('editLongBreakTime').value = zone.longBreakTime;
        document.getElementById('editZoneIcon').value = zone.icon;
        document.getElementById('editZoneColor').value = zone.color;

        // Show editor
        document.getElementById('zoneEditorPlaceholder').style.display = 'none';
        document.getElementById('zoneEditor').style.display = 'block';

        // Update list selection
        document.querySelectorAll('#zoneEditList .list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-zone="${zoneKey}"]`).classList.add('active');
    }

    saveZoneEdits() {
        if (!this.currentEditingZone) return;

        const zone = {
            name: document.getElementById('editZoneName').value,
            description: document.getElementById('editZoneDescription').value,
            workTime: parseInt(document.getElementById('editWorkTime').value),
            breakTime: parseInt(document.getElementById('editBreakTime').value),
            longBreakTime: parseInt(document.getElementById('editLongBreakTime').value),
            icon: document.getElementById('editZoneIcon').value,
            color: document.getElementById('editZoneColor').value,
            environment: this.focusZones[this.currentEditingZone].environment || {
                quotes: 'mixed',
                distractions: 'normal',
                celebrations: 'standard'
            }
        };

        this.focusZones[this.currentEditingZone] = zone;
        localStorage.setItem('focus_zones', JSON.stringify(this.focusZones));

        // Update displays
        this.renderZoneOptions();
        this.populateZoneEditList();
        
        // Apply if this is the current zone
        if (this.currentZone === this.currentEditingZone) {
            this.applyCurrentZone();
        }

        this.showSuccessMessage('Zone updated successfully!');
    }

    addNewZone() {
        const newKey = `custom_${Date.now()}`;
        const newZone = {
            name: 'Custom Zone',
            description: 'Your personalized focus zone',
            workTime: 25,
            breakTime: 5,
            longBreakTime: 15,
            icon: 'fas fa-star',
            color: '#6f42c1',
            environment: {
                quotes: 'mixed',
                distractions: 'normal',
                celebrations: 'standard'
            }
        };

        this.focusZones[newKey] = newZone;
        localStorage.setItem('focus_zones', JSON.stringify(this.focusZones));

        this.populateZoneEditList();
        this.renderZoneOptions();
        this.editZone(newKey);
    }

    deleteCurrentZone() {
        if (!this.currentEditingZone) return;
        
        if (Object.keys(this.focusZones).length <= 1) {
            alert('You must have at least one focus zone');
            return;
        }

        if (confirm('Are you sure you want to delete this zone?')) {
            delete this.focusZones[this.currentEditingZone];
            
            // If this was the current zone, switch to balanced
            if (this.currentZone === this.currentEditingZone) {
                this.currentZone = 'balanced';
                localStorage.setItem('current_focus_zone', 'balanced');
            }

            localStorage.setItem('focus_zones', JSON.stringify(this.focusZones));

            // Update displays
            this.renderZoneOptions();
            this.populateZoneEditList();
            this.applyCurrentZone();

            // Hide editor
            document.getElementById('zoneEditor').style.display = 'none';
            document.getElementById('zoneEditorPlaceholder').style.display = 'block';

            this.showSuccessMessage('Zone deleted successfully!');
        }
    }

    showZoneChangeNotification() {
        const zone = this.focusZones[this.currentZone];
        const message = `Switched to ${zone.name} mode - ${zone.workTime}min work, ${zone.breakTime}min break`;
        
        const alertHTML = `
            <div class="alert alert-info alert-dismissible fade show position-fixed" 
                style="top: 20px; right: 20px; z-index: 1060; max-width: 350px;">
                <i class="${zone.icon} me-2" style="color: ${zone.color}"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        setTimeout(() => {
            const alert = document.querySelector('.alert-info');
            if (alert) alert.remove();
        }, 4000);
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
        }, 3000);
    }
}

// Initialize focus zones when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.focusZones = new FocusZones();
});