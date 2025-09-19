import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useNavigation } from '../contexts/NavigationContext';

const CalendarView = () => {
  const { projects } = useProjects();
  const { setActiveSection, setEditingProjectId } = useNavigation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get calendar data for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const monthName = currentMonth.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric'
  });

  // Generate calendar days
  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  // Get projects for a specific date
  const getProjectsForDate = (date: Date) => {
    return projects.filter(project => {
      if (!project.dueDate) return false;
      const dueDate = new Date(project.dueDate);
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleProjectClick = (projectId: string) => {
    setEditingProjectId(projectId);
    setActiveSection('project-editor');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'In Development':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Deployed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Maintenance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'Pianificazione';
      case 'In Development':
        return 'In Sviluppo';
      case 'Testing':
        return 'Test';
      case 'Deployed':
        return 'Pubblicato';
      case 'Maintenance':
        return 'Manutenzione';
      default:
        return status;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <div className="flex-1 flex flex-col mobile-flex-container h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Calendario</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vista mensile dei progetti e delle scadenze
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {monthName}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Oggi
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto webkit-overflow-scrolling-touch mobile-flex-content p-4 md:p-6 pb-16 lg:pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayProjects = getProjectsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-32 md:min-h-40 lg:min-h-48 p-2 md:p-3 border-r border-b border-gray-200 dark:border-gray-600 ${
                    isCurrentMonthDay
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : isCurrentMonthDay
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {date.getDate()}
                  </div>

                  {dayProjects.length > 0 && (
                    <div className="space-y-1 overflow-y-auto max-h-28 md:max-h-32 lg:max-h-36">
                      {dayProjects.slice(0, 5).map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project.id)}
                          className={`w-full text-left p-1.5 md:p-2 rounded text-xs md:text-sm font-medium hover:scale-105 transition-transform leading-tight ${getStatusColor(project.status)}`}
                          title={`${project.name} - ${getStatusLabel(project.status)}`}
                        >
                          <div className="line-clamp-2 break-words">
                            {project.name}
                          </div>
                        </button>
                      ))}
                      {dayProjects.length > 5 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
                          +{dayProjects.length - 5} altri progetti
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Legenda Stati</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { status: 'Planning', label: 'Pianificazione' },
              { status: 'In Development', label: 'In Sviluppo' },
              { status: 'Testing', label: 'Test' },
              { status: 'Deployed', label: 'Pubblicato' },
              { status: 'Maintenance', label: 'Manutenzione' }
            ].map(({ status, label }) => (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${getStatusColor(status)}`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;