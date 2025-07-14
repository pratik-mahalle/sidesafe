import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Clock, MapPin } from "lucide-react";

interface SafetyStatusProps {
  user: any;
}

export default function SafetyStatus({ user }: SafetyStatusProps) {
  // State to track pending status changes before API call
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  
  // Current status shows pending status if available, otherwise user's current status
  const currentStatus = pendingStatus ?? user?.safetyStatus ?? 'safe';

  // React Query mutation for updating safety status
  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/users/${user?.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      toast({
        title: "Status Updated",
        description: "Your safety status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update safety status. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Clear pending status after mutation completes (success or error)
      setPendingStatus(null);
    }
  });

  // Handle status update button click
  const handleUpdateStatus = () => {
    if (currentStatus !== user?.safetyStatus) {
      updateStatus.mutate(currentStatus);
    }
  };

  // Handle status selection with immediate feedback
  const handleStatusSelect = (status: string) => {
    setPendingStatus(status);
  };

  // Get color class for status display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-500';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  // Get background color for status display
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-50 border-green-200';
      case 'caution': return 'bg-yellow-50 border-yellow-200';
      case 'emergency': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Get human-readable status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'caution': return 'Caution';
      case 'emergency': return 'Emergency';
      default: return 'Unknown';
    }
  };

  // Get button styling for status selection
  const getButtonStyle = (status: string) => {
    if (currentStatus === status) {
      switch (status) {
        case 'safe': return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
        case 'caution': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500';
        case 'emergency': return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
        default: return '';
      }
    }
    return 'hover:bg-gray-50';
  };

  // Check if there's a pending change
  const hasPendingChange = pendingStatus !== null && pendingStatus !== user?.safetyStatus;

  return (
    <div className="space-y-4">
      {/* Current Status Display with Enhanced Visual Feedback */}
      <div className={`p-3 rounded-lg border ${getStatusBgColor(currentStatus)} transition-all duration-200`}>
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Current Status</span>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold text-lg ${getStatusColor(currentStatus)}`}>
              {getStatusText(currentStatus)}
            </span>
            {hasPendingChange && (
              <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 bg-amber-50 animate-pulse">
                Pending
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Last Updated Time */}
      <div className="flex justify-between items-center py-2">
        <span className="text-gray-600">Last Updated</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500 text-sm">
            {user?.lastStatusUpdate 
              ? new Date(user.lastStatusUpdate).toLocaleTimeString()
              : 'Never'
            }
          </span>
        </div>
      </div>
      
      {/* Location Display */}
      <div className="flex justify-between items-center py-2">
        <span className="text-gray-600">Location</span>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500 text-sm">
            {user?.location || 'Not available'}
          </span>
        </div>
      </div>
      
      {/* Status Selection Buttons */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Update Status:</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant={currentStatus === 'safe' ? 'default' : 'outline'}
            onClick={() => handleStatusSelect('safe')}
            className={`${getButtonStyle('safe')} transition-all duration-200 relative`}
            disabled={updateStatus.isPending}
          >
            Safe
            {currentStatus === 'safe' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </Button>
          <Button
            size="sm"
            variant={currentStatus === 'caution' ? 'default' : 'outline'}
            onClick={() => handleStatusSelect('caution')}
            className={`${getButtonStyle('caution')} transition-all duration-200 relative`}
            disabled={updateStatus.isPending}
          >
            Caution
            {currentStatus === 'caution' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
            )}
          </Button>
          <Button
            size="sm"
            variant={currentStatus === 'emergency' ? 'default' : 'outline'}
            onClick={() => handleStatusSelect('emergency')}
            className={`${getButtonStyle('emergency')} transition-all duration-200 relative`}
            disabled={updateStatus.isPending}
          >
            Emergency
            {currentStatus === 'emergency' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </Button>
        </div>
      </div>
      
      {/* Update Status Button - Only show when there's a pending change */}
      {hasPendingChange && (
        <Button 
          onClick={handleUpdateStatus}
          disabled={updateStatus.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          size="sm"
        >
          {updateStatus.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Updating...</span>
            </div>
          ) : (
            'Confirm Status Update'
          )}
        </Button>
      )}
      
      {/* Status Change Hint */}
      {!hasPendingChange && (
        <p className="text-xs text-gray-500 text-center">
          Select a status above to update your safety status
        </p>
      )}
    </div>
  );
}