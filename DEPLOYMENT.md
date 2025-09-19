# 🚀 Guida al Deploy su Vercel

## 📋 Prerequisiti

1. **Account Vercel** - Registrati su [vercel.com](https://vercel.com)
2. **Repository GitHub** - Il codice deve essere su GitHub
3. **API Keys** - Assicurati di avere le chiavi API necessarie

## 🔧 Configurazione delle Variabili d'Ambiente

### 1. Su Vercel Dashboard

1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi le seguenti variabili:

#### Firebase (Obbligatorio)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Gemini AI (Opzionale)
```
VITE_GEMINI_API_KEY=la_tua_chiave_gemini_qui
```

### 2. Come ottenere la chiave Gemini API

1. Vai su [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Fai login con il tuo account Google
3. Clicca su **"Create API Key"**
4. Copia la chiave generata
5. Incollala nella variabile `VITE_GEMINI_API_KEY` su Vercel

## 🚀 Deploy Automatico

### Metodo 1: Collegare Repository GitHub

1. Su Vercel Dashboard, clicca **"New Project"**
2. Seleziona il repository `app-gestione-progetti`
3. Configura le impostazioni:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Aggiungi le variabili d'ambiente (vedi sopra)
5. Clicca **"Deploy"**

### Metodo 2: Deploy da CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Login su Vercel
vercel login

# Deploy del progetto
vercel

# Per deploy in produzione
vercel --prod
```

## 🔄 Deploy Automatico

Una volta collegato il repository GitHub:

- **Push su `main`** → Deploy automatico in produzione
- **Push su altri branch** → Deploy di preview
- **Pull Request** → Deploy di preview per testing

## 🧪 Testing del Deploy

1. Apri l'URL fornito da Vercel
2. Testa le funzionalità principali:
   - ✅ Caricamento progetti da Firebase
   - ✅ Creazione/modifica progetti
   - ✅ Chat Gemini (se configurato)
   - ✅ Notifiche AI (se configurato)
   - ✅ Input vocale
   - ✅ Drag & drop progetti

## 🐛 Risoluzione Problemi

### Errore Firebase
- Verifica che tutte le variabili Firebase siano corrette
- Controlla che il dominio Vercel sia autorizzato in Firebase Console

### Errore Gemini API
- La chiave API è opzionale - l'app funziona anche senza
- Se non configurata, le funzioni AI saranno disabilitate
- Gli utenti possono configurarla manualmente nell'interfaccia

### Build Errors
```bash
# Testa il build localmente
npm run build

# Controlla errori TypeScript
npm run type-check
```

## 🔐 Sicurezza

- ✅ Le variabili d'ambiente sono sicure su Vercel
- ✅ Le API keys non sono esposte nel codice client
- ✅ Firebase Rules proteggono i dati
- ✅ Gemini API key può essere configurata dall'utente

## 📊 Monitoraggio

- **Analytics**: Abilitato automaticamente su Vercel
- **Logs**: Visibili nella dashboard Vercel
- **Performance**: Monitora Core Web Vitals
- **Errors**: Tracking automatico degli errori

---

URL di esempio: `https://app-gestione-progetti.vercel.app`
