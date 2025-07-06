import React, { createContext, useContext, useState } from 'react';

type NavigationSection = 'dashboard' | 'projects' | 'tasks' | 'goals' | 'docs' | 'calendar' | 'automations' | 'settings';

interface NavigationContextType {
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
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

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
};