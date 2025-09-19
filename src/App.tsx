import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { useProjects } from './hooks/useProjects';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import ProjectDashboard from './components/ProjectDashboard';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import ProjectEditor from './components/ProjectEditor';
import CalendarView from './components/CalendarView';
import Notifications from './components/Notifications';
import GeminiChatSidebar from './components/GeminiChatSidebar';

const AppContent = () => {
  const { activeSection, editingProjectId, setActiveSection } = useNavigation();
  const { projects } = useProjects();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(320);

  // Validate project-editor state on mount and when projects change
  useEffect(() => {
    if (activeSection === 'project-editor' && editingProjectId) {
      const projectExists = projects.some(p => p.id === editingProjectId);
      if (!projectExists) {
        // Project doesn't exist anymore, redirect to projects
        setActiveSection('projects');
      }
    }
  }, [activeSection, editingProjectId, projects, setActiveSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'projects':
        return <ProjectDashboard />;
      case 'tasks':
        return <Tasks />;
      case 'calendar':
        return <CalendarView />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'project-editor':
        return <ProjectEditor />;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white dark:bg-gray-900 relative">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-0 h-screen lg:h-auto transition-all duration-300"
        style={{
          marginRight: isChatOpen ? `${chatWidth}px` : '0px'
        }}
      >
        <TopNavigation />
        <div className="flex-1 overflow-auto pb-16 lg:pb-0 min-h-0">
          {renderContent()}
        </div>
      </div>
      <GeminiChatSidebar
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        width={chatWidth}
        onWidthChange={setChatWidth}
      />
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