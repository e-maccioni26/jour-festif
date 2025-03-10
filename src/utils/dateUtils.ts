
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Leave request status
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

// Leave request 
export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  storeId: string;
  storeName: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  reason: string;
  status: LeaveStatus;
  createdAt: string; // ISO string
}

// Format a date to display
export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

// Format a date range
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  // If same day
  if (isSameDay(start, end)) {
    return formatDate(start, 'PPP');
  }
  
  // If same month
  if (isSameMonth(start, end)) {
    return `${formatDate(start, 'PP')} - ${formatDate(end, 'd')}`;
  }
  
  // Different months
  return `${formatDate(start, 'PP')} - ${formatDate(end, 'PP')}`;
};

// Generate calendar days for a month
export const getCalendarDays = (month: Date): Date[] => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 }); // Monday start
  const end = addDays(endOfMonth(month), 7); // Include a week after month end
  
  return eachDayOfInterval({ start, end });
};

// Mock leave requests data
export const generateMockLeaveRequests = (): LeaveRequest[] => {
  const today = new Date();
  
  return [
    {
      id: '1',
      userId: '4',
      userName: 'Employee 1',
      storeId: '1',
      storeName: 'Paris Store',
      startDate: addDays(today, 5).toISOString(),
      endDate: addDays(today, 9).toISOString(),
      reason: 'Vacances d\'été',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: '5',
      userName: 'Employee 2',
      storeId: '1',
      storeName: 'Paris Store',
      startDate: addDays(today, 8).toISOString(),
      endDate: addDays(today, 12).toISOString(),
      reason: 'Raison familiale',
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      userId: '6',
      userName: 'Employee 3',
      storeId: '2',
      storeName: 'Lyon Store',
      startDate: addDays(today, 3).toISOString(),
      endDate: addDays(today, 7).toISOString(),
      reason: 'Maladie',
      status: 'rejected',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      userId: '4',
      userName: 'Employee 1',
      storeId: '1',
      storeName: 'Paris Store',
      startDate: addDays(today, 20).toISOString(),
      endDate: addDays(today, 25).toISOString(),
      reason: 'Congés personnels',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ];
};

// Helper to check if a date has any leave requests
export const hasLeaveRequestOnDate = (
  date: Date, 
  requests: LeaveRequest[], 
  storeId?: string
): LeaveRequest[] => {
  return requests.filter(request => {
    // Filter by store if storeId is provided
    if (storeId && request.storeId !== storeId) {
      return false;
    }
    
    const start = parseISO(request.startDate);
    const end = parseISO(request.endDate);
    
    // Check if the date falls within the leave request period
    return (date >= start && date <= end);
  });
};
