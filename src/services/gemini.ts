// Gemini AI integration for project generation
interface ProjectGenerationRequest {
  projectName: string;
  projectDescription?: string;
  category: 'Web App' | 'Landing Page' | 'Platform' | 'Tool';
  technologies?: string[];
}

interface GeneratedProject {
  description: string;
  tasks: Array<{
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    estimatedDays: number;
  }>;
  suggestedTechnologies: string[];
  estimatedDuration: string;
  complexity: 'Low' | 'Medium' | 'High';
}

class GeminiService {
  private apiKey: string | null = null;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    // Try to get API key from environment variables first, then localStorage
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateProject(request: ProjectGenerationRequest): Promise<GeneratedProject> {
    if (!this.apiKey) {
      throw new Error('Gemini API key non configurata. Vai nelle impostazioni per configurarla.');
    }

    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
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
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
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

      return this.parseGeneratedProject(generatedText);
    } catch (error) {
      console.error('Errore nella generazione del progetto:', error);
      throw error;
    }
  }

  private buildPrompt(request: ProjectGenerationRequest): string {
    return `
Come esperto di project management e sviluppo software, genera un piano dettagliato per il seguente progetto:

INFORMAZIONI PROGETTO:
- Nome: ${request.projectName}
- Categoria: ${request.category}
${request.projectDescription ? `- Descrizione iniziale: ${request.projectDescription}` : ''}
${request.technologies?.length ? `- Tecnologie preferite: ${request.technologies.join(', ')}` : ''}

RICHIESTA:
Crea un progetto completo con:
1. Una descrizione dettagliata e professionale del progetto (2-3 frasi)
2. Una lista di 6-10 task di sviluppo specifici e realistici
3. Tecnologie consigliate per il progetto
4. Stima della durata complessiva
5. Livello di complessità

FORMATO RISPOSTA (JSON):
{
  "description": "Descrizione dettagliata del progetto...",
  "tasks": [
    {
      "title": "Titolo task",
      "description": "Descrizione dettagliata del task",
      "priority": "High|Medium|Low",
      "estimatedDays": numero_giorni
    }
  ],
  "suggestedTechnologies": ["React", "Node.js", "..."],
  "estimatedDuration": "X settimane",
  "complexity": "High|Medium|Low"
}

Rispondi SOLO con il JSON valido, senza markdown o testo aggiuntivo.
`;
  }

  private parseGeneratedProject(generatedText: string): GeneratedProject {
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato JSON non trovato nella risposta');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate the structure
      if (!parsed.description || !parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Struttura JSON non valida');
      }

      return {
        description: parsed.description,
        tasks: parsed.tasks.map((task: any) => ({
          title: task.title || 'Task senza titolo',
          description: task.description || '',
          priority: ['Low', 'Medium', 'High'].includes(task.priority) ? task.priority : 'Medium',
          estimatedDays: typeof task.estimatedDays === 'number' ? task.estimatedDays : 1
        })),
        suggestedTechnologies: Array.isArray(parsed.suggestedTechnologies) ? parsed.suggestedTechnologies : [],
        estimatedDuration: parsed.estimatedDuration || 'Non specificato',
        complexity: ['Low', 'Medium', 'High'].includes(parsed.complexity) ? parsed.complexity : 'Medium'
      };
    } catch (error) {
      console.error('Errore nel parsing della risposta Gemini:', error);
      throw new Error('Errore nel parsing della risposta AI. Riprova.');
    }
  }
}

export const geminiService = new GeminiService();
export type { ProjectGenerationRequest, GeneratedProject };