import React, { createContext, useContext, useState, useEffect } from 'react';

type NavigationSection = 'projects' | 'tasks' | 'calendar' | 'notifications' | 'settings' | 'project-editor';
type ViewMode = 'list' | 'grid' | 'calendar';

interface NavigationContextType {
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  editingProjectId: string | null;
  setEditingProjectId: (projectId: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [activeSection, setActiveSection] = useState<NavigationSection>(() => {
    const saved = localStorage.getItem('activeSection');
    return (saved && ['projects', 'tasks', 'calendar', 'notifications', 'settings', 'project-editor'].includes(saved))
      ? saved as NavigationSection
      : 'projects';
  });

  const [editingProjectId, setEditingProjectId] = useState<string | null>(() => {
    const saved = localStorage.getItem('editingProjectId');
    return saved || null;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved && ['list', 'grid', 'calendar'].includes(saved))
      ? saved as ViewMode
      : 'grid';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  useEffect(() => {
    if (editingProjectId) {
      localStorage.setItem('editingProjectId', editingProjectId);
    } else {
      localStorage.removeItem('editingProjectId');
    }
  }, [editingProjectId]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Enhanced setActiveSection to handle navigation persistence correctly
  const handleSetActiveSection = (section: NavigationSection) => {
    // If switching away from project-editor, clear the editing state
    if (activeSection === 'project-editor' && section !== 'project-editor') {
      setEditingProjectId(null);
    }
    setActiveSection(section);
  };

  return (
    <NavigationContext.Provider value={{
      activeSection,
      setActiveSection: handleSetActiveSection,
      editingProjectId,
      setEditingProjectId,
      viewMode,
      setViewMode,
      sidebarCollapsed,
      setSidebarCollapsed
    }}>
      {children}
    </NavigationContext.Provider>
  );
};