import React, { useState, useEffect } from 'react';
import {
  Filter,
  Bell,
  ChevronDown,
  MoreHorizontal,
  Grid3X3,
  List,
  Calendar
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { notificationService } from '../services/notifications';

const TopNavigation = () => {
  const { viewMode, setViewMode, setActiveSection } = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    setUnreadCount(notificationService.getUnreadCount());

    // Listen for notification updates
    const handleNotificationsUpdate = () => {
      setUnreadCount(notificationService.getUnreadCount());
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);

    // Update every 30 seconds to catch new notifications
    const interval = setInterval(() => {
      setUnreadCount(notificationService.getUnreadCount());
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
    };
  }, []);

  const handleNotificationClick = () => {
    setActiveSection('notifications');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left Section - Empty space for balance */}
        <div className="flex-1"></div>

        {/* Right Section */}
        <div className="flex items-center justify-end space-x-2 md:space-x-4">
          {/* View Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              }`}
              title="Vista Lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              }`}
              title="Vista Griglia"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              }`}
              title="Vista Calendario"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications - Hidden on small mobile */}
          <button
            onClick={handleNotificationClick}
            className="hidden sm:block relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={`${unreadCount} notifiche non lette`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium leading-none">JD</span>
            </div>
            <button className="hidden md:block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;