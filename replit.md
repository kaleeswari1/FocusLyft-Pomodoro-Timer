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
  - `reflection.js`: Study reflection journal and distraction tracking
  - `achievements.js`: Custom achievement paths and goal setting
  - `knowledge.js`: Mini knowledge reminders during breaks
  - `focus-zones.js`: Customizable study environments and timer presets
  - `study-buddy.js`: Virtual study companions and group features
  - `environment-sounds.js`: Ambient soundscapes for enhanced focus

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

## Study Reflection System
- **Smart Prompting**: Reflection modal after every 3-4 completed sessions
- **Varied Questions**: Rotating prompts about accomplishments and challenges
- **Rating System**: 5-point scale for session productivity evaluation
- **Subject Tracking**: Links reflections to specific study subjects
- **Journal View**: Historical view of all reflection entries with insights

## Distraction Tracking
- **Automatic Detection**: Monitors when user leaves app during active sessions
- **Quick Capture**: One-click distraction categorization system
- **Pattern Analysis**: Weekly distraction reports with time-based insights
- **Smart Suggestions**: Personalized recommendations based on distraction patterns
- **Focus Improvement**: Data-driven approach to reducing interruptions

## Custom Achievement System
- **Personal Goal Setting**: Create custom milestones based on individual needs
- **Multiple Goal Types**: Sessions, subjects, streaks, time-based, and custom metrics
- **Progress Tracking**: Visual progress bars and real-time updates
- **Reward Integration**: Personal reward messages with confetti celebrations
- **Achievement Categories**: Sessions completion, subject focus, consecutive days, study time
- **Deadline Support**: Optional target dates for time-bound goals

## Knowledge Reminder System
- **Subject-Specific Content**: Curated formulas, concepts, and tips by subject area
- **Break Integration**: Mini-learning moments during break periods
- **Content Variety**: Mix of formulas, study techniques, and motivational insights
- **Save Feature**: Bookmark useful reminders for later review
- **Smart Rotation**: Avoids repetition by tracking recently shown content
- **Multi-Subject Support**: Mathematics, Science, History, English, Languages, and General study tips

## Focus Zones System
- **Preset Environments**: Deep Work, Balanced Study, Creative Flow, Review & Practice, Exam Preparation
- **Custom Zone Creation**: Personalized timer settings, visual themes, and behavioral modifications
- **Environment Adaptation**: Each zone adjusts quotes, distraction sensitivity, and celebration styles
- **Timer Integration**: Automatic application of zone-specific work/break durations
- **Visual Customization**: Custom icons, colors, and descriptions for each zone

## Virtual Study Buddy System
- **AI Companions**: Four unique personalities - Alex (Encouraging), Maya (Analytical), Zoe (Creative), Kai (Motivational)
- **Personality-Based Interactions**: Each buddy provides subject-specific advice and encouragement
- **Progress Celebration**: Personalized congratulations and achievement recognition
- **Study Groups**: Create and join virtual study groups for accountability
- **Dynamic Advice**: Context-aware tips based on current subject and study patterns

## Environment Sounds System
- **Ambient Soundscapes**: Rain, Forest, Coffee Shop, Ocean Waves, White Noise, Library
- **Web Audio Generation**: Real-time sound synthesis using Web Audio API
- **Volume Control**: Adjustable intensity with visual feedback
- **Focus Integration**: Auto-start preferred sounds during work sessions
- **Break Adaptation**: Volume adjustment during break periods for optimal relaxation

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