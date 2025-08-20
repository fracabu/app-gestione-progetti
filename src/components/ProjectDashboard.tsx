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
import ProjectCard from './ProjectCard';
import ProjectStats from './ProjectStats';
import ProjectForm from './ProjectForm';
import { Project } from '../data/projects';
import { migrateProjectsToFirebase } from '../utils/migrateData';

const ProjectDashboard = () => {
  const { projects, loading, error, addProject, updateProject, deleteProject } = useProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'Planning', label: 'Planning' },
    { value: 'In Development', label: 'In Development' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Deployed', label: 'Deployed' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  const handleAddProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto?')) {
      await deleteProject(id);
    }
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id'> | Partial<Project>) => {
    try {
      setFormLoading(true);
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await addProject(projectData as Omit<Project, 'id'>);
      }
      setShowForm(false);
      setEditingProject(null);
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleMigration = async () => {
    if (window.confirm('Vuoi caricare i progetti di esempio nel database Firebase? Questa operazione aggiungerà i progetti predefiniti.')) {
      try {
        setMigrating(true);
        await migrateProjectsToFirebase();
        alert('Migrazione completata! I progetti sono stati caricati in Firebase.');
      } catch (error) {
        console.error('Errore durante la migrazione:', error);
        alert('Errore durante la migrazione. Controlla la console per i dettagli.');
      } finally {
        setMigrating(false);
      }
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
    <>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage and track your development projects
              </p>
            </div>
            <button 
              onClick={handleAddProject}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
            {projects.length === 0 && (
              <button 
                onClick={handleMigration}
                disabled={migrating}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {migrating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Caricamento...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Carica Progetti di Esempio</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 flex-shrink-0">
          <ProjectStats projects={projects} />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left Section - Search and Filter */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Section - View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first project.'
                }
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6'
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

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject ?? undefined}
          onSave={handleSaveProject}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      )}
    </>
  );
};

export default ProjectDashboard;