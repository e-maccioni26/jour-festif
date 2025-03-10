
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isSameMonth, 
  isToday, 
  parseISO 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  LeaveRequest, 
  getCalendarDays, 
  hasLeaveRequestOnDate, 
  formatDateRange 
} from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

interface CalendarProps {
  leaveRequests: LeaveRequest[];
  selectedStoreId?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  leaveRequests,
  selectedStoreId 
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuth();
  
  const calendarDays = getCalendarDays(currentMonth);
  
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(isSameDay(day, selectedDate as Date) ? null : day);
  };

  // Filter leave requests for selected store if provided
  const filteredLeaveRequests = selectedStoreId 
    ? leaveRequests.filter(req => req.storeId === selectedStoreId)
    : leaveRequests;

  // Get leave requests for a specific day
  const getDayLeaveRequests = (day: Date) => {
    return hasLeaveRequestOnDate(day, filteredLeaveRequests, selectedStoreId);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  // Status label in French
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Refusé';
      case 'pending':
      default:
        return 'En attente';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePrevMonth}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <Button
            onClick={handleNextMonth}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="grid grid-cols-7 bg-muted">
          {dayNames.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-card">
          {calendarDays.map((day, i) => {
            const dayRequests = getDayLeaveRequests(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelectedDay = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[100px] p-2 relative border-t border-r border-border",
                  i % 7 === 0 && "border-l",
                  i >= 35 && "border-b",
                  !isCurrentMonth && "bg-muted/50",
                  isSelectedDay && "bg-primary/5",
                  "transition-colors"
                )}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center rounded-full h-6 w-6 text-xs",
                      isDayToday && "bg-primary text-primary-foreground font-bold",
                      !isDayToday && isCurrentMonth && "text-foreground",
                      !isCurrentMonth && "text-muted-foreground",
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  
                  {dayRequests.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {dayRequests.length}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto text-xs">
                  <TooltipProvider>
                    {dayRequests.slice(0, 2).map((request) => (
                      <Tooltip key={request.id}>
                        <TooltipTrigger asChild>
                          <div 
                            className={cn(
                              "text-xs rounded px-1 py-0.5 truncate text-white",
                              getStatusColor(request.status)
                            )}
                          >
                            {request.userName}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-3 space-y-2">
                          <div className="font-medium">{request.userName}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDateRange(request.startDate, request.endDate)}
                          </div>
                          <div className="text-xs">{request.reason}</div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "mt-1 text-xs",
                              getStatusColor(request.status)
                            )}
                          >
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                  
                  {dayRequests.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayRequests.length - 2} plus...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 border rounded-lg p-4 animate-slide-in">
          <h3 className="font-medium mb-3">
            Congés du {format(selectedDate, 'PPP', { locale: fr })}
          </h3>
          
          {getDayLeaveRequests(selectedDate).length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun congé prévu pour cette date.</p>
          ) : (
            <div className="space-y-3">
              {getDayLeaveRequests(selectedDate).map((request) => (
                <div key={request.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between">
                    <div className="font-medium">{request.userName}</div>
                    <Badge className={cn(getStatusColor(request.status))}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateRange(request.startDate, request.endDate)}
                  </div>
                  <div className="text-sm mt-1">{request.reason}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {request.storeName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
