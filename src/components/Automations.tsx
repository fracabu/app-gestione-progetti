import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Edit,
  Clock,
  CheckCircle,
  AlertTriangle,
  GitBranch,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  FileText,
  Users,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  ArrowRight,
  Workflow,
  Bot,
  Timer,
  Bell,
  X
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'project_status' | 'task_completion' | 'due_date' | 'manual' | 'schedule';
    condition: string;
    value?: string;
  };
  actions: {
    type: 'send_email' | 'create_task' | 'update_status' | 'send_notification' | 'assign_user';
    target: string;
    value: string;
  }[];
  status: 'active' | 'paused' | 'draft';
  lastRun?: string;
  runCount: number;
  category: 'Project Management' | 'Notifications' | 'Task Management' | 'Reporting';
  createdAt: string;
}

const Automations = () => {
  const [automations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Project Completion Notification',
      description: 'Send email notification when a project status changes to Deployed',
      trigger: {
        type: 'project_status',
        condition: 'equals',
        value: 'Deployed'
      },
      actions: [
        {
          type: 'send_email',
          target: 'team@company.com',
          value: 'Project deployment notification'
        },
        {
          type: 'send_notification',
          target: 'slack_channel',
          value: '#general'
        }
      ],
      status: 'active',
      lastRun: '2025-01-10T14:30:00Z',
      runCount: 12,
      category: 'Notifications',
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Overdue Task Reminder',
      description: 'Create follow-up tasks for overdue items and notify assignees',
      trigger: {
        type: 'due_date',
        condition: 'past_due',
        value: '1 day'
      },
      actions: [
        {
          type: 'create_task',
          target: 'same_project',
          value: 'Follow up on overdue task'
        },
        {
          type: 'send_email',
          target: 'assignee',
          value: 'Overdue task reminder'
        }
      ],
      status: 'active',
      lastRun: '2025-01-11T09:00:00Z',
      runCount: 8,
      category: 'Task Management',
      createdAt: '2024-12-05T15:30:00Z'
    },
    {
      id: '3',
      name: 'Weekly Progress Report',
      description: 'Generate and send weekly progress reports to stakeholders',
      trigger: {
        type: 'schedule',
        condition: 'weekly',
        value: 'Monday 9:00 AM'
      },
      actions: [
        {
          type: 'send_email',
          target: 'stakeholders@company.com',
          value: 'Weekly progress report'
        }
      ],
      status: 'active',
      lastRun: '2025-01-06T09:00:00Z',
      runCount: 4,
      category: 'Reporting',
      createdAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '4',
      name: 'Auto-assign Code Review',
      description: 'Automatically assign code review tasks when development tasks are completed',
      trigger: {
        type: 'task_completion',
        condition: 'status_change',
        value: 'Done'
      },
      actions: [
        {
          type: 'create_task',
          target: 'same_project',
          value: 'Code review required'
        },
        {
          type: 'assign_user',
          target: 'senior_developer',
          value: 'auto_assign'
        }
      ],
      status: 'paused',
      lastRun: '2025-01-08T16:45:00Z',
      runCount: 15,
      category: 'Project Management',
      createdAt: '2024-11-20T14:20:00Z'
    },
    {
      id: '5',
      name: 'Sprint Planning Reminder',
      description: 'Send reminder to create sprint planning tasks before sprint end',
      trigger: {
        type: 'schedule',
        condition: 'bi_weekly',
        value: 'Friday 3:00 PM'
      },
      actions: [
        {
          type: 'create_task',
          target: 'planning_project',
          value: 'Prepare next sprint planning'
        },
        {
          type: 'send_notification',
          target: 'project_managers',
          value: 'Sprint planning reminder'
        }
      ],
      status: 'draft',
      runCount: 0,
      category: 'Project Management',
      createdAt: '2025-01-05T11:15:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || automation.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || automation.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'project_status':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'task_completion':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'due_date':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'schedule':
        return <Timer className="h-4 w-4 text-purple-500" />;
      case 'manual':
        return <Users className="h-4 w-4 text-gray-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email':
        return <Mail className="h-3 w-3 text-blue-500" />;
      case 'create_task':
        return <FileText className="h-3 w-3 text-green-500" />;
      case 'update_status':
        return <GitBranch className="h-3 w-3 text-purple-500" />;
      case 'send_notification':
        return <Bell className="h-3 w-3 text-orange-500" />;
      case 'assign_user':
        return <Users className="h-3 w-3 text-indigo-500" />;
      default:
        return <Zap className="h-3 w-3 text-gray-400" />;
    }
  };

  const automationStats = {
    total: automations.length,
    active: automations.filter(a => a.status === 'active').length,
    paused: automations.filter(a => a.status === 'paused').length,
    draft: automations.filter(a => a.status === 'draft').length,
    totalRuns: automations.reduce((sum, a) => sum + a.runCount, 0)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Automate your workflow with intelligent triggers and actions
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automationStats.total}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automationStats.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Paused</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automationStats.paused}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automationStats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automationStats.totalRuns}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="Project Management">Project Management</option>
            <option value="Notifications">Notifications</option>
            <option value="Task Management">Task Management</option>
            <option value="Reporting">Reporting</option>
          </select>
        </div>
      </div>

      {/* Automations List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {filteredAutomations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Bot className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No automations found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first automation to streamline your workflow.'
              }
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Automation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAutomations.map((automation) => (
              <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(automation.status)}`}>
                        {getStatusIcon(automation.status)}
                        <span className="ml-1 capitalize">{automation.status}</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-md">
                        {automation.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{automation.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Workflow */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Trigger */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                      {getTriggerIcon(automation.trigger.type)}
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">TRIGGER</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {automation.trigger.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-gray-400" />

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {automation.actions.slice(0, 3).map((action, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                          {getActionIcon(action.type)}
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">ACTION</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {action.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {automation.actions.length > 3 && (
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            +{automation.actions.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {automation.runCount} runs
                      </span>
                    </div>
                    {automation.lastRun && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Last run: {formatDate(automation.lastRun)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {automation.status === 'active' ? (
                      <button className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
                        <Pause className="h-3 w-3" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                        <Play className="h-3 w-3" />
                        <span>Activate</span>
                      </button>
                    )}
                    <button className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      <Zap className="h-3 w-3" />
                      <span>Run Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automation Form Modal Placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Automation</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Automation Builder</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The automation builder interface will be implemented here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;