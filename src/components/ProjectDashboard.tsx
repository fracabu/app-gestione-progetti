import React, { useState } from 'react';
import { 
  Plus, 
  Grid3X3,
  List,
  BarChart3,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useNavigation } from '../contexts/NavigationContext';
import ProjectCard from './ProjectCard';
import ProjectStats from './ProjectStats';
import { Project } from '../data/projects';

const ProjectDashboard = () => {
  const { projects, loading, error, deleteProject } = useProjects();
  const { setActiveSection, setEditingProjectId, viewMode } = useNavigation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'Tutti i Progetti' },
    { value: 'Planning', label: 'Pianificazione' },
    { value: 'In Development', label: 'In Sviluppo' },
    { value: 'Testing', label: 'Test' },
    { value: 'Deployed', label: 'Pubblicato' },
    { value: 'Maintenance', label: 'Manutenzione' }
  ];

  const handleAddProject = () => {
    setEditingProjectId(null);
    setActiveSection('project-editor');
  };

  const handleEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setActiveSection('project-editor');
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto?')) {
      await deleteProject(id);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento progetti...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Progetti</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestisci e monitora i tuoi progetti di sviluppo
              </p>
            </div>
            <button
              onClick={handleAddProject}
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuovo Progetto</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 md:px-6 py-4 flex-shrink-0">
          <ProjectStats projects={projects} />
        </div>

        {/* Controls */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Section - Search and Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cerca progetti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 lg:w-80 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white w-full sm:w-auto"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Projects Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nessun progetto trovato</h3>
              <p className="text-gray-600 dark:text-gray-400 px-4 text-center">
                {searchTerm || filterStatus !== 'all'
                  ? 'Prova a modificare i criteri di ricerca o filtro.'
                  : 'Inizia creando il tuo primo progetto.'
                }
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-6'
                : 'space-y-4'
            }>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default ProjectDashboard;