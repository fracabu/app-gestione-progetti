import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lightbulb,
  Target,
  Trash2,
  MarkAsRead,
  RefreshCw,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { notificationService, Notification } from '../services/notifications';
import { useProjects } from '../hooks/useProjects';
import { useNavigation } from '../contexts/NavigationContext';

const Notifications = () => {
  const { projects } = useProjects();
  const { setActiveSection, setEditingProjectId } = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ai_generated'>('all');

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every minute
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      await notificationService.forceGenerateInsights(projects);
      loadNotifications();
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Errore nella generazione degli insights. Controlla la configurazione API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
    // Trigger a custom event to update the badge in TopNavigation
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
    // Trigger a custom event to update the badge in TopNavigation
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
    // Trigger a custom event to update the badge in TopNavigation
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to relevant section if applicable
    if (notification.projectId) {
      setEditingProjectId(notification.projectId);
      setActiveSection('project-editor');
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'daily_insight':
        return <Sparkles className={`h-5 w-5 ${priority === 'high' ? 'text-purple-500' : 'text-blue-500'}`} />;
      case 'deadline_reminder':
        return <Clock className={`h-5 w-5 ${priority === 'urgent' ? 'text-red-500' : 'text-orange-500'}`} />;
      case 'project_suggestion':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'urgent_task':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} min fa`;
    } else if (diffHours < 24) {
      return `${diffHours}h fa`;
    } else if (diffDays < 7) {
      return `${diffDays} giorni fa`;
    } else {
      return date.toLocaleDateString('it-IT');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'ai_generated':
        return notification.aiGenerated;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex-1 flex flex-col mobile-flex-container h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-700 dark:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Notifiche AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Insights giornalieri e promemoria intelligenti sui tuoi progetti
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isGenerating ? 'Generando...' : 'Genera Insights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 md:px-6 py-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Totali</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BellRing className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Non Lette</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">AI Generated</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {notifications.filter(n => n.aiGenerated).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Tutte
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Non Lette ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('ai_generated')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'ai_generated'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              AI Insights
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Segna tutte come lette</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto webkit-overflow-scrolling-touch mobile-flex-content">
        <div className="p-4 md:p-6 pb-16 lg:pb-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Bell className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'unread' ? 'Nessuna notifica non letta' : 'Nessuna notifica'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'ai_generated'
                  ? 'Le analisi AI appariranno qui automaticamente ogni mattina.'
                  : 'Le notifiche e gli insights sui tuoi progetti appariranno qui.'
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={handleGenerateInsights}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Genera Primi Insights
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative pl-4 pr-6 py-4 border-l-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getPriorityColor(
                    notification.priority
                  )} ${!notification.read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {getNotificationIcon(notification.type, notification.priority)}
                        <h3 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        {notification.aiGenerated && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.projectId && (
                          <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            Vai al progetto
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Segna come letta"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Elimina notifica"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;