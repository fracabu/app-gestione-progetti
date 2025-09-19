// Web Speech API integration for voice input
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  0: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!this.isSpeechRecognitionSupported()) {
      console.warn('Speech Recognition non supportato in questo browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'it-IT';
    this.recognition.maxAlternatives = 1;
  }

  isSpeechRecognitionSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = 'Speech Recognition non inizializzato';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      if (this.isListening) {
        const error = 'Speech Recognition già in ascolto';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;

        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errorMessage = this.getErrorMessage(event.error);
        onError?.(errorMessage);
        reject(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd?.();
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        const errorMessage = 'Errore nell\'avvio del riconoscimento vocale';
        onError?.(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  abortListening() {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'Nessun parlato rilevato. Riprova.';
      case 'audio-capture':
        return 'Impossibile accedere al microfono.';
      case 'not-allowed':
        return 'Permesso microfono negato.';
      case 'network':
        return 'Errore di rete.';
      case 'aborted':
        return 'Riconoscimento vocale interrotto.';
      default:
        return `Errore del riconoscimento vocale: ${error}`;
    }
  }

  // Text-to-Speech per feedback vocale
  speak(text: string, options?: SpeechSynthesisUtterance): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Text-to-Speech non supportato'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Override with custom options
      if (options) {
        Object.assign(utterance, options);
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error('Errore nella sintesi vocale'));

      speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();