export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Development' | 'Testing' | 'Deployed' | 'Maintenance';
  priority: 'Low' | 'Medium' | 'High';
  progress: number;
  dueDate: string;
  category: 'Web App' | 'Landing Page' | 'Platform' | 'Tool';
  technologies: string[];
  repository?: string;
  deployUrl?: string;
  tasks: Task[];
  notes: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  dueDate: string;
  tags: string[];
}

