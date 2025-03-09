class ExamManager {
    constructor() {
        this.exams = this.loadExams();
        this.initializeUI();
    }

    loadExams() {
        const storedExams = localStorage.getItem('pomodoro_exams');
        return storedExams ? JSON.parse(storedExams) : [];
    }

    saveExams() {
        localStorage.setItem('pomodoro_exams', JSON.stringify(this.exams));
    }

    addExam(subject, date) {
        this.exams.push({ subject, date: new Date(date).toISOString() });
        this.saveExams();
        this.updateExamList();
        this.updateNextExamNotification();
    }

    removeExam(index) {
        this.exams.splice(index, 1);
        this.saveExams();
        this.updateExamList();
        this.updateNextExamNotification();
    }

    initializeUI() {
        const examForm = document.getElementById('examForm');
        examForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subject = document.getElementById('examSubject').value;
            const date = document.getElementById('examDate').value;
            this.addExam(subject, date);
            examForm.reset();
        });

        this.updateExamList();
        this.updateNextExamNotification();
        setInterval(() => this.updateNextExamNotification(), 60000); // Update every minute
    }

    updateExamList() {
        const examList = document.getElementById('examList');
        examList.innerHTML = '';
        
        this.exams.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        this.exams.forEach((exam, index) => {
            const examDate = new Date(exam.date);
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${exam.subject} - ${examDate.toLocaleDateString()}
                <button class="btn btn-sm btn-danger" onclick="examManager.removeExam(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            examList.appendChild(li);
        });
    }

    updateNextExamNotification() {
        const notificationElement = document.getElementById('examNotification');
        const now = new Date();
        
        // Filter and sort upcoming exams
        const upcomingExams = this.exams
            .filter(exam => new Date(exam.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingExams.length === 0) {
            notificationElement.innerHTML = '';
            return;
        }

        const nextExam = upcomingExams[0];
        const daysUntilExam = Math.ceil((new Date(nextExam.date) - now) / (1000 * 60 * 60 * 24));
        
        let message = '';
        let alertClass = '';
        
        if (daysUntilExam <= 3) {
            message = `⚠️ ${nextExam.subject} exam is in ${daysUntilExam} days! Stay focused!`;
            alertClass = 'alert-danger';
        } else if (daysUntilExam <= 7) {
            message = `📚 ${nextExam.subject} exam is coming up in ${daysUntilExam} days. Keep studying!`;
            alertClass = 'alert-warning';
        } else {
            message = `📅 Next exam: ${nextExam.subject} in ${daysUntilExam} days`;
            alertClass = 'alert-info';
        }

        notificationElement.innerHTML = `
            <div class="alert ${alertClass}" role="alert">
                ${message}
            </div>
        `;
    }
}

// Initialize exam manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.examManager = new ExamManager();
});
