import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Project } from '../data/projects';

interface ProjectStatsProps {
  projects: Project[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ projects }) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Development').length;
  const completedProjects = projects.filter(p => p.status === 'Deployed').length;
  const overdue = projects.filter(p => {
    const dueDate = new Date(p.dueDate);
    const today = new Date();
    return dueDate < today && p.status !== 'Deployed';
  }).length;

  const averageProgress = Math.round(
    projects.reduce((sum, project) => sum + project.progress, 0) / totalProjects
  );

  const stats = [
    {
      title: 'Progetti Totali',
      value: totalProjects,
      icon: BarChart3,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Attivi',
      value: activeProjects,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Completati',
      value: completedProjects,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'In Ritardo',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      title: 'Progresso Medio',
      value: `${averageProgress}%`,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.title}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor} flex-shrink-0 ml-2`}>
              <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectStats;