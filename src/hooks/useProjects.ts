import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../data/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener per i progetti
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const projectsData: Project[] = [];
        querySnapshot.forEach((doc) => {
          projectsData.push({ 
            id: doc.id, 
            ...doc.data() 
          } as Project);
        });
        setProjects(projectsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError('Errore nel caricamento dei progetti');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Aggiungi nuovo progetto
  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'projects'), project);
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Errore nell\'aggiunta del progetto');
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna progetto esistente
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setLoading(true);
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, updates);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Errore nell\'aggiornamento del progetto');
    } finally {
      setLoading(false);
    }
  };

  // Elimina progetto
  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Errore nell\'eliminazione del progetto');
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject
  };
};