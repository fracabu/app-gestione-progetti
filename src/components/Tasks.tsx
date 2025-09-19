import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Edit,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useNavigation } from '../contexts/NavigationContext';
import { Task, Project } from '../data/projects';

const Tasks = () => {
  const { projects } = useProjects();
  const { setActiveSection, setEditingProjectId, viewMode } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // Estrai tutti i task da tutti i progetti con informazioni aggiuntive
  const allTasks: (Task & {
    projectName: string;
    projectId: string;
    projectStatus: string;
    projectCategory: string;
  })[] = projects.flatMap(project =>
    (project.tasks || [])
      .filter(task => showCompleted ? true : task.status !== 'Done') // Filtra i completati in base al toggle
      .map(task => ({
        ...task,
        projectName: project.name,
        projectId: project.id,
        projectStatus: project.status,
        projectCategory: project.category
      }))
  );

  // Calculate urgency based on due date
  const getTaskUrgency = (dueDate: string) => {
    if (!dueDate) return 'none';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue'; // Scaduto
    if (diffDays === 0) return 'today'; // Oggi
    if (diffDays <= 3) return 'urgent'; // Prossimi 3 giorni
    if (diffDays <= 7) return 'warning'; // Prossimi 7 giorni
    return 'normal'; // Oltre 7 giorni
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'today':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800';
      case 'urgent':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'today':
        return <Timer className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case 'urgent':
        return <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'Scaduto';
      case 'today': return 'Scade Oggi';
      case 'urgent': return 'Urgente';
      case 'warning': return 'Questa Settimana';
      default: return '';
    }
  };

  // Add urgency to tasks and sort by urgency
  const tasksWithUrgency = allTasks.map(task => ({
    ...task,
    urgency: getTaskUrgency(task.dueDate)
  }));

  const filteredTasks = tasksWithUrgency
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // Sort by urgency first, then by due date
      const urgencyOrder = { overdue: 0, today: 1, urgent: 2, warning: 3, normal: 4, none: 5 };
      const urgencyDiff = urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      if (urgencyDiff !== 0) return urgencyDiff;

      // If same urgency, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Review':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Done':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400';
      case 'Medium':
        return 'text-orange-600 dark:text-orange-400';
      case 'Low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Todo':
        return <AlertCircle className="h-4 w-4" />;
      case 'In Progress':
        return <PlayCircle className="h-4 w-4" />;
      case 'Review':
        return <Clock className="h-4 w-4" />;
      case 'Done':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Calcola le statistiche su TUTTI i task (inclusi quelli completati)
  const allTasksForStats = projects.flatMap(project =>
    (project.tasks || []).map(task => ({
      ...task,
      projectName: project.name,
      projectId: project.id,
      projectStatus: project.status,
      projectCategory: project.category
    }))
  );

  const allTasksWithUrgencyForStats = allTasksForStats.map(task => ({
    ...task,
    urgency: getTaskUrgency(task.dueDate)
  }));

  const taskStats = {
    total: allTasksForStats.length,
    todo: allTasksForStats.filter(t => t.status === 'Todo').length,
    inProgress: allTasksForStats.filter(t => t.status === 'In Progress').length,
    review: allTasksForStats.filter(t => t.status === 'Review').length,
    done: allTasksForStats.filter(t => t.status === 'Done').length,
    overdue: allTasksWithUrgencyForStats.filter(t => t.urgency === 'overdue' && t.status !== 'Done').length,
    today: allTasksWithUrgencyForStats.filter(t => t.urgency === 'today' && t.status !== 'Done').length,
    urgent: allTasksWithUrgencyForStats.filter(t => t.urgency === 'urgent' && t.status !== 'Done').length,
    warning: allTasksWithUrgencyForStats.filter(t => t.urgency === 'warning' && t.status !== 'Done').length
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'In Development':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'Testing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Deployed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Maintenance':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const handleEditTask = (task: Task & { projectId: string }) => {
    setEditingProjectId(task.projectId);
    setActiveSection('project-editor');
  };

  return (
    <div className="flex-1 flex flex-col mobile-flex-container h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Task</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestisci e monitora tutti i task dei tuoi progetti
            </p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>Nuovo Task</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 md:px-6 py-4 flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
          {/* Status Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Totale</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Da Fare</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.todo}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">In Corso</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Revisione</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.review}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-green-600 dark:text-green-400">Completati</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">{taskStats.done}</p>
          </div>

          {/* Urgency Stats */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Scaduti</p>
            </div>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">{taskStats.overdue}</p>
          </div>
          <div className="bg-red-25 dark:bg-red-900/10 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <Timer className="h-3 w-3 text-red-500 dark:text-red-400" />
              <p className="text-xs font-medium text-red-500 dark:text-red-400">Oggi</p>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-300">{taskStats.today}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Urgenti</p>
            </div>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{taskStats.urgent}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Settimana</p>
            </div>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{taskStats.warning}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Cerca task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white flex-1"
            >
              <option value="all">Tutti gli Stati</option>
              <option value="Todo">Da Fare</option>
              <option value="In Progress">In Corso</option>
              <option value="Review">In Revisione</option>
              {showCompleted && <option value="Done">Completati</option>}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white flex-1"
            >
              <option value="all">Tutte le Priorità</option>
              <option value="High">Alta</option>
              <option value="Medium">Media</option>
              <option value="Low">Bassa</option>
            </select>

            {/* Toggle per mostrare task completati */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
              <input
                type="checkbox"
                id="showCompleted"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="showCompleted"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap cursor-pointer"
              >
                Mostra completati ({taskStats.done})
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto webkit-overflow-scrolling-touch mobile-flex-content">
        <div className="p-4 md:p-6 pb-16 lg:pb-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nessun task trovato</h3>
            <p className="text-gray-600 dark:text-gray-400 px-4 text-center">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Prova a modificare i criteri di ricerca o filtro.'
                : 'I task appariranno qui quando crei progetti con step di sviluppo.'
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : viewMode === 'calendar'
              ? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          }>
            {filteredTasks.map((task) => (
              <div key={`${task.projectId}-${task.id}`} className={`rounded-lg p-4 md:p-6 border hover:shadow-md transition-shadow ${getUrgencyColor(task.urgency)}`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </span>
                        {task.urgency !== 'normal' && task.urgency !== 'none' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-opacity-80">
                            {getUrgencyIcon(task.urgency)}
                            <span className="ml-1 font-semibold">{getUrgencyLabel(task.urgency)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md">
                        {task.projectName}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getProjectStatusColor(task.projectStatus)}`}>
                        {task.projectStatus}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-md">
                        {task.projectCategory}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="self-start lg:ml-4 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                      <span className="text-gray-600 dark:text-gray-400">{task.priority}</span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{task.assignee}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        {getUrgencyIcon(task.urgency) || <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                        <span className={`text-sm ${
                          task.urgency === 'overdue' || task.urgency === 'today'
                            ? 'text-red-600 dark:text-red-400 font-medium'
                            : task.urgency === 'urgent'
                            ? 'text-orange-600 dark:text-orange-400 font-medium'
                            : task.urgency === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {task.dueDate}
                          {task.urgency === 'overdue' && ' (Overdue)'}
                          {task.urgency === 'today' && ' (Today!)'}
                        </span>
                      </div>
                    )}
                  </div>
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty state when no projects exist */}
            {projects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <CheckCircle className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nessun progetto ancora</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Crea il tuo primo progetto con step di sviluppo per vedere i task qui.
                </p>
                <button
                  onClick={() => window.location.href = '#projects'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Vai ai Progetti
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

    </div>
  );
};

export default Tasks;