
class TodoManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.editingTaskId = null;
        window.taskReminders = [];
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
        const taskIndex = this.tasks.findIndex(task => task.id === Number(taskId));
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.updateTaskList();
            this.scheduleReminders();
        }
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === Number(taskId));
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.saveTasks();
            this.updateTaskList();
        }
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== Number(taskId));
        this.saveTasks();
        this.updateTaskList();
        this.scheduleReminders();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === Number(taskId));
        if (!task) return;

        const form = document.getElementById('todoForm');
        const titleInput = document.getElementById('taskTitle');
        const dueDateInput = document.getElementById('taskDueDate');
        const priorityInput = document.getElementById('taskPriority');
        const submitBtn = form.querySelector('button[type="submit"]');

        titleInput.value = task.title;
        if (task.dueDate) {
            // Convert ISO string to local datetime-local format
            const date = new Date(task.dueDate);
            const localDatetime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                .toISOString()
                .slice(0, 16);
            dueDateInput.value = localDatetime;
        } else {
            dueDateInput.value = '';
        }
        priorityInput.value = task.priority;

        // Change button text
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
        
        // Set edit mode
        form.dataset.editMode = 'true';
        form.dataset.taskId = taskId;

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
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
            if (task.priority === 'medium') priorityBadgeClass = 'bg-warning';
            if (task.priority === 'low') priorityBadgeClass = 'bg-info';
            
            // Format due date if exists
            let dueDateDisplay = '';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                // Check if due today or tomorrow
                if (dueDate.toDateString() === now.toDateString()) {
                    dueDateDisplay = `<span class="text-warning">Due today at ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                    dueDateDisplay = `<span class="text-info">Due tomorrow at ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                } else if (dueDate < now) {
                    dueDateDisplay = `<span class="text-danger">Overdue (${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>`;
                } else {
                    dueDateDisplay = `<span class="text-muted">Due ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                }
            }
            
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
                            onchange="todoManager.toggleTaskCompletion(${task.id})">
                        <label class="form-check-label ${task.completed ? 'text-decoration-line-through' : ''}">
                            ${task.title}
                            ${dueDateDisplay ? `<br>${dueDateDisplay}` : ''}
                        </label>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <span class="badge ${priorityBadgeClass}">
                                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
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
                </div>
            `;
            
            taskList.appendChild(li);
        });
    }
    
    scheduleReminders() {
        // Clear any existing reminders
        for (const reminder of window.taskReminders || []) {
            clearTimeout(reminder);
        }
        window.taskReminders = [];
        
        // Schedule new reminders for upcoming incomplete tasks
        const now = new Date();
        
        this.tasks.forEach(task => {
            if (task.completed || !task.dueDate) return;
            
            const dueDate = new Date(task.dueDate);
            if (dueDate <= now) return; // Already passed
            
            // Calculate milliseconds until due date
            const timeUntilDue = dueDate.getTime() - now.getTime();
            
            // Set reminders at different intervals
            const reminderTimes = [
                15 * 60 * 1000, // 15 minutes before
                60 * 60 * 1000,  // 1 hour before
                24 * 60 * 60 * 1000 // 1 day before
            ];
            
            reminderTimes.forEach(time => {
                if (timeUntilDue > time) {
                    const reminderTime = timeUntilDue - time;
                    const minutesLabel = time === 15 * 60 * 1000 ? '15 minutes' : 
                                        time === 60 * 60 * 1000 ? '1 hour' : '1 day';
                    
                    const reminder = setTimeout(() => {
                        this.showReminder(task, minutesLabel);
                    }, reminderTime);
                    
                    window.taskReminders.push(reminder);
                }
            });
        });
    }
    
    showReminder(task, timeLabel) {
        if (window.notificationManager && !window.notificationManager.notificationsBlocked) {
            const title = `Task Reminder: ${timeLabel} left`;
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

    initializeUI() {
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('taskTitle').value;
                const dueDate = document.getElementById('taskDueDate').value;
                const priority = document.getElementById('taskPriority').value;
                const submitBtn = todoForm.querySelector('button[type="submit"]');
                
                if (title.trim()) {
                    if (todoForm.dataset.editMode === 'true') {
                        // Update existing task
                        const taskId = todoForm.dataset.taskId;
                        this.updateTask(taskId, {
                            title,
                            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                            priority
                        });
                        
                        // Reset form
                        todoForm.dataset.editMode = 'false';
                        todoForm.dataset.taskId = '';
                        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
                    } else {
                        // Add new task
                        this.addTask(title, dueDate, priority);
                    }
                    todoForm.reset();
                }
            });
        } else {
            console.warn('Todo form element not found');
        }

        // Check for notification permission
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        this.updateTaskList();
        this.scheduleReminders();
    }
}

// Initialize to-do manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.todoManager = new TodoManager();
});
