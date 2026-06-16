class AnalyticsManager {
    constructor() {
        this.chart = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.renderDailyReport();
        this.loadWeeklyChart();
    }

    renderDailyReport() {
        const history = JSON.parse(localStorage.getItem('session_history')) || [];
        const today = new Date().toDateString();
        const todaySessions = history.filter(s => new Date(s.date).toDateString() === today);
        const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 25), 0);
        const score = this.calcScore(todaySessions.length, totalMinutes);

        document.getElementById('dailySessionCount').textContent = todaySessions.length;
        document.getElementById('dailyFocusMinutes').textContent = totalMinutes;
        document.getElementById('dailyScore').textContent = score + '%';

        const bar = document.getElementById('dailyScoreBar');
        if (bar) {
            bar.style.width = score + '%';
            bar.className = 'progress-bar ' + (score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-danger');
        }

        const subjectMap = {};
        todaySessions.forEach(s => {
            const sub = s.subject || 'General';
            subjectMap[sub] = (subjectMap[sub] || 0) + 1;
        });
        const topSubject = Object.entries(subjectMap).sort((a, b) => b[1] - a[1])[0];
        const subjectEl = document.getElementById('topSubjectToday');
        if (subjectEl) subjectEl.textContent = topSubject ? topSubject[0] : '—';
    }

    calcScore(sessions, minutes) {
        const target = 4;
        const targetMinutes = 100;
        const sessionScore = Math.min(sessions / target, 1) * 60;
        const minuteScore = Math.min(minutes / targetMinutes, 1) * 40;
        return Math.round(sessionScore + minuteScore);
    }

    getWeeklyData() {
        const history = JSON.parse(localStorage.getItem('session_history')) || [];
        const days = [];
        const labels = [];
        const sessionCounts = [];
        const minuteCounts = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dayLabel);

            const daySessions = history.filter(s => new Date(s.date).toDateString() === dateStr);
            sessionCounts.push(daySessions.length);
            minuteCounts.push(daySessions.reduce((sum, s) => sum + (s.duration || 25), 0));
        }

        return { labels, sessionCounts, minuteCounts };
    }

    loadWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        const { labels, sessionCounts, minuteCounts } = this.getWeeklyData();
        const weeklyScore = this.calcWeeklyScore(sessionCounts, minuteCounts);
        const el = document.getElementById('weeklyScore');
        if (el) el.textContent = weeklyScore + ' / 100';

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Sessions',
                        data: sessionCounts,
                        backgroundColor: 'rgba(13, 110, 253, 0.7)',
                        borderColor: 'rgba(13, 110, 253, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Focus (min)',
                        data: minuteCounts,
                        backgroundColor: 'rgba(32, 201, 151, 0.6)',
                        borderColor: 'rgba(32, 201, 151, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: '#adb5bd' } },
                    tooltip: { backgroundColor: '#212529', titleColor: '#f8f9fa', bodyColor: '#adb5bd' }
                },
                scales: {
                    x: { ticks: { color: '#adb5bd' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: {
                        type: 'linear', position: 'left',
                        ticks: { color: '#adb5bd', stepSize: 1 },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        title: { display: true, text: 'Sessions', color: '#adb5bd' }
                    },
                    y1: {
                        type: 'linear', position: 'right',
                        ticks: { color: '#20c997' },
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Minutes', color: '#20c997' }
                    }
                }
            }
        });
    }

    calcWeeklyScore(sessionCounts, minuteCounts) {
        const totalSessions = sessionCounts.reduce((a, b) => a + b, 0);
        const totalMinutes = minuteCounts.reduce((a, b) => a + b, 0);
        const activeDays = sessionCounts.filter(s => s > 0).length;
        const sessionScore = Math.min(totalSessions / 28, 1) * 50;
        const minuteScore = Math.min(totalMinutes / 700, 1) * 30;
        const consistencyScore = (activeDays / 7) * 20;
        return Math.round(sessionScore + minuteScore + consistencyScore);
    }

    syncSessionToBackend(sessionData) {
        fetch('/api/sessions/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        }).catch(() => {});
    }

    refreshAll() {
        this.renderDailyReport();
        this.loadWeeklyChart();
    }
}

window.analyticsManager = new AnalyticsManager();

document.addEventListener('DOMContentLoaded', () => {
    const analyticsTab = document.getElementById('analyticsTabBtn');
    if (analyticsTab) {
        analyticsTab.addEventListener('click', () => {
            window.analyticsManager.refreshAll();
        });
    }

    const analyticsPanelEl = document.getElementById('analyticsPanel');
    if (analyticsPanelEl) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if (m.target.classList.contains('show')) {
                    window.analyticsManager.init();
                }
            });
        });
        observer.observe(analyticsPanelEl, { attributes: true, attributeFilter: ['class'] });
    }
});
