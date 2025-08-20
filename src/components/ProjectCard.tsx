import React from 'react';
import { 
  GitBranch, 
  ExternalLink,
  Code2,
  Globe,
  Server,
  Smartphone,
  Edit,
  Trash2
} from 'lucide-react';
import { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const getProjectIcon = (category: string) => {
    switch (category) {
      case 'Web App':
        return <Globe className="w-8 h-8 text-blue-400" />;
      case 'Landing Page':
        return <Smartphone className="w-8 h-8 text-green-400" />;
      case 'Platform':
        return <Server className="w-8 h-8 text-purple-400" />;
      case 'Tool':
        return <Code2 className="w-8 h-8 text-orange-400" />;
      default:
        return <Code2 className="w-8 h-8 text-gray-400" />;
    }
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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 group">
      {/* Header with Icon, Title and Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getProjectIcon(project.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>

      {/* Technologies Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.technologies.slice(0, 3).map((tech, index) => (
          <span 
            key={index}
            className="inline-block px-2 py-1 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="inline-block px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            +{project.technologies.length - 3}
          </span>
        )}
      </div>

      {/* Footer with Links and Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Links */}
        <div className="flex items-center space-x-3">
          {project.repository && (
            <button 
              onClick={() => window.open(project.repository, '_blank')}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              title="View Repository"
            >
              <GitBranch className="h-4 w-4" />
              <span>Repository</span>
            </button>
          )}
          {project.deployUrl && (
            <button 
              onClick={() => window.open(project.deployUrl, '_blank')}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              title="View Live Site"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Deploy</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Edit Project"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;