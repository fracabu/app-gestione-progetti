// Intelligent Notifications Service with Gemini AI
import { Project, Task } from '../data/projects';

export interface Notification {
  id: string;
  type: 'daily_insight' | 'deadline_reminder' | 'project_suggestion' | 'urgent_task' | 'milestone';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  projectId?: string;
  taskId?: string;
  actionUrl?: string;
  aiGenerated: boolean;
}

export interface DailyInsight {
  overview: string;
  priorityProjects: Array<{
    projectId: string;
    reason: string;
    urgency: number;
  }>;
  recommendedTasks: Array<{
    projectId: string;
    taskId: string;
    reason: string;
  }>;
  alerts: Array<{
    type: 'deadline' | 'overdue' | 'blocked';
    message: string;
    projectId?: string;
    taskId?: string;
  }>;
  suggestions: string[];
  productivity_score: number;
}

class NotificationService {
  private notifications: Notification[] = [];
  private lastDailyInsight: Date | null = null;

  constructor() {
    this.loadNotifications();
    this.initializeBackgroundChecks();
  }

  private loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      this.notifications = JSON.parse(stored).map((notif: any) => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      }));
    }

    const lastInsight = localStorage.getItem('lastDailyInsight');
    if (lastInsight) {
      this.lastDailyInsight = new Date(lastInsight);
    }
  }

  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    if (this.lastDailyInsight) {
      localStorage.setItem('lastDailyInsight', this.lastDailyInsight.toISOString());
    }
  }

  private initializeBackgroundChecks() {
    // Check for new insights every 30 minutes
    setInterval(() => {
      this.checkForDailyInsights();
    }, 30 * 60 * 1000);

    // Schedule daily notifications at 8:00 AM
    this.scheduleDailyNotifications();

    // Initial check
    setTimeout(() => {
      this.checkForDailyInsights();
    }, 5000);
  }

  private scheduleDailyNotifications() {
    const checkTime = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(8, 0, 0, 0); // 8:00 AM

      // If it's past 8 AM today, schedule for tomorrow
      if (now >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeUntilTarget = targetTime.getTime() - now.getTime();

      setTimeout(() => {
        // Check if daily notifications are enabled
        const isEnabled = localStorage.getItem('dailyNotificationsEnabled') === 'true';
        if (isEnabled) {
          this.checkForDailyInsights();
        }

        // Schedule next day
        this.scheduleDailyNotifications();
      }, timeUntilTarget);
    };

    checkTime();
  }

  private async checkForDailyInsights() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if we need to generate daily insights (once per day, preferably in the morning)
    const shouldGenerate = !this.lastDailyInsight ||
                          this.lastDailyInsight < today ||
                          (now.getHours() >= 8 && this.lastDailyInsight.getDate() !== now.getDate());

    if (shouldGenerate) {
      try {
        // Get projects from storage or API
        const projectsData = localStorage.getItem('projects');
        if (projectsData) {
          const projects = JSON.parse(projectsData);
          await this.generateDailyInsights(projects);
          this.lastDailyInsight = now;
          this.saveNotifications();
        }
      } catch (error) {
        console.error('Error generating daily insights:', error);
      }
    }
  }

  async generateDailyInsights(projects: Project[]): Promise<void> {
    if (!this.isGeminiConfigured()) {
      console.log('Gemini not configured, skipping daily insights');
      return;
    }

    try {
      const analysisPrompt = this.buildDailyAnalysisPrompt(projects);
      const insights = await this.callGeminiForInsights(analysisPrompt);

      // Create notification for daily insights
      const notification: Notification = {
        id: `daily_${Date.now()}`,
        type: 'daily_insight',
        title: '🌅 Analisi Giornaliera dei Tuoi Progetti',
        message: insights.overview,
        priority: 'medium',
        timestamp: new Date(),
        read: false,
        aiGenerated: true
      };

      this.addNotification(notification);

      // Generate specific alerts based on analysis
      await this.generateSpecificAlerts(projects, insights);

    } catch (error) {
      console.error('Error generating daily insights:', error);
    }
  }

  private buildDailyAnalysisPrompt(projects: Project[]): string {
    const today = new Date();
    const urgentTasks = this.getUrgentTasks(projects);
    const overdueTasks = this.getOverdueTasks(projects);

    return `Analizza i seguenti progetti e fornisci un'analisi giornaliera strategica per oggi (${today.toLocaleDateString('it-IT')}):

PROGETTI:
${projects.map(p => `
- ${p.name} (${p.status}, Priorità: ${p.priority}, Progresso: ${p.progress}%)
  Descrizione: ${p.description}
  Scadenza: ${p.dueDate || 'Non definita'}
  Task attivi: ${p.tasks?.filter(t => t.status !== 'Done').length || 0}
  Task completati: ${p.tasks?.filter(t => t.status === 'Done').length || 0}
`).join('')}

TASK URGENTI (scadenza entro 3 giorni):
${urgentTasks.map(t => `- ${t.title} (${t.projectName}) - Scadenza: ${t.dueDate}`).join('\n')}

TASK IN RITARDO:
${overdueTasks.map(t => `- ${t.title} (${t.projectName}) - Scaduto il: ${t.dueDate}`).join('\n')}

RICHIESTA:
Fornisci un'analisi strategica giornaliera in formato JSON con questa struttura:
{
  "overview": "Analisi generale della situazione attuale (2-3 frasi)",
  "priorityProjects": [
    {
      "projectId": "id_progetto",
      "reason": "Motivo per cui questo progetto è prioritario oggi",
      "urgency": numero_da_1_a_10
    }
  ],
  "recommendedTasks": [
    {
      "projectId": "id_progetto",
      "taskId": "id_task",
      "reason": "Perché questo task dovrebbe essere fatto oggi"
    }
  ],
  "alerts": [
    {
      "type": "deadline|overdue|blocked",
      "message": "Messaggio di avviso",
      "projectId": "id_progetto_se_applicabile"
    }
  ],
  "suggestions": [
    "Suggerimento pratico per migliorare la produttività",
    "Consiglio strategico per il progresso dei progetti"
  ],
  "productivity_score": numero_da_1_a_100
}

Concentrati su:
1. Priorità basate su scadenze e importanza
2. Suggerimenti concreti e attuabili
3. Identificazione di potenziali blocchi
4. Opportunità di ottimizzazione

Rispondi SOLO con il JSON valido.`;
  }

  private async callGeminiForInsights(prompt: string): Promise<DailyInsight> {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('API Key Gemini non configurata');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Errore API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Nessuna risposta generata da Gemini');
    }

    return this.parseInsightsResponse(generatedText);
  }

  private parseInsightsResponse(text: string): DailyInsight {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON non trovato nella risposta');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        overview: parsed.overview || 'Analisi giornaliera dei progetti',
        priorityProjects: parsed.priorityProjects || [],
        recommendedTasks: parsed.recommendedTasks || [],
        alerts: parsed.alerts || [],
        suggestions: parsed.suggestions || [],
        productivity_score: parsed.productivity_score || 75
      };
    } catch (error) {
      console.error('Error parsing insights:', error);
      return {
        overview: 'Analisi giornaliera disponibile - controlla i tuoi progetti per le priorità di oggi.',
        priorityProjects: [],
        recommendedTasks: [],
        alerts: [],
        suggestions: ['Rivedi le scadenze dei progetti', 'Aggiorna il progresso dei task'],
        productivity_score: 75
      };
    }
  }

  private async generateSpecificAlerts(projects: Project[], insights: DailyInsight) {
    // Generate deadline reminders
    insights.alerts.forEach(alert => {
      const notification: Notification = {
        id: `alert_${Date.now()}_${Math.random()}`,
        type: alert.type === 'deadline' ? 'deadline_reminder' : 'urgent_task',
        title: alert.type === 'deadline' ? '⏰ Scadenza Imminente' : '🚨 Attenzione Richiesta',
        message: alert.message,
        priority: alert.type === 'overdue' ? 'urgent' : 'high',
        timestamp: new Date(),
        read: false,
        projectId: alert.projectId,
        aiGenerated: true
      };

      this.addNotification(notification);
    });

    // Generate project suggestions
    if (insights.priorityProjects.length > 0) {
      const topProject = insights.priorityProjects[0];
      const notification: Notification = {
        id: `suggestion_${Date.now()}`,
        type: 'project_suggestion',
        title: '💡 Progetto Prioritario Oggi',
        message: topProject.reason,
        priority: topProject.urgency > 7 ? 'high' : 'medium',
        timestamp: new Date(),
        read: false,
        projectId: topProject.projectId,
        aiGenerated: true
      };

      this.addNotification(notification);
    }
  }

  private getUrgentTasks(projects: Project[]) {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const urgentTasks: any[] = [];

    projects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          if (task.dueDate && task.status !== 'Done') {
            const dueDate = new Date(task.dueDate);
            if (dueDate <= threeDaysFromNow && dueDate >= today) {
              urgentTasks.push({
                ...task,
                projectName: project.name,
                projectId: project.id
              });
            }
          }
        });
      }
    });

    return urgentTasks;
  }

  private getOverdueTasks(projects: Project[]) {
    const today = new Date();
    const overdueTasks: any[] = [];

    projects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          if (task.dueDate && task.status !== 'Done') {
            const dueDate = new Date(task.dueDate);
            if (dueDate < today) {
              overdueTasks.push({
                ...task,
                projectName: project.name,
                projectId: project.id
              });
            }
          }
        });
      }
    });

    return overdueTasks;
  }

  private isGeminiConfigured(): boolean {
    return !!localStorage.getItem('gemini_api_key');
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.saveNotifications();
    // Notify UI components about the update
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearOldNotifications(daysOld: number = 7) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => n.timestamp > cutoffDate);
    this.saveNotifications();
  }

  // Force generate insights for testing
  async forceGenerateInsights(projects: Project[]) {
    await this.generateDailyInsights(projects);
  }
}

export const notificationService = new NotificationService();