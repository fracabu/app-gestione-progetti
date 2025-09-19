import React, { useState, useEffect } from 'react';
import {
  Plus,
  Grid3X3,
  List,
  BarChart3,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useNavigation } from '../contexts/NavigationContext';
import ProjectCard from './ProjectCard';
import ProjectStats from './ProjectStats';
import { Project } from '../data/projects';

const ProjectDashboard = () => {
  const { projects, loading, error, deleteProject, updateProject } = useProjects();
  const { setActiveSection, setEditingProjectId, viewMode } = useNavigation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);

  // Sync local projects with the projects from the hook
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  // Cleanup auto-scroll interval on unmount
  useEffect(() => {
    return () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };
  }, [autoScrollInterval]);

  const filteredProjects = localProjects.filter(project => {
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

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProject(null);
    setDraggedOverIndex(null);

    // Stop auto-scroll
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);

    // Auto-scroll functionality
    const scrollContainer = document.querySelector('.mobile-flex-content') as HTMLElement;
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollThreshold = 60; // pixels from edge to trigger scroll
    const scrollSpeed = 10; // pixels per scroll step

    const mouseY = e.clientY;
    const topEdge = containerRect.top;
    const bottomEdge = containerRect.bottom;

    // Clear existing interval if any
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }

    // Check if mouse is near top edge
    if (mouseY - topEdge < scrollThreshold && scrollContainer.scrollTop > 0) {
      const interval = setInterval(() => {
        const newScrollTop = scrollContainer.scrollTop - scrollSpeed;
        if (newScrollTop <= 0) {
          scrollContainer.scrollTop = 0;
          clearInterval(interval);
          setAutoScrollInterval(null);
        } else {
          scrollContainer.scrollTop = newScrollTop;
        }
      }, 16); // ~60fps
      setAutoScrollInterval(interval);
    }
    // Check if mouse is near bottom edge
    else if (bottomEdge - mouseY < scrollThreshold &&
             scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight) {
      const interval = setInterval(() => {
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const newScrollTop = scrollContainer.scrollTop + scrollSpeed;
        if (newScrollTop >= maxScroll) {
          scrollContainer.scrollTop = maxScroll;
          clearInterval(interval);
          setAutoScrollInterval(null);
        } else {
          scrollContainer.scrollTop = newScrollTop;
        }
      }, 16); // ~60fps
      setAutoScrollInterval(interval);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);

    // Stop auto-scroll when leaving drag area
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    // Stop auto-scroll immediately on drop
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }

    if (!draggedProject) return;

    const currentIndex = filteredProjects.findIndex(p => p.id === draggedProject.id);
    if (currentIndex === dropIndex) return;

    // Create a new array with reordered projects
    const newFilteredProjects = [...filteredProjects];
    const [removed] = newFilteredProjects.splice(currentIndex, 1);
    newFilteredProjects.splice(dropIndex, 0, removed);

    // Update the order in all projects (not just filtered)
    const newAllProjects = [...localProjects];

    // Remove the dragged project from its current position
    const originalIndex = newAllProjects.findIndex(p => p.id === draggedProject.id);
    newAllProjects.splice(originalIndex, 1);

    // Find the new position in the full array based on the filtered array
    let insertIndex = 0;
    if (dropIndex > 0 && dropIndex < newFilteredProjects.length) {
      const projectBefore = newFilteredProjects[dropIndex - 1];
      insertIndex = newAllProjects.findIndex(p => p.id === projectBefore.id) + 1;
    } else if (dropIndex === 0 && newFilteredProjects.length > 1) {
      const projectAfter = newFilteredProjects[1];
      insertIndex = newAllProjects.findIndex(p => p.id === projectAfter.id);
    }

    // Insert at the new position
    newAllProjects.splice(insertIndex, 0, draggedProject);

    setLocalProjects(newAllProjects);
    setDraggedProject(null);
    setDraggedOverIndex(null);
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
    <div className="flex-1 flex flex-col mobile-flex-container h-full">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Progetti</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {draggedProject
                  ? '🔄 Trascina per riordinare i progetti'
                  : 'Gestisci e monitora i tuoi progetti di sviluppo'
                }
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

        {/* Stats - Collapsible */}
        <div className="px-4 md:px-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg px-2"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Statistiche Progetti
              </span>
            </div>
            {showStats ? (
              <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          {showStats && (
            <div className="pb-4">
              <ProjectStats projects={projects} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cerca progetti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white w-full sm:w-auto min-w-0 sm:min-w-48"
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
        <div className="flex-1 overflow-y-auto webkit-overflow-scrolling-touch mobile-flex-content">
          <div className="p-4 md:p-6 pb-16 lg:pb-6">
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
                  ? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6'
                  : 'space-y-4'
              }>
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`transition-all duration-200 cursor-move ${
                      draggedOverIndex === index
                        ? 'transform scale-105 ring-2 ring-blue-400 ring-opacity-50'
                        : ''
                    } ${
                      draggedProject?.id === project.id
                        ? 'opacity-50 transform rotate-2'
                        : ''
                    }`}
                  >
                    <ProjectCard
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProjectDashboard;