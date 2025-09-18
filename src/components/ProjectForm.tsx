import React, { useState } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Project, Task } from '../data/projects';

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Omit<Project, 'id'> | Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  focusTaskId?: string | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
  isLoading = false,
  focusTaskId = null
}) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Planning',
    priority: project?.priority || 'Medium',
    progress: project?.progress || 0,
    dueDate: project?.dueDate || '',
    category: project?.category || 'Web App',
    technologies: project?.technologies?.join(', ') || '',
    repository: project?.repository || '',
    deployUrl: project?.deployUrl || ''
  });

  const [tasks, setTasks] = useState<Task[]>(project?.tasks || []);
  const [notes, setNotes] = useState<string[]>(project?.notes || []);
  const [newNote, setNewNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(Boolean),
      tasks,
      notes
    };

    await onSave(projectData);
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
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      assignee: '',
      dueDate: '',
      tags: []
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project ? 'Modifica Progetto' : 'Nuovo Progetto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informazioni Base */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informazioni Base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Progetto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Development">In Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Deployed">Deployed</option>
                  <option value="Maintenance">Maintenance</option>
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
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
                  Scadenza
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrizione
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tecnologie (separate da virgola)
              </label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                placeholder="React, Node.js, TypeScript"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository URL
                </label>
                <input
                  type="url"
                  name="repository"
                  value={formData.repository}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deploy URL
                </label>
                <input
                  type="url"
                  name="deployUrl"
                  value={formData.deployUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Step di Sviluppo</h3>
              <button
                type="button"
                onClick={addTask}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Step</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="text"
                      placeholder="Titolo del task"
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="ml-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <textarea
                    placeholder="Descrizione del task"
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                    
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(index, 'priority', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Assegnato a"
                      value={task.assignee}
                      onChange={(e) => updateTask(index, 'assignee', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Note</h3>
            <div className="space-y-3">
              {notes.map((note, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {note}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Aggiungi una nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{project ? 'Aggiorna Progetto' : 'Crea Progetto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;