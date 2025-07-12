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
  const [newStatus, setNewStatus] = useState(user?.safetyStatus || 'safe');

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/users/${user?.id || 1}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1'] });
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
  });

  const handleUpdateStatus = () => {
    if (newStatus !== user?.safetyStatus) {
      updateStatus.mutate(newStatus);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-safe-green';
      case 'caution': return 'text-yellow-500';
      case 'emergency': return 'text-emergency-red';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'caution': return 'Caution';
      case 'emergency': return 'Emergency';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Current Status</span>
        <span className={`font-medium ${getStatusColor(user?.safetyStatus)}`}>
          {getStatusText(user?.safetyStatus)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
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
      
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Location</span>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500 text-sm">
            {user?.location || 'Not available'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Update Status:</label>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={newStatus === 'safe' ? 'default' : 'outline'}
            onClick={() => setNewStatus('safe')}
            className={newStatus === 'safe' ? 'bg-safe-green hover:bg-green-600' : ''}
          >
            Safe
          </Button>
          <Button
            size="sm"
            variant={newStatus === 'caution' ? 'default' : 'outline'}
            onClick={() => setNewStatus('caution')}
            className={newStatus === 'caution' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            Caution
          </Button>
          <Button
            size="sm"
            variant={newStatus === 'emergency' ? 'default' : 'outline'}
            onClick={() => setNewStatus('emergency')}
            className={newStatus === 'emergency' ? 'bg-emergency-red hover:bg-red-600' : ''}
          >
            Emergency
          </Button>
        </div>
      </div>
      
      <Button 
        onClick={handleUpdateStatus}
        disabled={updateStatus.isPending || newStatus === user?.safetyStatus}
        className="w-full bg-trustworthy-green hover:bg-green-600"
        size="sm"
      >
        {updateStatus.isPending ? 'Updating...' : 'Update Status'}
      </Button>
    </div>
  );
}
