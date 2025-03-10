
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // If no user is logged in, only show the brand
  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm transition-all">
        <div className="container flex h-16 items-center px-4">
          <Link to="/" className="flex items-center">
            <CalendarDays className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">Gestion des Congés</span>
          </Link>
        </div>
      </header>
    );
  }

  // Navigation links based on user role
  const navLinks = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true
    },
    {
      title: "Calendrier",
      href: "/calendar",
      icon: CalendarDays,
      show: true
    },
    {
      title: "Administration",
      href: "/admin",
      icon: Users,
      show: user.role === 'admin' || user.role === 'manager'
    }
  ];

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm transition-all">
      <div className="container flex h-16 items-center px-4 justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <CalendarDays className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">Gestion des Congés</span>
          </Link>
          
          <nav className="ml-8 hidden md:flex items-center gap-6">
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {user.store && (
            <span className="hidden sm:inline-block text-sm text-muted-foreground mr-2">
              {user.store.name}
            </span>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role === 'admin' 
                      ? 'Administrateur' 
                      : user.role === 'manager' 
                        ? 'Gestionnaire' 
                        : 'Employé'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
