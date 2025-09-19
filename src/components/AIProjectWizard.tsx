import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Loader2, AlertCircle, CheckCircle, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';

interface AIProjectWizardProps {
  onCreateProject: (projectData: any) => void;
}

const AIProjectWizard: React.FC<AIProjectWizardProps> = ({ onCreateProject }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && 'speechSynthesis' in window) {
      setVoiceSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Riconoscimento vocale non supportato in questo browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      // Parse the voice input to extract name and description
      parseVoiceInput(transcript);
    };

    recognition.onerror = (event: any) => {
      setError(`Errore nel riconoscimento vocale: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const parseVoiceInput = (transcript: string) => {
    const text = transcript.toLowerCase().trim();

    // Patterns for project creation commands
    const createPatterns = [
      /(?:crea|creare|fare|fai)\s+(?:un\s+)?(?:progetto|app|applicazione|software|sistema)\s+(?:per|di|che|che\s+sarà)\s+(.+)/i,
      /(?:voglio|vorrei)\s+(?:creare|fare)\s+(?:un\s+)?(?:progetto|app|applicazione)\s+(?:per|di|che)\s+(.+)/i,
      /(?:nuovo\s+)?(?:progetto|app|applicazione)\s+(?:per|di|che|che\s+sarà)\s+(.+)/i
    ];

    let projectDescription = '';
    let projectTitle = '';

    // Try to match creation patterns
    for (const pattern of createPatterns) {
      const match = text.match(pattern);
      if (match) {
        projectDescription = match[1].trim();
        break;
      }
    }

    if (projectDescription) {
      // Generate a clean title and detailed description
      const cleanDesc = projectDescription
        .replace(/^(l'|la|il|un|una|lo)\s+/i, '') // Remove articles
        .trim();

      // Extract key words for title
      const words = cleanDesc.split(/\s+/);
      if (words.length >= 2) {
        // Take first 2-3 meaningful words for title
        projectTitle = words.slice(0, Math.min(3, words.length))
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } else {
        projectTitle = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
      }

      // Generate detailed description
      const detailedDescription = generateDetailedDescription(cleanDesc);

      setProjectName(projectTitle);
      setDescription(detailedDescription);
    } else {
      // Fallback: use the whole transcript as project name
      setProjectName(transcript);
      setDescription(`Progetto ${transcript} - Descrizione da completare`);
    }
  };

  const generateDetailedDescription = (basicDesc: string): string => {
    const lowerDesc = basicDesc.toLowerCase();

    // Common project types and their detailed descriptions
    if (lowerDesc.includes('inventario') && lowerDesc.includes('autoricambi')) {
      return `Sistema di gestione inventario per autoricambi che permetterà di:
- Catalogare tutti i pezzi di ricambio con codici, descrizioni e prezzi
- Monitorare le quantità disponibili in magazzino
- Gestire fornitori e ordini automatici
- Ricerca avanzata per compatibilità veicoli
- Gestione delle vendite e fatturazione
- Report di movimentazione e analisi delle vendite`;
    }

    if (lowerDesc.includes('e-commerce') || lowerDesc.includes('negozio online')) {
      return `Piattaforma e-commerce completa che includerà:
- Catalogo prodotti con immagini e descrizioni dettagliate
- Sistema di carrello e checkout sicuro
- Gestione utenti e autenticazione
- Sistema di pagamenti integrato
- Panel amministrativo per gestione ordini
- Sistema di spedizioni e tracking`;
    }

    if (lowerDesc.includes('gestionale') || lowerDesc.includes('gestione')) {
      return `Software gestionale per ${basicDesc} con funzionalità di:
- Dashboard con KPI e metriche principali
- Gestione anagrafica clienti e fornitori
- Sistema di fatturazione e contabilità
- Gestione documenti e archivio digitale
- Report personalizzabili e esportazione dati
- Sistema di notifiche e promemoria`;
    }

    if (lowerDesc.includes('app mobile') || lowerDesc.includes('applicazione mobile')) {
      return `Applicazione mobile per ${basicDesc} che offrirà:
- Interfaccia utente intuitiva e responsive
- Sincronizzazione dati offline/online
- Notifiche push personalizzate
- Integrazione con servizi esterni
- Sistema di autenticazione sicuro
- Design moderno e user-friendly`;
    }

    // Generic template
    return `Progetto per lo sviluppo di ${basicDesc} che comprenderà:
- Analisi dei requisiti e progettazione dell'architettura
- Sviluppo dell'interfaccia utente moderna e intuitiva
- Implementazione della logica di business
- Sistema di autenticazione e gestione utenti
- Database strutturato per l'archiviazione dei dati
- Testing e documentazione completa`;
  };

  const speak = (text: string) => {
    if (synthRef.current && voiceSupported) {
      // Stop any current speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const generateProject = async () => {
    if (!projectName.trim()) {
      setError('Nome progetto obbligatorio');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulazione della generazione AI per ora
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedProject = {
        name: projectName,
        description: description || `Progetto ${projectName} generato automaticamente con intelligenza artificiale`,
        category: 'Web App',
        status: 'Planning',
        priority: 'Medium',
        progress: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        technologies: 'React, TypeScript, Node.js',
        repository: '',
        deployUrl: '',
        tasks: [
          {
            id: Date.now().toString(),
            title: 'Setup progetto iniziale',
            description: 'Configurare ambiente di sviluppo e struttura del progetto',
            status: 'Todo',
            priority: 'High',
            assignee: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tags: []
          },
          {
            id: (Date.now() + 1).toString(),
            title: 'Sviluppo componenti base',
            description: 'Creare i componenti principali dell\'applicazione',
            status: 'Todo',
            priority: 'Medium',
            assignee: '',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tags: []
          },
          {
            id: (Date.now() + 2).toString(),
            title: 'Testing e documentazione',
            description: 'Implementare test unitari e creare documentazione',
            status: 'Todo',
            priority: 'Medium',
            assignee: '',
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tags: []
          }
        ],
        notes: ['Progetto generato automaticamente con AI - Durata stimata: 4 settimane']
      };

      onCreateProject(generatedProject);
    } catch (error) {
      setError('Errore nella generazione del progetto');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generazione AI del Progetto
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Crea automaticamente descrizione e task per il tuo progetto
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome Progetto *
          </label>
          <div className="relative">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="es. Sistema di gestione inventario"
              disabled={isGenerating || isListening}
            />
            {voiceSupported && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-1 text-red-500 hover:text-red-600 transition-colors"
                    title="Ferma sintesi vocale"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  disabled={isGenerating}
                  className={`p-1 transition-colors ${
                    isListening
                      ? 'text-red-500 hover:text-red-600 animate-pulse'
                      : 'text-blue-500 hover:text-blue-600'
                  }`}
                  title={isListening ? 'Ferma registrazione' : 'Inizia registrazione vocale'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
          {isListening && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 animate-pulse">
              🎤 Sto ascoltando... Dimmi nome e descrizione del progetto
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrizione (opzionale)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Descrivi brevemente il progetto..."
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={generateProject}
          disabled={isGenerating || !projectName.trim()}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="h-5 w-5" />
          )}
          <span>{isGenerating ? 'Generazione in corso...' : 'Genera Progetto con AI'}</span>
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          ✨ L'AI creerà automaticamente descrizione, task dettagliati e timeline
        </div>
        {voiceSupported && (
          <div className="text-xs text-blue-500 dark:text-blue-400 text-center">
            🎤 Usa il microfono per creare progetti vocalmente
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProjectWizard;