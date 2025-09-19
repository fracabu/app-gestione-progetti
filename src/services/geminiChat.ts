// Enhanced Gemini service with Firebase data access for intelligent project assistance
import { geminiService } from './gemini';
import { Project, Task } from '../data/projects';
import { notificationService } from './notifications';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  projectContext?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

class GeminiChatService {
  private chatSessions: ChatSession[] = [];
  private currentSessionId: string | null = null;

  constructor() {
    this.loadChatHistory();
  }

  private loadChatHistory() {
    const stored = localStorage.getItem('gemini_chat_sessions');
    if (stored) {
      this.chatSessions = JSON.parse(stored).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  }

  private saveChatHistory() {
    localStorage.setItem('gemini_chat_sessions', JSON.stringify(this.chatSessions));
  }

  createNewSession(title: string = 'Nuova chat', projectId?: string): string {
    const sessionId = `session_${Date.now()}`;
    const session: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId
    };

    this.chatSessions.unshift(session);
    this.currentSessionId = sessionId;
    this.saveChatHistory();
    return sessionId;
  }

  getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) return null;
    return this.chatSessions.find(s => s.id === this.currentSessionId) || null;
  }

  setCurrentSession(sessionId: string) {
    this.currentSessionId = sessionId;
  }

  getChatSessions(): ChatSession[] {
    return this.chatSessions;
  }

  deleteSession(sessionId: string) {
    this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId);
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
    this.saveChatHistory();
  }

  async sendMessage(
    message: string,
    projects: Project[],
    projectContext?: string
  ): Promise<string> {
    if (!geminiService.isConfigured()) {
      throw new Error('Gemini API non configurata');
    }

    if (!this.currentSessionId) {
      this.createNewSession();
    }

    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Sessione di chat non trovata');
    }

    // Check if user is requesting daily notifications
    if (this.isNotificationRequest(message)) {
      return await this.handleNotificationRequest(message, projects);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      projectContext
    };

    session.messages.push(userMessage);

    try {
      // Build context-aware prompt
      const contextPrompt = this.buildContextPrompt(message, projects, projectContext, session.messages);

      // Get response from Gemini
      const response = await this.callGeminiAPI(contextPrompt);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      // Update session title if it's the first exchange
      if (session.messages.length === 2) {
        session.title = this.generateSessionTitle(message);
      }

      this.saveChatHistory();
      return response;

    } catch (error) {
      // Remove the user message if the request failed
      session.messages.pop();
      throw error;
    }
  }

  private buildContextPrompt(
    userMessage: string,
    projects: Project[],
    projectContext?: string,
    chatHistory: ChatMessage[] = []
  ): string {
    let prompt = `Sei un assistente AI esperto in project management e sviluppo software. Hai accesso completo ai dati del database Firebase dell'utente.

CONTESTO DATABASE:
${this.formatProjectsData(projects, projectContext)}

CRONOLOGIA CHAT RECENTE:
${this.formatChatHistory(chatHistory.slice(-6))}

RICHIESTA UTENTE:
${userMessage}

ISTRUZIONI:
- Rispondi in italiano in modo professionale e utile
- Usa i dati del database per fornire informazioni precise e contestuali
- Se l'utente chiede di creare, modificare o gestire progetti/task, fornisci suggerimenti specifici
- Puoi analizzare progressi, scadenze, priorità e suggerire ottimizzazioni
- Per domande tecniche, considera le tecnologie usate nei progetti
- Mantieni le risposte concise ma complete
- Se necessario, suggerisci azioni concrete che l'utente può intraprendere

RISPOSTA:`;

    return prompt;
  }

  private formatProjectsData(projects: Project[], focusProjectId?: string): string {
    if (projects.length === 0) {
      return "Nessun progetto presente nel database.";
    }

    let data = `PROGETTI TOTALI: ${projects.length}\n\n`;

    // If focusing on a specific project, show it first and in detail
    if (focusProjectId) {
      const focusProject = projects.find(p => p.id === focusProjectId);
      if (focusProject) {
        data += `PROGETTO IN FOCUS:\n${this.formatProjectDetail(focusProject)}\n\n`;
        data += `ALTRI PROGETTI:\n`;
        projects.filter(p => p.id !== focusProjectId).forEach(project => {
          data += `- ${project.name} (${project.status}, ${project.priority})\n`;
        });
      }
    } else {
      // Show all projects with basic info
      projects.forEach(project => {
        data += `- ${project.name}\n`;
        data += `  Status: ${project.status}, Priorità: ${project.priority}, Progresso: ${project.progress}%\n`;
        data += `  Tasks: ${project.tasks?.length || 0}, Scadenza: ${project.dueDate || 'Non definita'}\n`;
        data += `  Tecnologie: ${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || 'Non specificate'}\n\n`;
      });
    }

    return data;
  }

  private formatProjectDetail(project: Project): string {
    let detail = `Nome: ${project.name}\n`;
    detail += `Descrizione: ${project.description}\n`;
    detail += `Status: ${project.status}, Priorità: ${project.priority}, Progresso: ${project.progress}%\n`;
    detail += `Categoria: ${project.category}, Scadenza: ${project.dueDate || 'Non definita'}\n`;
    detail += `Tecnologie: ${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || 'Non specificate'}\n`;

    if (project.repository) {
      detail += `Repository: ${project.repository}\n`;
    }
    if (project.deployUrl) {
      detail += `Deploy URL: ${project.deployUrl}\n`;
    }

    if (project.tasks && project.tasks.length > 0) {
      detail += `\nTASKS (${project.tasks.length}):\n`;
      project.tasks.forEach((task, index) => {
        detail += `${index + 1}. ${task.title} (${task.status}, ${task.priority})\n`;
        if (task.description) {
          detail += `   Descrizione: ${task.description}\n`;
        }
        if (task.assignee) {
          detail += `   Assegnato a: ${task.assignee}\n`;
        }
        if (task.dueDate) {
          detail += `   Scadenza: ${task.dueDate}\n`;
        }
      });
    }

    if (project.notes && project.notes.length > 0) {
      detail += `\nNOTE:\n`;
      project.notes.forEach((note, index) => {
        detail += `${index + 1}. ${note}\n`;
      });
    }

    return detail;
  }

  private formatChatHistory(messages: ChatMessage[]): string {
    if (messages.length === 0) {
      return "Nessuna cronologia chat.";
    }

    return messages.map(msg =>
      `${msg.role === 'user' ? 'UTENTE' : 'ASSISTENTE'}: ${msg.content}`
    ).join('\n\n');
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
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
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Errore API Gemini: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Nessuna risposta generata da Gemini');
    }

    return generatedText;
  }

  private generateSessionTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }

  private isNotificationRequest(message: string): boolean {
    const notificationKeywords = [
      'notifica giornaliera',
      'analisi giornaliera',
      'notifica',
      'reminder',
      'riassunto giornaliero',
      'briefing',
      'cosa fare oggi',
      'priorità oggi',
      'agenda oggi',
      'programma la notifica',
      'notifiche automatiche'
    ];

    const lowerMessage = message.toLowerCase();
    return notificationKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async handleNotificationRequest(message: string, projects: Project[]): Promise<string> {
    try {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('programma') || lowerMessage.includes('automatiche')) {
        // User wants to schedule automatic notifications
        const isEnabled = this.enableDailyNotifications();
        return `✅ **Notifiche automatiche attivate!**

🕘 **Orario**: Ogni giorno alle 8:00 del mattino
📊 **Contenuto**: Analisi AI dei tuoi progetti con:
- Priorità del giorno
- Task urgenti e scadenze
- Suggerimenti strategici
- Score di produttività

Le notifiche appariranno nella sezione Notifiche. Puoi sempre richiederne una manualmente scrivendo "notifica giornaliera" in chat.`;
      } else {
        // Generate immediate notification
        await notificationService.forceGenerateInsights(projects);
        return `🌅 **Notifica giornaliera generata!**

Ho creato una nuova analisi AI dei tuoi progetti. Puoi trovarla nella sezione **Notifiche** nella sidebar.

L'analisi include:
- ✅ Progetti prioritari per oggi
- ⏰ Scadenze imminenti
- 💡 Suggerimenti strategici
- 📈 Raccomandazioni sui task

Vuoi che programmi notifiche automatiche ogni mattina alle 8:00? Scrivi "programma notifiche automatiche".`;
      }
    } catch (error) {
      console.error('Error handling notification request:', error);
      return `❌ **Errore nella generazione delle notifiche**

Assicurati che la chiave API Gemini sia configurata correttamente nelle impostazioni.

Puoi comunque:
- Generare notifiche manualmente dalla sezione Notifiche
- Configurare la chiave API nelle Impostazioni
- Riprovare con "notifica giornaliera"`;
    }
  }

  private enableDailyNotifications(): boolean {
    localStorage.setItem('dailyNotificationsEnabled', 'true');
    localStorage.setItem('dailyNotificationTime', '08:00');
    return true;
  }

  clearCurrentSession() {
    const session = this.getCurrentSession();
    if (session) {
      session.messages = [];
      session.updatedAt = new Date();
      this.saveChatHistory();
    }
  }

  exportChatHistory(): string {
    return JSON.stringify(this.chatSessions, null, 2);
  }

  async testApiKey(): Promise<boolean> {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      return false;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Ciao'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
          }
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  importChatHistory(jsonData: string): boolean {
    try {
      const sessions = JSON.parse(jsonData);
      this.chatSessions = sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      this.saveChatHistory();
      return true;
    } catch (error) {
      console.error('Errore nell\'importazione:', error);
      return false;
    }
  }
}

