import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Clock, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface FamilyTrackingProps {
  userId: number;
}

export default function FamilyTracking({ userId }: FamilyTrackingProps) {
  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ['/api/family-members', userId],
  });

  const handleCallMember = (phone: string, name: string) => {
    window.open(`tel:${phone}`, '_self');
    toast({
      title: "Calling...",
      description: `Calling ${name}`,
    });
  };

  const handleRequestLocation = (name: string) => {
    toast({
      title: "Location Requested",
      description: `Location request sent to ${name}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-safe-green';
      case 'caution': return 'bg-yellow-500';
      case 'emergency': return 'bg-emergency-red';
      default: return 'bg-gray-500';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center space-x-3 p-2 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!familyMembers || familyMembers.length === 0) {
    return (
      <div className="text-center py-4">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm mb-2">No family members added</p>
        <Link href="/profile">
          <Button variant="outline" size="sm">
            Add Family Members
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {familyMembers.slice(0, 3).map((member) => (
        <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-trustworthy-green text-white text-sm">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{member.name}</p>
              <p className="text-xs text-gray-500">{member.location || 'Location not available'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(member.safetyStatus)}`}></div>
                <span className="text-xs text-gray-500">
                  {member.lastUpdate ? formatTime(member.lastUpdate) : 'Never'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(member.safetyStatus)}`}></div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={() => handleCallMember(member.phone, member.name)}
            >
              <Phone className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
      
      {familyMembers.length > 3 && (
        <div className="text-center">
          <Link href="/tracking">
            <Button variant="ghost" size="sm" className="text-xs">
              View All ({familyMembers.length})
            </Button>
          </Link>
        </div>
      )}
      
      <Link href="/tracking">
        <Button 
          className="w-full bg-safety-orange hover:bg-orange-600 text-white"
          size="sm"
        >
          <MapPin className="w-4 h-4 mr-2" />
          View Family Map
        </Button>
      </Link>
    </div>
  );
}
