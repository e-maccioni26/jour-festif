
import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Store, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveRequestForm } from '../components/LeaveRequest';
import { Calendar } from '../components/Calendar';
import { AdminDashboard } from '../components/AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest, generateMockLeaveRequests } from '../utils/dateUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    user?.storeId
  );
  
  // Load mock data on component mount
  useEffect(() => {
    setLeaveRequests(generateMockLeaveRequests());
  }, []);
  
  // Add new leave request
  const handleNewRequest = (request: LeaveRequest) => {
    setLeaveRequests(prev => [request, ...prev]);
  };
  
  // Approve leave request
  const handleApproveRequest = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      )
    );
  };
  
  // Reject leave request
  const handleRejectRequest = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      )
    );
  };
  
  // Filter requests for the current user's store
  const userStoreRequests = leaveRequests.filter(
    request => user?.storeId === undefined || request.storeId === user.storeId
  );
  
  // Filter requests for the current user
  const userRequests = leaveRequests.filter(
    request => request.userId === user?.id
  );
  
  // Count pending leave requests
  const pendingCount = userStoreRequests.filter(
    request => request.status === 'pending'
  ).length;
  
  // Is the user a manager or admin
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Bienvenue, {user?.name} | {user?.store?.name || 'Administration'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mes demandes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {userRequests.filter(r => r.status === 'approved').length} approuvées
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En attente
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Demandes à traiter
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Employés
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.storeId ? '3' : '15'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dans {user?.store?.name || 'tous les magasins'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Magasins
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Dans toute la France
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Calendrier</span>
          </TabsTrigger>
          <TabsTrigger value="request" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Nouvelle demande</span>
          </TabsTrigger>
          {isManagerOrAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Gestion</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <Calendar 
            leaveRequests={leaveRequests}
            selectedStoreId={user?.storeId}
          />
        </TabsContent>
        
        <TabsContent value="request">
          <LeaveRequestForm 
            onSubmitSuccess={handleNewRequest}
          />
        </TabsContent>
        
        {isManagerOrAdmin && (
          <TabsContent value="admin">
            <AdminDashboard 
              leaveRequests={leaveRequests}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