export const geminiChatService = new GeminiChatService();

// Predefined intelligent prompts for common project management tasks
export const intelligentPrompts = {
  projectAnalysis: 'Analizza lo stato attuale dei miei progetti e dimmi su cosa dovrei concentrarmi',
  taskPrioritization: 'Aiutami a prioritizzare i task in base alle scadenze e all\'importanza',
  progressReport: 'Genera un report di progresso dettagliato per tutti i progetti',
  blockers: 'Identifica potenziali blocchi o problemi nei miei progetti',
  suggestions: 'Suggerisci miglioramenti per l\'organizzazione e la produttività',
  timeline: 'Aiutami a creare una timeline realistica per i progetti in corso',
  resources: 'Suggerisci risorse o tecnologie che potrebbero aiutare nei progetti',
  collaboration: 'Come posso migliorare la collaborazione del team su questi progetti?'
};

export const projectSpecificPrompts = {
  technical: 'Analizza gli aspetti tecnici di questo progetto e suggerisci best practices',
  architecture: 'Rivedi l\'architettura del progetto e suggerisci miglioramenti',
  testing: 'Suggerisci una strategia di testing per questo progetto',
  deployment: 'Aiutami a pianificare il deployment di questo progetto',
  documentation: 'Che documentazione dovrei creare per questo progetto?',
  performance: 'Come posso ottimizzare le performance di questo progetto?',
  security: 'Analizza gli aspetti di sicurezza e suggerisci miglioramenti',
  maintenance: 'Aiutami a pianificare la manutenzione a lungo termine'
};