# Overview

This is a Pomodoro Timer web application built with Flask that helps users manage their time using the Pomodoro Technique. The application features a complete productivity suite including timer functionality, task management, exam tracking, session feedback, rewards system, and focus mode capabilities. It's designed as a single-page application with a Flask backend serving static files and templates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Single Page Application**: Built with vanilla JavaScript using a modular class-based architecture
- **UI Framework**: Bootstrap 5 with dark theme for responsive design
- **Component Structure**: Organized into separate JavaScript modules:
  - `timer.js`: Core Pomodoro timer functionality
  - `todo.js`: Task management system
  - `exams.js`: Exam scheduling and notifications
  - `feedback.js`: Session feedback collection
  - `rewards.js`: Gamification and achievement system
  - `notifications.js`: Browser notification management
  - `audio.js`: Web Audio API for sound notifications
  - `quotes.js`: Daily motivation quotes and study tips system

## Backend Architecture
- **Framework**: Flask (Python) serving as a minimal web server
- **Routing**: Simple route structure with health check endpoint
- **Session Management**: Flask sessions with configurable secret key
- **Error Handling**: Comprehensive logging and error catching
- **Static File Serving**: Standard Flask static file handling

## Data Storage
- **Client-Side Storage**: Local Storage for all user data persistence
- **Data Categories**:
  - Timer settings and session history
  - Task lists with due dates and priorities
  - Exam schedules
  - User feedback and ratings
  - Rewards points and achievements
  - Focus mode preferences
  - Daily quote preferences and rotation state

## State Management
- **Class-Based Architecture**: Each feature module manages its own state
- **Event-Driven Communication**: Components communicate through DOM events
- **Persistent State**: Automatic save/load from localStorage on state changes

## Audio System
- **Web Audio API**: Custom audio notifications using oscillators
- **Sound Patterns**: Different frequency patterns for work/break transitions
- **Focus Mode Integration**: Audio can be disabled during focus sessions

## Notification System
- **Browser Notifications**: Web Notifications API for desktop alerts
- **Permission Management**: Automatic permission requests and status tracking
- **Focus Mode**: Ability to block all notifications for concentration
- **Smart Scheduling**: Task reminders based on due dates and priorities

## Motivation System
- **Daily Quotes**: Curated collection of motivational quotes and study tips
- **Smart Display**: Consistent daily quote with option for random quotes
- **Session Integration**: Automatic quote display when starting work sessions
- **Visual Design**: Gradient backgrounds with smooth transitions and hover effects
- **Content Types**: Mix of inspirational quotes and practical study techniques

# External Dependencies

## Frontend Libraries
- **Bootstrap 5**: CSS framework for responsive UI components
- **Font Awesome**: Icon library for visual elements
- **canvas-confetti**: Celebration animations for achievements

## Browser APIs
- **Web Audio API**: For generating notification sounds
- **Notifications API**: For desktop notification alerts
- **Local Storage API**: For client-side data persistence
- **Focus API**: For enhanced focus mode functionality (where supported)

## Python Dependencies
- **Flask**: Web framework for serving the application
- **Werkzeug**: WSGI utilities (Flask dependency)

## CDN Resources
- Bootstrap CSS and JavaScript from CDN
- Font Awesome icons from CDN
- Canvas Confetti library from CDN

## Environment Configuration
- **SESSION_SECRET**: Environment variable for Flask session security
- **Development Mode**: Debug mode enabled for development
- **Host Configuration**: Configured for 0.0.0.0 to allow external access