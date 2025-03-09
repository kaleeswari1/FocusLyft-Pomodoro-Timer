
class TodoManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.editingTaskId = null;
        window.taskReminders = [];
        
        // We'll initialize UI only after DOM is fully loaded
        if (document.readyState === 'complete') {
            this.initializeUI();
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                this.initializeUI();
            });
        }
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

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== Number(taskId));
        this.saveTasks();
        this.updateTaskList();
        this.scheduleReminders();
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === Number(taskId));
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            const wasCompleted = task.completed;
            task.completed = !wasCompleted;
            
            // Award points when completing a task (not when uncompleting)
            if (!wasCompleted && task.completed && window.rewardsManager) {
                window.rewardsManager.recordCompletedTask(task);
            }
            
            this.saveTasks();
            this.updateTaskList();
            this.scheduleReminders();
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === Number(taskId));
        if (!task) return;
        
        const todoForm = document.getElementById('todoForm');
        const taskTitleInput = document.getElementById('taskTitle');
        const taskDueDateInput = document.getElementById('taskDueDate');
        const taskPriorityInput = document.getElementById('taskPriority');
        const submitBtn = todoForm.querySelector('button[type="submit"]');
        
        // Fill form with task data
        taskTitleInput.value = task.title;
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const year = dueDate.getFullYear();
            const month = String(dueDate.getMonth() + 1).padStart(2, '0');
            const day = String(dueDate.getDate()).padStart(2, '0');
            const hours = String(dueDate.getHours()).padStart(2, '0');
            const minutes = String(dueDate.getMinutes()).padStart(2, '0');
            
            taskDueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            taskDueDateInput.value = '';
        }
        
        taskPriorityInput.value = task.priority;
        
        // Set form to edit mode
        todoForm.dataset.editMode = 'true';
        todoForm.dataset.taskId = taskId;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
        
        // Focus on title input
        taskTitleInput.focus();
    }
    
    updateTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        // Clear current list
        taskList.innerHTML = '';
        
        // Sort tasks by priority and due date
        const sortedTasks = [...this.tasks].sort((a, b) => {
            // First by completion
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then by priority
            const priorityValue = { high: 0, medium: 1, low: 2 };
            if (a.priority !== b.priority) {
                return priorityValue[a.priority] - priorityValue[b.priority];
            }
            
            // Then by due date
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            
            // Finally by creation date
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        const now = new Date();
        
        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'bg-light' : ''}`;
            
            const leftSide = document.createElement('div');
            leftSide.className = 'd-flex align-items-center flex-grow-1';
            
            // Create completion checkbox
            const checkDiv = document.createElement('div');
            checkDiv.className = 'form-check me-3';
            
            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input';
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.id = `task-${task.id}`;
            checkbox.addEventListener('change', () => {
                this.toggleTaskCompletion(task.id);
            });
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `task-${task.id}`;
            label.textContent = task.title;
            
            if (task.completed) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#6c757d';
            }
            
            checkDiv.appendChild(checkbox);
            checkDiv.appendChild(label);
            leftSide.appendChild(checkDiv);
            
            // Task metadata (due date and priority)
            if (task.dueDate || task.priority) {
                const metaDiv = document.createElement('div');
                metaDiv.className = 'ms-3 d-flex flex-column';
                
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const dueDateElement = document.createElement('small');
                    dueDateElement.textContent = `Due: ${dueDate.toLocaleString()}`;
                    
                    // Mark as overdue if past due date
                    if (dueDate < now && !task.completed) {
                        dueDateElement.className = 'task-overdue';
                    }
                    
                    metaDiv.appendChild(dueDateElement);
                }
                
                if (task.priority) {
                    const priorityElement = document.createElement('small');
                    const priorityColors = {
                        high: 'danger',
                        medium: 'warning',
                        low: 'info'
                    };
                    
                    priorityElement.className = `badge text-bg-${priorityColors[task.priority]}`;
                    priorityElement.textContent = `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`;
                    metaDiv.appendChild(priorityElement);
                }
                
                leftSide.appendChild(metaDiv);
            }
            
            // Action buttons
            const actionDiv = document.createElement('div');
            actionDiv.className = 'task-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-outline-primary me-2';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit task';
            editBtn.addEventListener('click', () => {
                this.editTask(task.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete task';
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(task.id);
                }
            });
            
            actionDiv.appendChild(editBtn);
            actionDiv.appendChild(deleteBtn);
            
            // Add everything to list item
            li.appendChild(leftSide);
            li.appendChild(actionDiv);
            
            // Add to task list
            taskList.appendChild(li);
        });
    }
    
    scheduleReminders() {
        // Clear any existing reminders
        for (const reminder of window.taskReminders || []) {
            clearTimeout(reminder);
        }
        window.taskReminders = [];
        
        // Don't schedule if notifications are blocked
        if (window.notificationManager && window.notificationManager.notificationsBlocked) {
            return;
        }
        
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
            
            reminderTimes.forEach(reminderTime => {
                if (timeUntilDue > reminderTime) {
                    const delay = timeUntilDue - reminderTime;
                    let timeText = '';
                    
                    if (reminderTime === 15 * 60 * 1000) timeText = '15 minutes';
                    else if (reminderTime === 60 * 60 * 1000) timeText = '1 hour';
                    else if (reminderTime === 24 * 60 * 60 * 1000) timeText = '1 day';
                    
                    const timerId = setTimeout(() => {
                        // Check if the task is still incomplete
                        const currentTask = this.tasks.find(t => t.id === task.id);
                        if (currentTask && !currentTask.completed) {
                            this.showTaskReminder(task, timeText);
                        }
                    }, delay);
                    
                    window.taskReminders.push(timerId);
                }
            });
        });
    }
    
    showTaskReminder(task, timeText) {
        // Show desktop notification if permission granted
        if (Notification.permission === 'granted') {
            const notification = new Notification(`Task Reminder: ${task.title}`, {
                body: `Your task is due in ${timeText}.`,
                icon: '/static/images/favicon.ico'
            });
            
            // Close notification after 10 seconds
            setTimeout(() => notification.close(), 10000);
        }
        
        // Also show in-app notification
        if (window.notificationManager) {
            window.notificationManager.showNotification(
                'Task Reminder', 
                `"${task.title}" is due in ${timeText}.`,
                'warning'
            );
        }
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

// Create a global instance and ensure it's loaded properly
document.addEventListener('DOMContentLoaded', () => {
    window.todoManager = new TodoManager();
});
