# 🍅 FocusLyft – Pomodoro Timer & Productivity Suite

A full-featured Pomodoro Timer web application built with **Flask** and **vanilla JavaScript** to help students manage study time, track productivity, and stay motivated.

---

## 🌐 Live Demo

👉 [focuslyft.replit.app](https://focuslyft.replit.app) *(replace with your actual deployed URL)*

---

## ✨ Features

### ⏱️ Core Timer
- Pomodoro technique with customizable work & break durations
- Audio notifications for session transitions
- Focus mode to block distractions

### ✅ Task Management
- Add tasks with due dates and priorities
- Track completion across sessions

### 📅 Exam Tracker
- Schedule upcoming exams
- Smart reminders based on due dates

### 📊 Analytics Dashboard
- Weekly productivity chart (sessions & focus minutes)
- Today's summary by subject

### 🏆 Rewards & Achievements
- Earn points for completing sessions
- Custom achievement paths and goals
- Confetti celebrations 🎉

### 🤖 Virtual Study Buddy
- 4 AI companion personalities: Alex, Maya, Zoe, Kai
- Subject-specific advice and encouragement

### 📖 Study Reflection Journal
- Prompted reflection after every 3–4 sessions
- 5-point productivity rating
- Historical journal view

### 🔍 Distraction Tracker
- Detects when you leave the app during sessions
- Weekly distraction reports and suggestions

### 🌍 Focus Zones
- Preset environments: Deep Work, Creative Flow, Exam Prep, and more
- Custom zones with personal timer settings and themes

### 💡 Knowledge Reminders
- Mini-learning moments during break periods
- Subject-specific formulas and study tips

### 🔐 User Authentication
- Register / Login with username & password
- QR code one-time login tokens
- Session data saved to database per user

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-Login, SQLAlchemy |
| Frontend | Vanilla JavaScript, Bootstrap 5, Font Awesome |
| Database | PostgreSQL (via SQLAlchemy) |
| Auth | Werkzeug password hashing, Flask sessions |
| Animations | canvas-confetti |
| Audio | Web Audio API |
| Notifications | Web Notifications API |
| Storage | LocalStorage (guest) + PostgreSQL (logged in) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/kaleeswari1/FocusLyft-Pomodoro-Timer.git
cd FocusLyft-Pomodoro-Timer

# Install dependencies
pip install flask flask-sqlalchemy flask-login werkzeug

# Set environment variables
export SESSION_SECRET=your_secret_key
export DATABASE_URL=postgresql://user:password@localhost/focuslyft

# Run the app
python main.py
```

Then open `http://localhost:5000` in your browser.

---

## 📁 Project Structure

```
FocusLyft-Pomodoro-Timer/
├── app.py              # Flask routes and API endpoints
├── models.py           # Database models (User, StudySession, QRToken)
├── main.py             # App entry point
├── templates/
│   └── index.html      # Single-page frontend
└── README.md
```

---

## 📸 Screenshot

> *(Add a screenshot of your app here)*

---

## 👩‍💻 Author

**Kaleeswari** — [@kaleeswari1](https://github.com/kaleeswari1)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
