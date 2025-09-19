import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Plus,
  Trash2,
  Loader2,
  Settings,
  Download,
  Upload,
  MoreVertical,
  Bot,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { geminiChatService, ChatMessage, ChatSession, intelligentPrompts, projectSpecificPrompts } from '../services/geminiChat';
import { useProjects } from '../hooks/useProjects';
import { useNavigation } from '../contexts/NavigationContext';
import { geminiService } from '../services/gemini';

// Component to render formatted message content
const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  // Basic markdown-like formatting
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/###\s+(.*?)$/gm, '<h3 class="text-base font-semibold mt-3 mb-2">$1</h3>') // H3
      .replace(/##\s+(.*?)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>') // H2
      .replace(/#\s+(.*?)$/gm, '<h1 class="text-xl font-bold mt-4 mb-3">$1</h1>') // H1
      .replace(/^-\s+(.*?)$/gm, '<li class="ml-4">• $1</li>') // Bullet points
      .replace(/^\d+\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>') // Numbered lists
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>') // Inline code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto mt-2 mb-2"><code>$1</code></pre>'); // Code blocks
  };

  return (
    <div
      className="formatted-content"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

interface GeminiChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  width?: number;
  onWidthChange?: (width: number) => void;
}

const GeminiChatSidebar: React.FC<GeminiChatSidebarProps> = ({
  isOpen,
  onToggle,
  width = 320,
  onWidthChange
}) => {
  const { projects } = useProjects();
  const { editingProjectId } = useNavigation();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    const session = geminiChatService.getCurrentSession();
    setCurrentSession(session);

    // Check API key
    if (geminiService.isConfigured()) {
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        setApiKey('***configurata via environment***');
      } else {
        setApiKey('***configurata***');
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const deltaX = dragStartX - e.clientX;
      const newWidth = Math.max(250, Math.min(600, dragStartWidth + deltaX));

      if (onWidthChange) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartWidth, onWidthChange]);

  const loadSessions = () => {
    const allSessions = geminiChatService.getChatSessions();
    setSessions(allSessions);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      const projectContext = editingProjectId || undefined;
      await geminiChatService.sendMessage(userMessage, projects, projectContext);

      // Refresh current session
      const updatedSession = geminiChatService.getCurrentSession();
      setCurrentSession(updatedSession);
      loadSessions();
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      alert(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const projectName = editingProjectId
      ? projects.find(p => p.id === editingProjectId)?.name
      : undefined;

    const sessionId = geminiChatService.createNewSession(
      projectName ? `Chat - ${projectName}` : 'Nuova chat',
      editingProjectId || undefined
    );

    const newSession = geminiChatService.getCurrentSession();
    setCurrentSession(newSession);
    loadSessions();
    setShowSessions(false);
  };

  const handleSelectSession = (sessionId: string) => {
    geminiChatService.setCurrentSession(sessionId);
    const session = geminiChatService.getCurrentSession();
    setCurrentSession(session);
    setShowSessions(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questa chat?')) {
      geminiChatService.deleteSession(sessionId);
      loadSessions();

      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    }
  };

  const handleSaveApiKey = async () => {
    if (apiKey && !apiKey.includes('***configurata')) {
      geminiService.setApiKey(apiKey);

      // Test the API key
      try {
        const isValid = await geminiChatService.testApiKey();
        if (isValid) {
          setShowSettings(false);
          alert('API Key salvata e verificata con successo!');
        } else {
          alert('API Key salvata ma potrebbe non essere valida. Verifica che sia corretta.');
        }
      } catch (error) {
        alert('API Key salvata ma non è stato possibile verificarla. Controlla la connessione.');
      }
    }
  };

  const handleClearChat = () => {
    if (confirm('Sei sicuro di voler cancellare questa chat?')) {
      geminiChatService.clearCurrentSession();
      const clearedSession = geminiChatService.getCurrentSession();
      setCurrentSession(clearedSession);
      loadSessions(); // Reload sessions to reflect changes
    }
  };

  const handleExportChat = () => {
    const data = geminiChatService.exportChatHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini-chat-history.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportChat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (geminiChatService.importChatHistory(content)) {
          loadSessions();
          alert('Chat history importata con successo!');
        } else {
          alert('Errore nell\'importazione del file!');
        }
      };
      reader.readAsText(file);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const getCurrentProjectName = () => {
    if (!editingProjectId) return null;
    return projects.find(p => p.id === editingProjectId)?.name;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartWidth(width);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Apri Chat Gemini"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className="fixed right-0 top-0 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col"
      style={{ width: isCollapsed ? '60px' : `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all bg-gray-300 dark:bg-gray-600"
        onMouseDown={handleMouseDown}
        title="Trascina per ridimensionare"
      />
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {!isCollapsed && <h3 className="font-semibold text-gray-900 dark:text-white">Gemini AI</h3>}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleCollapse}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title={isCollapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
            >
              {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <button
              onClick={onToggle}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Chiudi chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isCollapsed && getCurrentProjectName() && (
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
            Progetto: {getCurrentProjectName()}
          </div>
        )}

        {!isCollapsed && <div className="flex items-center space-x-2 mt-3">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuova Chat</span>
          </button>
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Mostra chat"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Prompt suggeriti"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Impostazioni"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>}

        {/* Collapsed state buttons */}
        {isCollapsed && (
          <div className="flex flex-col space-y-2 mt-3 items-center">
            <button
              onClick={handleNewChat}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Nuova Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Impostazioni"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Suggestions Panel */}
      {!isCollapsed && showSuggestions && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
            Prompt Suggeriti
          </h4>

          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Generali</h5>
              <div className="space-y-1">
                {Object.entries(intelligentPrompts).map(([key, prompt]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMessage(prompt);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left text-xs p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {getCurrentProjectName() && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Per {getCurrentProjectName()}
                </h5>
                <div className="space-y-1">
                  {Object.entries(projectSpecificPrompts).map(([key, prompt]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setMessage(prompt);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left text-xs p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {!isCollapsed && showSettings && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Configura API Key
          </h4>
          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Inserisci API Key Gemini..."
              className="w-full px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey || apiKey === '***configurata***'}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Salva
              </button>
              <label className="flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportChat}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleExportChat}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg"
                title="Esporta chat"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {showSessions && (
        <div className="max-h-48 overflow-y-auto border-b border-gray-200 dark:border-gray-700">
          {sessions.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Nessuna chat salvata
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 border-b border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  currentSession?.id === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(session.updatedAt)} • {session.messages.length} messaggi
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentSession && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">Inizia una nuova chat con Gemini</p>
            <p className="text-xs mt-2">
              L'AI ha accesso completo ai tuoi {projects.length} progetti e task per aiutarti nella gestione dello sviluppo
            </p>
            {getCurrentProjectName() && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  📍 Contesto attivo: {getCurrentProjectName()}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                  Le domande includeranno automaticamente i dettagli di questo progetto
                </p>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={() => setShowSuggestions(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                🎯 Vedi prompt suggeriti
              </button>
            </div>
          </div>
        )}

        {currentSession?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-start space-x-2">
                {msg.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
                    <MessageContent content={msg.content} />
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Gemini sta pensando...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        {currentSession && currentSession.messages.length > 0 && (
          <div className="flex justify-center mb-3">
            <button
              onClick={handleClearChat}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Cancella chat
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={getCurrentProjectName() ? `Chiedi su ${getCurrentProjectName()}...` : "Chiedi a Gemini sui tuoi progetti..."}
            disabled={isLoading || !geminiService.isConfigured()}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading || !geminiService.isConfigured()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {!geminiService.isConfigured() && (
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center">
            ⚙️ Configura l'API Key per iniziare
            <br />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-500 dark:hover:text-orange-300"
            >
              Ottieni la chiave da Google AI Studio
            </a>
          </div>
        )}

        {geminiService.isConfigured() && projects.length === 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            💡 Crea alcuni progetti per ottenere assistenza più mirata
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiChatSidebar;