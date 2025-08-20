import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import ProjectDashboard from './components/ProjectDashboard';
import Tasks from './components/Tasks';
import Settings from './components/Settings';

const AppContent = () => {
  const { activeSection } = useNavigation();

  const renderContent = () => {
    switch (activeSection) {
      case 'projects':
        return <ProjectDashboard />;
      case 'tasks':
        return <Tasks />;
      case 'settings':
        return <Settings />;
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