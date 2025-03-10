
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '../components/Calendar';
import { StoreSelector } from '../components/StoreSelector';
import { useAuth } from '../context/AuthContext';
import { generateMockLeaveRequests } from '../utils/dateUtils';

const Calendar = () => {
  const { user, stores } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState(generateMockLeaveRequests());
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    user?.storeId
  );
  
  // Handle store selection (only for admin)
  const handleStoreChange = (storeId: string | undefined) => {
    setSelectedStoreId(storeId);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendrier des congés</h2>
          <p className="text-muted-foreground">
            Visualisez les congés planifiés pour l'ensemble des employés
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <StoreSelector 
            stores={stores}
            selectedStoreId={selectedStoreId}
            onChange={handleStoreChange}
          />
        )}
      </div>
      
      <CalendarComponent 
        leaveRequests={leaveRequests}
        selectedStoreId={selectedStoreId}
      />
    </div>
  );
};

export default Calendar;
