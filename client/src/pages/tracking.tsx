import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Clock, Shield, Users, Navigation } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AuthWrapper from "@/components/auth/auth-wrapper";

export default function Tracking() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  
  if (!isAuthenticated) {
    return <AuthWrapper onSuccess={() => {}} />;
  }

  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ['/api/family-members/1'],
  });

  const { data: userData } = useQuery({
    queryKey: ['/api/users/1'],
  });

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Location Shared",
            description: `Your location has been shared with family members: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please check permissions.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support location sharing.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-safe-green';
      case 'warning': return 'bg-yellow-500';
      case 'emergency': return 'bg-emergency-red';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'warning': return 'Caution';
      case 'emergency': return 'Emergency';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-dark">Family Tracking</h1>
        <p className="text-gray-600">Keep track of your family members' safety status</p>
      </div>

      {/* Your Location Card */}
      <Card className="border-l-4 border-safety-orange">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Your Location</CardTitle>
          <MapPin className="h-5 w-5 safety-orange" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-safety-orange text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">{user?.location || 'Location not available'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(user?.safetyStatus || 'safe')}`}></div>
                  <span className="text-sm">{getStatusText(user?.safetyStatus || 'safe')}</span>
                </div>
              </div>
            </div>
            <Button onClick={handleLocationShare} variant="outline" size="sm">
              <Navigation className="w-4 h-4 mr-2" />
              Share Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyMembers?.map((member) => (
          <Card 
            key={member.id} 
            className={`safety-card cursor-pointer transition-all ${
              selectedMember === member.id ? 'ring-2 ring-safety-orange' : ''
            }`}
            onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-trustworthy-green text-white">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <p className="text-sm text-gray-500">{member.relationship}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${getStatusColor(member.safetyStatus)}`}></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={member.safetyStatus === 'safe' ? 'default' : 'destructive'}>
                  {getStatusText(member.safetyStatus)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-medium">{member.location || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-sm text-gray-500">
                  {member.lastUpdate ? new Date(member.lastUpdate).toLocaleTimeString() : 'Never'}
                </span>
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${member.phone}`, '_self');
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast({
                      title: "Location Requested",
                      description: `Location request sent to ${member.name}`,
                    });
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Locate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safety Zone Settings */}
      <Card className="safety-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 trustworthy-green" />
            <span>Safety Zone Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Home Safe Zone</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Home</p>
                  <p className="text-sm text-gray-500">500m radius</p>
                </div>
                <div className="w-3 h-3 bg-safe-green rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Work/College Safe Zone</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">College Campus</p>
                  <p className="text-sm text-gray-500">300m radius</p>
                </div>
                <div className="w-3 h-3 bg-safe-green rounded-full"></div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <MapPin className="w-4 h-4 mr-2" />
            Add New Safe Zone
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="safety-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast({
                title: "Check-in Sent",
                description: "Your check-in has been sent to all family members",
              })}
            >
              <Clock className="w-6 h-6" />
              <span>Quick Check-in</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast({
                title: "Location Shared",
                description: "Your current location has been shared with family",
              })}
            >
              <MapPin className="w-6 h-6" />
              <span>Share Location</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast({
                title: "Family Notified",
                description: "All family members have been notified of your safe arrival",
              })}
            >
              <Shield className="w-6 h-6" />
              <span>Safe Arrival</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
