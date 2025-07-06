import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trophy,
  Zap
} from 'lucide-react';
import GoalDetails from './GoalDetails';
import GoalForm from './GoalForm';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'Business' | 'Technical' | 'Personal' | 'Team';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  dueDate: string;
  milestones: string[];
}

const Goals = () => {
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Launch DevJobMatcher MVP',
      description: 'Complete and deploy the minimum viable product for the job matching platform',
      category: 'Business',
      priority: 'High',
      status: 'In Progress',
      progress: 35,
      dueDate: '2025-03-15',
      milestones: ['Complete MVP setup', 'Implement matching algorithm', 'Build user dashboards', 'Beta testing']
    },
    {
      id: '2',
      title: 'Optimize Il Sorpasso SEO',
      description: 'Implement comprehensive SEO optimization before domain transfer',
      category: 'Technical',
      priority: 'High',
      status: 'In Progress',
      progress: 60,
      dueDate: '2025-01-30',
      milestones: ['Meta tags implementation', 'Sitemap creation', 'Content optimization', 'Domain transfer']
    },
    {
      id: '3',
      title: 'Build LinkyThub Analytics',
      description: 'Develop advanced analytics dashboard for link management platform',
      category: 'Technical',
      priority: 'Medium',
      status: 'Not Started',
      progress: 0,
      dueDate: '2025-04-30',
      milestones: ['Core platform', 'Analytics engine', 'Dashboard UI', 'API integration']
    },
    {
      id: '4',
      title: 'Complete Ospitly Email Setup',
      description: 'Configure MX records and email functionality for the hospitality platform',
      category: 'Technical',
      priority: 'Medium',
      status: 'In Progress',
      progress: 80,
      dueDate: '2025-01-15',
      milestones: ['DNS configuration', 'MX records setup', 'Email testing', 'Documentation']
    },
    {
      id: '5',
      title: 'Expand Technical Skills',
      description: 'Learn new technologies and frameworks to improve development capabilities',
      category: 'Personal',
      priority: 'Medium',
      status: 'In Progress',
      progress: 45,
      dueDate: '2025-06-30',
      milestones: ['AI/ML fundamentals', 'Advanced React patterns', 'Backend optimization', 'DevOps practices']
    }
  ]);

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'On Hold':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Business':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'Technical':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Personal':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Team':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'Completed').length,
    inProgress: goals.filter(g => g.status === 'In Progress').length,
    notStarted: goals.filter(g => g.status === 'Not Started').length,
    averageProgress: Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
  };

  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleCloseDetails = () => {
    setSelectedGoal(null);
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDeleteGoal = (id: string) => {
    // In a real app, this would delete from the database
    console.log('Delete goal:', id);
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'id'> | Partial<Goal>) => {
    try {
      setFormLoading(true);
      // In a real app, this would save to the database
      console.log('Save goal:', goalData);
      setShowForm(false);
      setEditingGoal(null);
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track your objectives and measure progress towards success
            </p>
          </div>
          <button 
            onClick={handleNewGoal}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalStats.completed}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalStats.inProgress}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalStats.notStarted}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalStats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(goal.priority)}
                      <span className="text-xs text-gray-600 dark:text-gray-400">{goal.priority}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Milestones</h4>
                <div className="space-y-1">
                  {goal.milestones.slice(0, 3).map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index < Math.floor(goal.progress / 25) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{milestone}</span>
                    </div>
                  ))}
                  {goal.milestones.length > 3 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">+{goal.milestones.length - 3} more</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{goal.dueDate}</span>
                </div>
                <button 
                  onClick={() => handleViewDetails(goal)}
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Goal Details Modal */}
      {selectedGoal && (
        <GoalDetails
          goal={selectedGoal}
          onClose={handleCloseDetails}
          onEdit={handleEditGoal}
          onDelete={handleDeleteGoal}
        />
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <GoalForm
          goal={editingGoal ?? undefined}
          onSave={handleSaveGoal}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      )}
    </>
  );
};

export default Goals;