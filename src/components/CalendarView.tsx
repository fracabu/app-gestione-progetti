import React from 'react';
import { Calendar, Clock, AlertTriangle, User } from 'lucide-react';
import { Project, Task } from '../data/projects';

interface CalendarViewProps {
  projects: Project[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ projects }) => {
  // Extract all tasks with due dates
  const tasksWithDates = projects.flatMap(project =>
    (project.tasks || [])
      .filter(task => task.dueDate)
      .map(task => ({
        ...task,
        projectName: project.name,
        projectId: project.id,
        projectStatus: project.status
      }))
  );

  // Get current date and week dates
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasksWithDates.filter(task => task.dueDate === dateStr);
  };

  const getUrgencyLevel = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'urgent';
    return 'normal';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-l-red-500';
      case 'today':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-l-orange-500';
      case 'urgent':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-l-yellow-500';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-l-blue-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Calendar</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Week of {formatDate(weekDays[0])}</span>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' });

            return (
              <div key={index} className="space-y-2">
                {/* Day Header */}
                <div className={`text-center p-2 rounded-lg ${
                  isToday(date)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  <div className="text-xs font-medium uppercase">{dayName}</div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                </div>

                {/* Tasks for this day */}
                <div className="space-y-1 min-h-[200px]">
                  {dayTasks.map((task, taskIndex) => {
                    const urgency = getUrgencyLevel(task.dueDate);
                    return (
                      <div
                        key={taskIndex}
                        className={`p-2 rounded text-xs border-l-2 ${getUrgencyColor(urgency)}`}
                      >
                        <div className="font-medium truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="text-xs opacity-75 truncate" title={task.projectName}>
                          📁 {task.projectName}
                        </div>
                        {task.assignee && (
                          <div className="text-xs opacity-75 truncate">
                            👤 {task.assignee}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Tasks</h3>

        {/* Next 30 days tasks */}
        <div className="space-y-3">
          {tasksWithDates
            .filter(task => {
              const taskDate = new Date(task.dueDate);
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(today.getDate() + 30);
              return taskDate >= today && taskDate <= thirtyDaysFromNow;
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 10)
            .map((task, index) => {
              const urgency = getUrgencyLevel(task.dueDate);
              const taskDate = new Date(task.dueDate);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        urgency === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        urgency === 'today' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        urgency === 'urgent' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {urgency === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {urgency === 'today' && <Clock className="h-3 w-3 mr-1" />}
                        {urgency === 'urgent' && <Clock className="h-3 w-3 mr-1" />}
                        {urgency === 'overdue' ? 'Overdue' :
                         urgency === 'today' ? 'Today' :
                         urgency === 'urgent' ? 'Urgent' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>📁 {task.projectName}</span>
                      {task.assignee && (
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {taskDate.toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {tasksWithDates.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming tasks with due dates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;