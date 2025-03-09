
class TodoManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.initializeUI();
    }

    loadTasks() {
        const storedTasks = localStorage.getItem('pomodoro_tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    }

    saveTasks() {
        localStorage.setItem('pomodoro_tasks', JSON.stringify(this.tasks));
    }

    addTask(title, dueDate, priority) {
        const task = {
            id: Date.now(),
            title,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            priority: priority || 'medium', // low, medium, high
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.updateTaskList();
        this.scheduleReminders();
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.updateTaskList();
            this.scheduleReminders();
        }
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.saveTasks();
            this.updateTaskList();
        }
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.updateTaskList();
        this.scheduleReminders();
    }

    initializeUI() {
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('taskTitle').value;
                const dueDate = document.getElementById('taskDueDate').value;
                const priority = document.getElementById('taskPriority').value;
                
                if (title.trim()) {
                    this.addTask(title, dueDate, priority);
                    todoForm.reset();
                }
            });
        } else {
            console.warn('Todo form element not found');
        }

        this.updateTaskList();
        this.scheduleReminders();
    }

    updateTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        taskList.innerHTML = '';
        
        // Sort tasks by due date and priority
        this.tasks.sort((a, b) => {
            // First sort by completion status
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then by due date if both have due dates
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            
            // Tasks with due dates come before tasks without
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            // Then by priority
            const priorities = { high: 0, medium: 1, low: 2 };
            return priorities[a.priority] - priorities[b.priority];
        });
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<li class="list-group-item text-center text-muted">No tasks added yet</li>';
            return;
        }
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item ${task.completed ? 'bg-light' : ''}`;
            
            // Set priority badge color
            let priorityBadgeClass = 'bg-secondary';
            if (task.priority === 'high') priorityBadgeClass = 'bg-danger';
            else if (task.priority === 'medium') priorityBadgeClass = 'bg-warning';
            else if (task.priority === 'low') priorityBadgeClass = 'bg-info';
            
            // Create due date display
            let dueDateDisplay = '';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const now = new Date();
                const isOverdue = !task.completed && dueDate < now;
                
                dueDateDisplay = `
                    <span class="badge ${isOverdue ? 'bg-danger' : 'bg-secondary'} me-2">
                        Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                `;
            }
            
            li.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="form-check me-2">
                        <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
                            onchange="todoManager.toggleTaskCompletion(${task.id})">
                    </div>
                    <div class="flex-grow-1 ${task.completed ? 'text-decoration-line-through text-muted' : ''}">
                        <div>${task.title}</div>
                        <div class="small mt-1">
                            ${dueDateDisplay}
                            <span class="badge ${priorityBadgeClass} me-2">
                                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="todoManager.editTask(${task.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="todoManager.removeTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            taskList.appendChild(li);
        });
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Populate the form with task data
        const taskTitleField = document.getElementById('taskTitle');
        const taskDueDateField = document.getElementById('taskDueDate');
        const taskPriorityField = document.getElementById('taskPriority');
        
        if (taskTitleField && taskDueDateField && taskPriorityField) {
            taskTitleField.value = task.title;
            
            if (task.dueDate) {
                // Format date for datetime-local input
                const dueDate = new Date(task.dueDate);
                const year = dueDate.getFullYear();
                const month = String(dueDate.getMonth() + 1).padStart(2, '0');
                const day = String(dueDate.getDate()).padStart(2, '0');
                const hours = String(dueDate.getHours()).padStart(2, '0');
                const minutes = String(dueDate.getMinutes()).padStart(2, '0');
                
                taskDueDateField.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            } else {
                taskDueDateField.value = '';
            }
            
            taskPriorityField.value = task.priority;
            
            // Add edit mode indicator and update submit button
            const todoForm = document.getElementById('todoForm');
            const submitBtn = todoForm.querySelector('button[type="submit"]');
            
            todoForm.dataset.editMode = 'true';
            todoForm.dataset.taskId = taskId;
            
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
                submitBtn.classList.add('btn-warning');
                submitBtn.classList.remove('btn-primary');
            }
            
            // Add cancel button if it doesn't exist
            if (!document.getElementById('cancelEditBtn')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.id = 'cancelEditBtn';
                cancelBtn.type = 'button';
                cancelBtn.className = 'btn btn-secondary ms-2';
                cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
                cancelBtn.onclick = () => this.cancelEdit();
                
                submitBtn.parentNode.appendChild(cancelBtn);
            }
            
            // Scroll to form
            todoForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    cancelEdit() {
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.reset();
            todoForm.dataset.editMode = 'false';
            delete todoForm.dataset.taskId;
            
            // Update submit button
            const submitBtn = todoForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
                submitBtn.classList.add('btn-primary');
                submitBtn.classList.remove('btn-warning');
            }
            
            // Remove cancel button
            const cancelBtn = document.getElementById('cancelEditBtn');
            if (cancelBtn) {
                cancelBtn.remove();
            }
        }
    }

    scheduleReminders() {
        // Clear any existing reminders
        if (window.taskReminders) {
            window.taskReminders.forEach(reminder => clearTimeout(reminder));
        }
        window.taskReminders = [];
        
        // Skip if notifications are blocked
        if (window.notificationManager && window.notificationManager.notificationsBlocked) {
            return;
        }
        
        const now = new Date();
        
        // Schedule reminders for upcoming tasks
        this.tasks.forEach(task => {
            if (task.completed || !task.dueDate) return;
            
            const dueDate = new Date(task.dueDate);
            if (dueDate <= now) return; // Skip past due tasks
            
            const timeUntilDue = dueDate - now;
            
            // Remind 30 minutes before
            if (timeUntilDue > 30 * 60 * 1000) {
                const reminderTime = timeUntilDue - 30 * 60 * 1000;
                const reminder = setTimeout(() => {
                    this.showReminder(task, 30);
                }, reminderTime);
                
                window.taskReminders.push(reminder);
            }
            
            // Remind 5 minutes before
            if (timeUntilDue > 5 * 60 * 1000) {
                const reminderTime = timeUntilDue - 5 * 60 * 1000;
                const reminder = setTimeout(() => {
                    this.showReminder(task, 5);
                }, reminderTime);
                
                window.taskReminders.push(reminder);
            }
        });
    }
    
    showReminder(task, minutesLeft) {
        if (window.notificationManager && !window.notificationManager.notificationsBlocked) {
            const title = `Task Reminder: ${minutesLeft} minutes left`;
            const body = `"${task.title}" is due soon`;
            
            new Notification(title, {
                body: body,
                icon: "/static/images/focus-icon.svg"
            });
            
            if (window.audioManager) {
                window.audioManager.playNotification('reminder');
            }
        }
    }
    
    getCurrentTasks() {
        return this.tasks.filter(task => !task.completed);
    }
}

// Initialize to-do manager when the page loads
let todoManager = null;
document.addEventListener('DOMContentLoaded', () => {
    todoManager = new TodoManager();
});
