# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a React-based project management application built with TypeScript, Firebase, and Tailwind CSS.

### Core Structure
- **App.tsx**: Main app component with routing logic that renders different sections based on navigation state
- **Navigation System**: Context-based navigation (NavigationContext) manages active sections: projects, tasks, settings (note: current implementation has simplified navigation compared to original design)
- **Data Layer**: Firebase Firestore for real-time data with `useProjects` hook for CRUD operations  
- **Theme System**: Context-based theme management (ThemeContext) supporting light/dark modes

### Key Components
- **Sidebar**: Main navigation with section switching
- **ProjectDashboard**: Main projects overview and management
- **TopNavigation**: Header navigation bar component
- **Tasks**: Task management interface
- **Settings**: Application settings panel
- **ProjectForm**: Modal-based project creation/editing

### Data Models
Projects stored in `src/data/projects.ts` with interface definitions:
- **Project**: Main project entity with tasks, status, priority, technologies
- **Task**: Individual tasks with assignees, due dates, status tracking

### Firebase Integration
- Configuration in `src/lib/firebase.ts` using environment variables (VITE_FIREBASE_*)
- Real-time data sync with `useProjects` hook using Firestore onSnapshot for live updates
- Collections: `projects` (main data storage)
- CRUD operations: addDoc, updateDoc, deleteDoc via useProjects hook

### Development Notes
- Uses Vite as build tool with React plugin
- Tailwind CSS for styling with dark mode support
- TypeScript for type safety
- No test framework currently configured
- Environment variables required for Firebase connection

### Sample Data Migration
The app includes a `migrateData.ts` utility to populate Firebase with sample projects. Run `window.migrateProjects()` in browser console to load sample data.

### Environment Setup
Firebase connection requires environment variables in `.env` file:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN  
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID