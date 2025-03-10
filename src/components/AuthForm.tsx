
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Connecté avec succès",
          description: "Bienvenue sur l'application de gestion des congés.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Échec de connexion",
          description: "Email ou mot de passe incorrect. Essayez à nouveau.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts for easier testing
  const demoAccounts = [
    { role: 'Administrateur', email: 'admin@example.com' },
    { role: 'Gestionnaire', email: 'paris@example.com' },
    { role: 'Employé', email: 'emp1@example.com' },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border shadow-sm glassmorphism animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CalendarDays className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à la gestion des congés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-2">
            <p className="text-sm text-center text-muted-foreground">Comptes de démonstration:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  size="sm"
                  className="h-auto py-1 px-2"
                  onClick={() => setEmail(account.email)}
                >
                  {account.role}
                </Button>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Mot de passe: n'importe quel texte
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
