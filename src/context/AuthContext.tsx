
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Types utilisateur
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

  // Fonction pour charger les magasins
  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erreur lors du chargement des magasins:', error);
        // Ne pas changer les magasins, garder les données mockées
        return;
      }

      if (data && data.length > 0) {
        setStores(data);
      }
    } catch (error) {
      console.error('Erreur inattendue lors du chargement des magasins:', error);
    }
  };

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = async (userId: string) => {
    try {
      // Essayer d'abord de charger à partir de Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, store:stores(*)')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code !== 'PGRST116') { // Ignorer l'erreur "No rows found"
          console.error('Erreur lors du chargement du profil:', profileError);
        }
        
        // Si erreur de récursion infinie, utiliser les données mockées
        if (profileError.code === '42P17') {
          // Trouver l'utilisateur mocké correspondant à l'email
          const { data } = await supabase.auth.getUser(userId);
          if (data?.user?.email) {
            const mockUser = MOCK_USERS.find(u => u.email === data.user.email);
            if (mockUser) {
              setUser({
                id: userId,
                name: mockUser.name,
                email: data.user.email,
                role: mockUser.role,
                storeId: mockUser.storeId,
                store: mockUser.storeId ? MOCK_STORES.find(s => s.id === mockUser.storeId) : undefined
              });
              return;
            }
          }
        }
        return;
      }

      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role || 'employee', // Valeur par défaut 'employee' si role est null
          storeId: profile.store_id,
          store: profile.store ? {
            id: profile.store.id,
            name: profile.store.name,
            location: profile.store.location
          } : undefined
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur inattendue lors du chargement du profil:', error);
    }
  };

  // Vérifier l'authentification existante et charger les données
  useEffect(() => {
    // Charger les magasins indépendamment de l'authentification
    loadStores();

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        setLoading(false);
        return false;
      }
      
      // L'utilisateur sera chargé via onAuthStateChange
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
