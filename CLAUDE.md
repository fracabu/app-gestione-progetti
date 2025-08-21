# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a React-based project management application called "ProjectFlow" built with React 18, TypeScript, Firebase, and Tailwind CSS. The app manages development projects with real-time data synchronization.

### Application Flow
- **App.tsx**: Main app component wrapped in ThemeProvider and NavigationProvider contexts
- **AppContent**: Inner component that renders different sections based on `activeSection` state from NavigationContext
- **Section Routing**: Switch-based rendering for 'projects', 'tasks', and 'settings' sections (defaults to projects)
- **Layout**: Fixed sidebar + flexible content area with top navigation

### Core Architecture Patterns
- **Context-based State**: NavigationContext manages active section, ThemeContext handles light/dark themes
- **Real-time Data**: Firebase Firestore with onSnapshot listeners for live updates via `useProjects` hook
- **Component Composition**: Main layout renders Sidebar + TopNavigation + dynamic content area
- **Type Safety**: Full TypeScript implementation with defined interfaces for Project and Task entities

### Key Components
- **Sidebar**: Main navigation with section switching
- **ProjectDashboard**: Main projects overview and management
- **TopNavigation**: Header navigation bar component  
- **Tasks**: Task management interface
- **Settings**: Application settings panel
- **ProjectForm**: Modal-based project creation/editing

### Data Layer
- **Models**: `src/data/projects.ts` contains Project and Task interfaces plus sample data
- **Firebase Hook**: `src/hooks/useProjects.ts` provides CRUD operations with real-time sync
- **Database**: Firestore collection 'projects' ordered by name
- **Operations**: addProject, updateProject, deleteProject with loading/error states

### Firebase Configuration
- **Setup**: `src/lib/firebase.ts` initializes app, Firestore, and Auth using Vite environment variables
- **Real-time**: onSnapshot listeners for live data synchronization
- **Error Handling**: Loading states and error messages in Italian language
- **Collections**: Currently uses 'projects' collection, Auth ready but not implemented

### Development Stack
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React icon library
- **Language**: TypeScript with strict type checking
- **State**: React Context for global state (no external state management)

### Sample Data Migration
The app includes `migrateData.ts` utility to populate Firebase with sample Italian projects (Il Sorpasso, DevJobMatcher, LinkyThub, Ospitly). Run `window.migrateProjects()` in browser console to load sample data.

### Environment Setup
Firebase connection requires environment variables in `.env` file:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN  
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID