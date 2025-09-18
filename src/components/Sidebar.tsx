import React from 'react';
import {
  CheckSquare,
  FileText,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useProjects } from '../hooks/useProjects';

const Sidebar = () => {
  const { activeSection, setActiveSection } = useNavigation();
  const { projects } = useProjects();

  // Get current date and calculate next 3 months
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getMonthData = (monthOffset: number) => {
    const date = new Date(currentYear, currentMonth + monthOffset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    // Get projects with due dates in this month
    const monthProjects = projects.filter(project => {
      if (!project.dueDate) return false;
      const dueDate = new Date(project.dueDate);
      return dueDate.getMonth() === month && dueDate.getFullYear() === year;
    });

    return {
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      projects: monthProjects,
      month,
      year
    };
  };

  const months = [
    getMonthData(0), // Current month
    getMonthData(1), // Next month
    getMonthData(2)  // Month after next
  ];

  const navigationItems = [
    { icon: CheckSquare, label: 'Progetti', id: 'projects' as const },
    { icon: FileText, label: 'Task', id: 'tasks' as const },
    { icon: Settings, label: 'Impostazioni', id: 'settings' as const },
  ];


  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 bg-gray-50 dark:bg-gray-800 h-screen flex-col border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-gray-700 dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 14 14">
                <path fill="currentColor" fillRule="evenodd" d="M11.673.834a.75.75 0 0 0-1.085.796l.168.946q-.676.14-1.369.173c-.747-.004-1.315-.287-2.041-.665l-.04-.02c-.703-.366-1.564-.814-2.71-.814h-.034A10.4 10.4 0 0 0 .416 2.328a.75.75 0 1 0 .668 1.343a8.9 8.9 0 0 1 3.529-.921c.747.004 1.315.287 2.041.665l.04.02c.703.366 1.564.815 2.71.815l.034-.001a10.3 10.3 0 0 0 4.146-1.078a.75.75 0 0 0 .338-1.005a.75.75 0 0 0-.334-.336zM4.562 5.751l.034-.001c1.146 0 2.007.448 2.71.814l.04.02c.726.378 1.294.662 2.041.666q.707-.034 1.398-.18l-.192-.916a.75.75 0 0 1 1.08-.82l1.915.996a.747.747 0 0 1 .36.943a.75.75 0 0 1-.364.399a10.5 10.5 0 0 1-1.705.668a10.3 10.3 0 0 1-2.475.41c-1.146 0-2.007-.448-2.71-.814l-.04-.02c-.726-.378-1.294-.662-2.041-.666a8.9 8.9 0 0 0-3.53.922a.75.75 0 1 1-.667-1.344a10.4 10.4 0 0 1 4.146-1.077m0 4.5h.034c1.146 0 2.007.448 2.71.814l.04.02c.726.378 1.294.661 2.041.665a9 9 0 0 0 1.402-.18l-.195-.912a.75.75 0 0 1 1.079-.823l1.915.996a.747.747 0 0 1 .36.942a.75.75 0 0 1-.364.4a10.4 10.4 0 0 1-4.18 1.078c-1.146 0-2.007-.449-2.71-.815l-.04-.02c-.726-.378-1.294-.661-2.041-.665a8.9 8.9 0 0 0-3.53.921a.75.75 0 1 1-.667-1.343a10.4 10.4 0 0 1 4.146-1.078" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">ProjectFlow</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-3 mb-6">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(item.id)}
                className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  activeSection === item.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Calendar Section */}
          <div className="px-3">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Calendario</h3>
            </div>

            <div className="space-y-4">
              {months.map((monthData, index) => (
                <div key={`${monthData.year}-${monthData.month}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {monthData.monthName}
                  </h4>
                  {monthData.projects.length > 0 ? (
                    <div className="space-y-2">
                      {monthData.projects.map((project) => (
                        <div key={project.id} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white font-medium truncate">
                              {project.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-shrink-0">
                              {new Date(project.dueDate).getDate()}
                            </span>
                          </div>
                          <div className={`h-1 rounded-full mt-1 ${
                            project.status === 'Deployed' ? 'bg-green-400' :
                            project.status === 'In Development' ? 'bg-blue-400' :
                            project.status === 'Testing' ? 'bg-yellow-400' :
                            project.status === 'Planning' ? 'bg-gray-400' :
                            'bg-purple-400'
                          }`}></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nessun progetto</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <nav className="flex justify-around">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors duration-150 ${
                activeSection === item.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;