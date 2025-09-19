import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX,
  Settings,
  Sparkles
} from 'lucide-react';
import { geminiService, ProjectGenerationRequest, GeneratedProject } from '../services/gemini';
import { speechService } from '../services/speech';

interface AIProjectGeneratorProps {
  onProjectGenerated: (project: GeneratedProject & { name: string; category: string }) => void;
  initialName?: string;
  initialCategory?: 'Web App' | 'Landing Page' | 'Platform' | 'Tool';
}

const AIProjectGenerator: React.FC<AIProjectGeneratorProps> = ({
  onProjectGenerated,
  initialName = '',
  initialCategory = 'Web App'
}) => {
  const [projectName, setProjectName] = useState(initialName);
  const [category, setCategory] = useState<'Web App' | 'Landing Page' | 'Platform' | 'Tool'>(initialCategory);
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    setShowApiKeyInput(!geminiService.isConfigured());
    if (geminiService.isConfigured()) {
      setApiKey('***configurata***');
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey && apiKey !== '***configurata***') {
      geminiService.setApiKey(apiKey);
      setShowApiKeyInput(false);
      setSuccess('API Key salvata con successo!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const startVoiceInput = async () => {
    if (!speechService.isSpeechRecognitionSupported()) {
      setError('Riconoscimento vocale non supportato dal browser');
      return;
    }

    setError(null);
    setTranscript('');

    try {
      await speechService.startListening(
        (transcript, isFinal) => {
          setTranscript(transcript);
          if (isFinal) {
            setDescription(prev => prev + ' ' + transcript);
            setTranscript('');
          }
        },
        (error) => {
          setError(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      setIsListening(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore del riconoscimento vocale');
    }
  };

  const stopVoiceInput = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speechService.speak(text);
      setIsSpeaking(false);
    } catch (error) {
      setIsSpeaking(false);
      setError('Errore nella sintesi vocale');
    }
  };

  const generateProject = async () => {
    if (!projectName.trim()) {
      setError('Nome progetto obbligatorio');
      return;
    }

    if (!geminiService.isConfigured()) {
      setError('API Key Gemini non configurata');
      setShowApiKeyInput(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: ProjectGenerationRequest = {
        projectName: projectName.trim(),
        projectDescription: description.trim() || undefined,
        category,
        technologies: technologies.trim() ? technologies.split(',').map(t => t.trim()) : undefined
      };

      const generatedProject = await geminiService.generateProject(request);

      // Add the name and category to the generated project
      const completeProject = {
        ...generatedProject,
        name: projectName,
        category
      };

      onProjectGenerated(completeProject);
      setSuccess('Progetto generato con successo!');

      // Optional: speak confirmation
      try {
        await speechService.speak('Progetto generato con successo! Controlla i dettagli e i task creati automaticamente.');
      } catch (speechError) {
        // Ignore speech errors
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nella generazione del progetto');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generazione AI del Progetto
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lascia che Gemini AI crei automaticamente descrizione e task per il tuo progetto
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Configura API Key"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* API Key Configuration */}
      {showApiKeyInput && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Configura API Key Gemini
          </h4>
          <div className="flex space-x-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Inserisci la tua API Key Gemini..."
              className="flex-1 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey || apiKey === '***configurata***'}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salva
            </button>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
            Ottieni la tua API Key gratuita da Google AI Studio
          </p>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome Progetto *
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="es. Sistema di gestione inventario"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
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
            Descrizione (opzionale)
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-20"
              placeholder="Descrivi brevemente il progetto o usa l'input vocale..."
            />
            <div className="absolute right-2 top-2 flex space-x-1">
              {speechService.isSpeechRecognitionSupported() && (
                <button
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`p-1.5 rounded transition-colors ${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  title={isListening ? 'Ferma registrazione' : 'Inizia registrazione vocale'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              {description && (
                <button
                  onClick={() => speakText(description)}
                  className={`p-1.5 rounded transition-colors ${
                    isSpeaking
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  title={isSpeaking ? 'Ferma riproduzione' : 'Ascolta descrizione'}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
          {transcript && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border text-sm text-blue-700 dark:text-blue-300">
              Trascrizione in corso: <em>{transcript}</em>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tecnologie Preferite (opzionale)
          </label>
          <input
            type="text"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="React, Node.js, TypeScript, PostgreSQL..."
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-6">
        <button
          onClick={generateProject}
          disabled={isGenerating || !projectName.trim() || !geminiService.isConfigured()}
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

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        ✨ L'AI creerà automaticamente descrizione, task dettagliati e suggerimenti tecnologici
      </div>
    </div>
  );
};

export default AIProjectGenerator;