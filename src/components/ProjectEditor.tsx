import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Calendar, User, Flag, Sparkles } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useProjects } from '../hooks/useProjects';
import { Project, Task } from '../data/projects';
import AIProjectWizard from './AIProjectWizard';

const ProjectEditor = () => {
  const { setActiveSection, editingProjectId, setEditingProjectId } = useNavigation();
  const { projects, addProject, updateProject } = useProjects();
  const [loading, setLoading] = useState(false);

  const project = editingProjectId ? projects.find(p => p.id === editingProjectId) : null;
  const isNewProject = !editingProjectId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning' as 'Planning' | 'In Development' | 'Testing' | 'Deployed' | 'Maintenance',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    progress: 0,
    dueDate: '',
    category: 'Web App' as 'Web App' | 'Landing Page' | 'Platform' | 'Tool',
    technologies: '',
    repository: '',
    deployUrl: ''
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [useManualMode, setUseManualMode] = useState(false);

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        progress: project.progress,
        dueDate: project.dueDate,
        category: project.category,
        technologies: project.technologies?.join(', ') || '',
        repository: project.repository || '',
        deployUrl: project.deployUrl || ''
      });
      setTasks(project.tasks || []);
      setNotes(project.notes || []);
    } else {
      // Reset for new project
      setFormData({
        name: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        progress: 0,
        dueDate: '',
        category: 'Web App',
        technologies: '',
        repository: '',
        deployUrl: ''
      });
      setTasks([]);
      setNotes([]);
    }
  }, [project]);

  const handleBack = () => {
    setEditingProjectId(null);
    setActiveSection('projects');
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const projectData = {
        ...formData,
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(Boolean),
        tasks,
        notes
      };

      if (isNewProject) {
        await addProject(projectData);
      } else {
        await updateProject(editingProjectId!, projectData);
      }

      handleBack();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) || 0 : value
    }));
  };

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      assignee: '',
      dueDate: '',
      tags: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (index: number, field: keyof Task, value: string | string[]) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, newNote.trim()]);
      setNewNote('');
    }
  };

  const removeNote = (index: number) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAIProjectGenerated = (generatedProject: any) => {
    setFormData({
      name: generatedProject.name,
      description: generatedProject.description,
      status: generatedProject.status || 'Planning',
      priority: generatedProject.priority || 'Medium',
      progress: generatedProject.progress || 0,
      dueDate: generatedProject.dueDate || '',
      category: generatedProject.category || 'Web App',
      technologies: Array.isArray(generatedProject.technologies) ? generatedProject.technologies.join(', ') : generatedProject.technologies || '',
      repository: generatedProject.repository || '',
      deployUrl: generatedProject.deployUrl || ''
    });
    setTasks(generatedProject.tasks || []);
    setNotes(generatedProject.notes || []);
    setShowAIWizard(false);
    setUseManualMode(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'In Progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Review': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Done': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-orange-600 dark:text-orange-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col mobile-flex-container h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {isNewProject ? 'Crea Nuovo Progetto' : 'Modifica Progetto'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isNewProject ? 'Configura il tuo nuovo progetto con task e dettagli' : 'Aggiorna informazioni progetto e gestisci i task'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
            className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isNewProject ? 'Crea Progetto' : 'Salva Modifiche'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto webkit-overflow-scrolling-touch mobile-flex-content p-4 md:p-6 pb-16 lg:pb-6">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* AI Wizard for New Projects */}
          {isNewProject && !useManualMode && (
            <div className="space-y-4">
              <AIProjectWizard onCreateProject={handleAIProjectGenerated} />
              <div className="text-center">
                <button
                  onClick={() => setUseManualMode(true)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                >
                  Oppure crea manualmente il progetto
                </button>
              </div>
            </div>
          )}

          {/* Manual Form - Show for existing projects or when manual mode is selected */}
          {(!isNewProject || useManualMode) && (
            <>
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">Informazioni Base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Progetto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Inserisci nome progetto"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrizione
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Descrivi il tuo progetto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stato
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Planning">Pianificazione</option>
                  <option value="In Development">In Sviluppo</option>
                  <option value="Testing">Test</option>
                  <option value="Deployed">Pubblicato</option>
                  <option value="Maintenance">Manutenzione</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priorità
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Low">Bassa</option>
                  <option value="Medium">Media</option>
                  <option value="High">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Web App">Web App</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Platform">Platform</option>
                  <option value="Tool">Tool</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Scadenza
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progresso (%)
                </label>
                <input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tecnologie
                </label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="React, Node.js, TypeScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Repository
                </label>
                <input
                  type="url"
                  name="repository"
                  value={formData.repository}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Deploy
                </label>
                <input
                  type="url"
                  name="deployUrl"
                  value={formData.deployUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://myproject.vercel.app"
                />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Development Tasks</h2>
              <button
                onClick={addTask}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            </div>
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assignee
                      </label>
                      <input
                        type="text"
                        value={task.assignee}
                        onChange={(e) => updateTask(index, 'assignee', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Assign to..."
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={task.description}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Describe the task"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, 'priority', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => removeTask(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks added yet. Click "Add Task" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Project Notes</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Aggiungi una nota..."
                />
                <button
                  onClick={addNote}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  Aggiungi
                </button>
              </div>
              <div className="space-y-2">
                {notes.map((note, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">{note}</span>
                    <button
                      onClick={() => removeNote(index)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {notes.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No notes added yet.
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ProjectEditor;