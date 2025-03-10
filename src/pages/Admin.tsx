
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '../components/AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest, generateMockLeaveRequests } from '../utils/dateUtils';

const Admin = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  // Load mock data on component mount
  useEffect(() => {
    setLeaveRequests(generateMockLeaveRequests());
  }, []);
  
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
  
  // Redirect if not admin or manager
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
        <p className="text-muted-foreground">
          Gérez les demandes de congés de vos employés
        </p>
      </div>
      
      <AdminDashboard 
        leaveRequests={leaveRequests}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
      />
    </div>
  );
};

export default Admin;
