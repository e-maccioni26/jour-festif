
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [name, setName] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir votre adresse email.",
        variant: "destructive"
      });
      return;
    }
    
    // Si on utilise un magic link, on n'a pas besoin de mot de passe
    if (!useMagicLink && !password) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir votre mot de passe.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (useMagicLink) {
        // Authentification par magic link
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: isSigningUp ? {
              name: name || email.split('@')[0],
              role: 'employee'
            } : undefined
          }
        });

        if (error) {
          throw error;
        }

        setMagicLinkSent(true);
        toast({
          title: "Lien de connexion envoyé",
          description: "Vérifiez votre boîte de réception et cliquez sur le lien pour vous connecter.",
        });
      } else if (isSigningUp) {
        // Tentative d'inscription classique
        if (!name) {
          toast({
            title: "Champ requis",
            description: "Le nom est requis pour l'inscription.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: 'employee'
            }
          }
        });

        if (error) {
          // Si l'inscription par email est désactivée, suggérer le magic link
          if (error.message.includes("Email signups are disabled")) {
            toast({
              title: "Inscription par email désactivée",
              description: "Veuillez utiliser l'option 'Connexion par lien magique' à la place.",
              variant: "destructive"
            });
            setUseMagicLink(true);
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Inscription réussie",
            description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
          });
          setIsSigningUp(false);
        }
      } else {
        // Connexion classique
        const success = await login(email, password);
        
        if (success) {
          toast({
            title: "Connecté avec succès",
            description: "Bienvenue sur l'application de gestion des congés.",
          });
          navigate('/dashboard');
        } else {
          // Si la connexion échoue à cause de 'Email logins are disabled'
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error && error.message.includes("Email logins are disabled")) {
            toast({
              title: "Connexion par email désactivée",
              description: "Veuillez utiliser l'option 'Connexion par lien magique' à la place.",
              variant: "destructive"
            });
            setUseMagicLink(true);
          } else {
            toast({
              title: "Échec de connexion",
              description: "Email ou mot de passe incorrect. Essayez à nouveau.",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
      console.error("Erreur d'authentification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Comptes de démonstration pour faciliter les tests
  const demoAccounts = [
    { role: 'Administrateur', email: 'admin@example.com' },
    { role: 'Gestionnaire', email: 'paris@example.com' },
    { role: 'Employé', email: 'emp1@example.com' },
  ];

  if (magicLinkSent) {
    return (
      <Card className="border shadow-sm glassmorphism animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CalendarDays className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Vérifiez votre email
          </CardTitle>
          <CardDescription>
            Un lien de connexion a été envoyé à {email}. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="link" 
            className="w-full" 
            onClick={() => setMagicLinkSent(false)}
          >
            Utiliser une autre adresse email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border shadow-sm glassmorphism animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CalendarDays className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSigningUp ? 'Inscription' : 'Connexion'}
          </CardTitle>
          <CardDescription>
            {useMagicLink 
              ? 'Entrez votre email pour recevoir un lien de connexion' 
              : (isSigningUp 
                ? 'Créez un compte pour accéder à la gestion des congés' 
                : 'Entrez vos identifiants pour accéder à la gestion des congés')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSigningUp && !useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSigningUp && !useMagicLink}
                />
              </div>
            )}

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

            {!useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!useMagicLink}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? (useMagicLink 
                  ? "Envoi du lien..." 
                  : (isSigningUp ? "Inscription en cours..." : "Connexion en cours...")) 
                : (useMagicLink 
                  ? "Envoyer le lien de connexion" 
                  : (isSigningUp ? "S'inscrire" : "Se connecter"))}
            </Button>
          </form>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setUseMagicLink(!useMagicLink)}
          >
            {useMagicLink 
              ? "Utiliser mot de passe" 
              : "Connexion par lien magique"}
          </Button>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-2">
            {isSigningUp ? (
              <Button 
                variant="link" 
                className="w-full" 
                onClick={() => setIsSigningUp(false)}
              >
                Déjà inscrit ? Se connecter
              </Button>
            ) : (
              <>
                <Button 
                  variant="link" 
                  className="w-full" 
                  onClick={() => setIsSigningUp(true)}
                >
                  Pas encore de compte ? S'inscrire
                </Button>
                {!useMagicLink && (
                  <>
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
                  </>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
