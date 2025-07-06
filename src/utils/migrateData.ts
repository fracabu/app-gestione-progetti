// Utility per migrare i dati statici su Firebase
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { projects } from '../data/projects';

export const migrateProjectsToFirebase = async () => {
  try {
    console.log('Iniziando migrazione progetti su Firebase...');
    
    for (const project of projects) {
      // Rimuovi l'ID locale prima di salvare su Firebase
      const { id, ...projectData } = project;
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      console.log(`Progetto "${project.name}" migrato con ID: ${docRef.id}`);
    }
    
    console.log('Migrazione completata!');
  } catch (error) {
    console.error('Errore durante la migrazione:', error);
  }
};

// Funzione helper per chiamare la migrazione dalla console del browser
// Apri la console e digita: window.migrateProjects()
if (typeof window !== 'undefined') {
  (window as any).migrateProjects = migrateProjectsToFirebase;
}