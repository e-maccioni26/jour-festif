
import React, { useState } from 'react';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest, generateMockLeaveRequests } from '../utils/dateUtils';

interface LeaveRequestFormProps {
  onSubmitSuccess: (request: LeaveRequest) => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmitSuccess
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock request submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !reason.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    if (isBefore(endDate, startDate)) {
      toast({
        title: "Dates invalides",
        description: "La date de fin doit être après la date de début.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      if (!user || !user.store) {
        toast({
          title: "Erreur",
          description: "Informations utilisateur manquantes.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create new request object
      const newRequest: LeaveRequest = {
        id: `new-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        storeId: user.store?.id || '',
        storeName: user.store?.name || '',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: reason.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Call the success handler passing the new request
      onSubmitSuccess(newRequest);
      
      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de congés a été soumise avec succès.",
      });
      
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Nouvelle demande de congés</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour soumettre une demande de congés
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="start-date"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => isBefore(date, new Date())}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="end-date"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => 
                      isBefore(date, startDate || new Date())
                    }
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motif de la demande</Label>
            <Textarea
              id="reason"
              placeholder="Veuillez indiquer la raison de votre demande de congés..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Traitement en cours..." : "Soumettre la demande"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
