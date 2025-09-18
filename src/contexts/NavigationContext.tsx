import React, { createContext, useContext, useState } from 'react';

type NavigationSection = 'projects' | 'tasks' | 'calendar' | 'settings' | 'project-editor';
type ViewMode = 'list' | 'grid' | 'calendar';

interface NavigationContextType {
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  editingProjectId: string | null;
  setEditingProjectId: (projectId: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
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
  const [activeSection, setActiveSection] = useState<NavigationSection>('projects');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <NavigationContext.Provider value={{
      activeSection,
      setActiveSection,
      editingProjectId,
      setEditingProjectId,
      viewMode,
      setViewMode
    }}>
      {children}
    </NavigationContext.Provider>
  );
};