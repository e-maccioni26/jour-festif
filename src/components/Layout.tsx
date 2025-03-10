
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 sm:p-6 md:p-8 animate-fade-in">
        <Outlet />
      </main>
      <footer className="py-4 px-6 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Gestion des Congés. Tous droits réservés.</p>
      </footer>
    </div>
  );
};
