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

export const projects: Project[] = [
  {
    id: 'il-sorpasso',
    name: 'Il Sorpasso',
    description: 'Landing page deployata su Vercel con Firebase. Ottimizzazione SEO in corso.',
    status: 'Testing',
    priority: 'High',
    progress: 75,
    dueDate: '2025-01-30',
    category: 'Landing Page',
    technologies: ['React', 'Next.js', 'Firebase', 'Vercel'],
    deployUrl: 'https://vercel.app',
    tasks: [
      {
        id: 'seo-optimization',
        title: 'Ottimizzazione SEO completa',
        description: 'Implementare meta tags, sitemap.xml, robots.txt e tutte le ottimizzazioni SEO necessarie',
        status: 'Todo',
        priority: 'High',
        assignee: 'Developer',
        dueDate: '2025-01-25',
        tags: ['SEO', 'Meta Tags', 'Sitemap']
      },
      {
        id: 'content-update',
        title: 'Aggiornamento contenuti e immagini',
        description: 'Sostituire foto esistenti e aggiornare contenuti prima del deploy finale',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Content Manager',
        dueDate: '2025-01-28',
        tags: ['Content', 'Images', 'Copy']
      },
      {
        id: 'hostinger-setup',
        title: 'Configurazione dominio Hostinger',
        description: 'Trasferire il sito dal deploy Vercel al dominio Hostinger acquistato',
        status: 'Todo',
        priority: 'High',
        assignee: 'DevOps',
        dueDate: '2025-01-30',
        tags: ['Hosting', 'Domain', 'DNS']
      }
    ],
    notes: [
      'Database Firebase già configurato e funzionante',
      'Deploy Vercel attualmente stabile',
      'Dominio Hostinger già acquistato',
      'Priorità: SEO → Content → Hostinger Transfer'
    ]
  },
  {
    id: 'devjobmatcher',
    name: 'DevJobMatcher',
    description: 'Piattaforma AI per matching sviluppatori-aziende con algoritmi intelligenti.',
    status: 'Planning',
    priority: 'High',
    progress: 15,
    dueDate: '2025-03-15',
    category: 'Platform',
    technologies: ['React', 'Node.js', 'TypeScript', 'AI/ML', 'PostgreSQL', 'Redis'],
    tasks: [
      {
        id: 'mvp-setup',
        title: 'Setup MVP seguendo la guida',
        description: 'Implementare la struttura base del MVP seguendo il documento di setup fornito',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Lead Developer',
        dueDate: '2025-02-01',
        tags: ['MVP', 'Setup', 'Architecture']
      },
      {
        id: 'matching-algorithm',
        title: 'Sistema di matching AI',
        description: 'Sviluppare algoritmo intelligente per il matching sviluppatori-aziende',
        status: 'Todo',
        priority: 'High',
        assignee: 'AI Developer',
        dueDate: '2025-02-15',
        tags: ['AI', 'Algorithm', 'Matching']
      },
      {
        id: 'developer-dashboard',
        title: 'Dashboard sviluppatori',
        description: 'Creare interfaccia per profili sviluppatori, skill management e job applications',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Frontend Developer',
        dueDate: '2025-02-28',
        tags: ['Dashboard', 'UI/UX', 'Developers']
      },
      {
        id: 'company-dashboard',
        title: 'Dashboard aziende',
        description: 'Sviluppare pannello per aziende con gestione job posting e candidate review',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Frontend Developer',
        dueDate: '2025-03-10',
        tags: ['Dashboard', 'UI/UX', 'Companies']
      }
    ],
    notes: [
      'MVP Setup Guide completo disponibile',
      'Focus su matching intelligente sviluppatori-aziende',
      'Stack tecnologico già definito',
      'Potenziale per monetizzazione premium features'
    ]
  },
  {
    id: 'linkythub',
    name: 'LinkyThub',
    description: 'Piattaforma di link management con analytics avanzata e branding personalizzato.',
    status: 'Planning',
    priority: 'Medium',
    progress: 10,
    dueDate: '2025-04-30',
    category: 'Platform',
    technologies: ['React', 'Node.js', 'TypeScript', 'Analytics', 'MongoDB'],
    tasks: [
      {
        id: 'core-platform',
        title: 'Piattaforma link management core',
        description: 'Sviluppare funzionalità base per creazione, gestione e organizzazione link',
        status: 'Todo',
        priority: 'High',
        assignee: 'Full Stack Developer',
        dueDate: '2025-02-28',
        tags: ['Core', 'Links', 'Management']
      },
      {
        id: 'analytics-dashboard',
        title: 'Dashboard analytics avanzata',
        description: 'Implementare sistema di tracking e analytics con visualizzazioni dettagliate',
        status: 'Todo',
        priority: 'High',
        assignee: 'Data Developer',
        dueDate: '2025-03-31',
        tags: ['Analytics', 'Dashboard', 'Tracking']
      },
      {
        id: 'branding-system',
        title: 'Sistema branding personalizzato',
        description: 'Creare sistema per custom domains, branded links e personalizzazione UI',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Frontend Developer',
        dueDate: '2025-04-15',
        tags: ['Branding', 'Customization', 'UI']
      },
      {
        id: 'api-integration',
        title: 'API e integrazioni',
        description: 'Sviluppare API REST e integrazioni con servizi esterni',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Backend Developer',
        dueDate: '2025-04-20',
        tags: ['API', 'Integration', 'REST']
      }
    ],
    notes: [
      'Logo LinkyThub già disponibile (linkylogo1.png)',
      'Focus su analytics e tracking intelligente',
      'Potenziale per sistema freemium',
      'Competizione con Bitly, TinyURL - differenziazione su analytics'
    ]
  },
  {
    id: 'ospitly',
    name: 'Ospitly',
    description: 'Piattaforma gestione ospitalità deployata su Aruba. Setup email in corso.',
    status: 'Deployed',
    priority: 'Medium',
    progress: 90,
    dueDate: '2025-01-15',
    category: 'Platform',
    technologies: ['React', 'Node.js', 'Vercel', 'Aruba Hosting'],
    deployUrl: 'https://ospitly.com',
    tasks: [
      {
        id: 'dns-mx-config',
        title: 'Configurazione DNS MX per email Aruba',
        description: 'Completare configurazione record MX su Vercel per gestione email tramite Aruba',
        status: 'Todo',
        priority: 'High',
        assignee: 'DevOps',
        dueDate: '2025-01-10',
        tags: ['DNS', 'Email', 'MX Records']
      },
      {
        id: 'domain-verification',
        title: 'Verifica dominio e SSL',
        description: 'Verificare che il dominio sia correttamente configurato con certificato SSL',
        status: 'In Progress',
        priority: 'Medium',
        assignee: 'DevOps',
        dueDate: '2025-01-12',
        tags: ['SSL', 'Domain', 'Security']
      },
      {
        id: 'email-testing',
        title: 'Test funzionalità email',
        description: 'Testare invio e ricezione email dopo configurazione MX',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'QA',
        dueDate: '2025-01-15',
        tags: ['Testing', 'Email', 'QA']
      }
    ],
    notes: [
      'Deploy da Vercel ad Aruba completato con successo',
      'Sito live e funzionante su dominio principale',
      'Manca solo configurazione MX per email Aruba',
      'Business plan completo disponibile per riferimento'
    ]
  }
];