
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Types utilisateur - Simplifié pour éviter les problèmes
export type UserRole = 'admin' | 'manager' | 'employee';

// Informations sur le magasin
export interface Store {
  id: string;
  name: string;
  location: string;
}

// Informations de profil utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  store?: Store;
}

// Contexte d'authentification
interface AuthContextType {
  user: User | null;
  stores: Store[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données mockées pour les magasins en cas d'erreur de chargement
const MOCK_STORES: Store[] = [
  { id: '1', name: 'Malakoff', location: 'Malakoff' },
  { id: '2', name: 'Amiens', location: 'Amiens' },
  { id: '3', name: 'Beauvais', location: 'Beauvais' },
  { id: '4', name: 'Abbeville', location: 'Abbeville' },
  { id: '5', name: 'Angers', location: 'Angers' },
  { id: '6', name: 'Le Havre', location: 'Le Havre' },
  { id: '7', name: 'Bourg-en-Bresse', location: 'Bourg-en-Bresse' },
];

// Données mockées pour les utilisateurs en cas d'erreur
const MOCK_USERS = [
  { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' as const },
  { id: '2', name: 'Paris Manager', email: 'paris@example.com', role: 'manager' as const, storeId: '1' },
  { id: '3', name: 'Lyon Manager', email: 'lyon@example.com', role: 'manager' as const, storeId: '2' },
  { id: '4', name: 'Employee 1', email: 'emp1@example.com', role: 'employee' as const, storeId: '1' },
  { id: '5', name: 'Employee 2', email: 'emp2@example.com', role: 'employee' as const, storeId: '1' },
  { id: '6', name: 'Employee 3', email: 'emp3@example.com', role: 'employee' as const, storeId: '2' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES); // Utiliser directement les magasins mockés
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // IMPORTANT: Ne pas essayer de charger les magasins depuis Supabase pour l'instant
  // car il y a une récursion infinie dans les politiques RLS

  // Fonction pour charger le profil utilisateur - Simplifiée pour éviter les erreurs
  const loadUserProfile = async (userId: string) => {
    try {
      // Vérifier si l'utilisateur existe dans les données mockées
      const { data } = await supabase.auth.getUser(userId);
      if (data?.user?.email) {
        // Trouver l'utilisateur mocké correspondant à l'email ou créer un utilisateur par défaut
        const mockUser = MOCK_USERS.find(u => u.email === data.user.email) || {
          id: userId,
          name: data.user.email.split('@')[0],
          email: data.user.email,
          role: 'employee' as const
        };
        
        setUser({
          id: userId,
          name: mockUser.name,
          email: data.user.email,
          role: mockUser.role,
          storeId: mockUser.storeId,
          store: mockUser.storeId ? MOCK_STORES.find(s => s.id === mockUser.storeId) : undefined
        });
      }
    } catch (error) {
      console.error('Erreur inattendue lors du chargement du profil:', error);
    }
  };

  // Vérifier l'authentification existante et charger les données
  useEffect(() => {
    // Observer les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        if (newSession?.user) {
          // Utiliser setTimeout pour éviter les appels récursifs
          setTimeout(() => {
            loadUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        loadUserProfile(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Pour les comptes de démo, accepter n'importe quel mot de passe
      if (MOCK_USERS.some(u => u.email === email)) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // Si l'utilisateur de test n'existe pas encore dans Supabase, créez-le
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
          });
          
          if (signUpError) {
            console.error('Erreur lors de la création du compte de test:', signUpError);
            setLoading(false);
            return false;
          }
          
          // Maintenant, essayez de vous connecter avec ce compte
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (loginError) {
            console.error('Erreur de connexion après création du compte:', loginError);
            setLoading(false);
            return false;
          }
        }
        
        setLoading(false);
        return true;
      }
      
      // Pour les utilisateurs normaux
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        setLoading(false);
        return false;
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de la connexion:', error);
      setLoading(false);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      stores, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
