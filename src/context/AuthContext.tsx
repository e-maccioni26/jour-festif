
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// User roles
export type UserRole = 'employee' | 'manager' | 'admin';

// Store information
export interface Store {
  id: string;
  name: string;
  location: string;
}

// User profile information
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  store?: Store;
}

// Mock user data (will be replaced with real API calls later)
const MOCK_STORES: Store[] = [
  { id: '1', name: 'Paris Store', location: 'Paris' },
  { id: '2', name: 'Lyon Store', location: 'Lyon' },
  { id: '3', name: 'Marseille Store', location: 'Marseille' },
  { id: '4', name: 'Bordeaux Store', location: 'Bordeaux' },
  { id: '5', name: 'Lille Store', location: 'Lille' },
  { id: '6', name: 'Strasbourg Store', location: 'Strasbourg' },
  { id: '7', name: 'Nice Store', location: 'Nice' },
];

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'Paris Manager', email: 'paris@example.com', role: 'manager', storeId: '1' },
  { id: '3', name: 'Lyon Manager', email: 'lyon@example.com', role: 'manager', storeId: '2' },
  { id: '4', name: 'Employee 1', email: 'emp1@example.com', role: 'employee', storeId: '1' },
  { id: '5', name: 'Employee 2', email: 'emp2@example.com', role: 'employee', storeId: '1' },
  { id: '6', name: 'Employee 3', email: 'emp3@example.com', role: 'employee', storeId: '2' },
];

// Authentication context
interface AuthContextType {
  user: User | null;
  stores: Store[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing login
  useEffect(() => {
    // In a real app, this would verify a token with a backend
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.storeId) {
          const store = MOCK_STORES.find(s => s.id === parsedUser.storeId);
          if (store) {
            parsedUser.store = store;
          }
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      // In a real app, we would verify the password against a hash
      // For demo, any password works
      
      const userWithStore = { ...foundUser };
      
      if (foundUser.storeId) {
        const store = MOCK_STORES.find(s => s.id === foundUser.storeId);
        if (store) {
          userWithStore.store = store;
        }
      }
      
      setUser(userWithStore);
      localStorage.setItem('user', JSON.stringify(userWithStore));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, stores: MOCK_STORES, loading, login, logout }}>
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
