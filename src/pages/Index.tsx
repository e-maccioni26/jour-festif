
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 animate-fade-in">
          Gestion des Congés
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto animate-fade-in">
          Plateforme simplifiée pour la gestion des congés de vos employés à travers tous vos magasins.
        </p>
      </div>
      
      <AuthForm />
    </div>
  );
};

export default Index;
