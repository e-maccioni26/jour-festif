
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StoreSelector } from './StoreSelector';
import { LeaveRequest, formatDateRange } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  leaveRequests: LeaveRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  leaveRequests,
  onApproveRequest,
  onRejectRequest
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>();
  const { user, stores } = useAuth();
  const { toast } = useToast();
  
  // Filter leave requests based on user role and selected store
  const filteredRequests = leaveRequests.filter(request => {
    // For admins, filter by selected store if any
    if (user?.role === 'admin') {
      return selectedStoreId ? request.storeId === selectedStoreId : true;
    }
    
    // For managers, only show their store's requests
    if (user?.role === 'manager' && user?.storeId) {
      return request.storeId === user.storeId;
    }
    
    // Default case (shouldn't happen with proper auth)
    return false;
  });
  
  // Sort requests by status (pending first) and date
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    // Pending requests first
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Then sort by creation date (newer first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Handle store selection
  const handleStoreChange = (storeId: string | undefined) => {
    setSelectedStoreId(storeId);
  };
  
  // Handle request approval
  const handleApprove = (id: string) => {
    onApproveRequest(id);
    toast({
      title: "Demande approuvée",
      description: "La demande de congés a été approuvée avec succès.",
    });
  };
  
  // Handle request rejection
  const handleReject = (id: string) => {
    onRejectRequest(id);
    toast({
      title: "Demande refusée",
      description: "La demande de congés a été refusée.",
    });
  };
  
  // Status badge rendering
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Refusé</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">En attente</Badge>;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des demandes</h2>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? "Examinez et gérez les demandes de congés de tous les magasins." 
              : "Examinez et gérez les demandes de congés de votre magasin."}
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
      
      <Card>
        <CardHeader>
          <CardTitle>Demandes de congés</CardTitle>
          <CardDescription>
            {filteredRequests.filter(r => r.status === 'pending').length} demandes en attente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Aucune demande de congés à afficher.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Magasin</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.userName}</TableCell>
                      <TableCell>{request.storeName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDateRange(request.startDate, request.endDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{renderStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(request.id)}
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(request.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
