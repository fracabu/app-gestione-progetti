import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import ProjectDashboard from './components/ProjectDashboard';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Goals from './components/Goals';
import Settings from './components/Settings';
import Calendar from './components/Calendar';
import Automations from './components/Automations';

const AppContent = () => {
  const { activeSection } = useNavigation();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectDashboard />;
      case 'tasks':
        return <Tasks />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings />;
      case 'calendar':
        return <Calendar />;
      case 'automations':
        return <Automations />;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <TopNavigation />
        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;