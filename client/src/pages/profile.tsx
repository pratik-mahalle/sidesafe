import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  Users, 
  Plus,
  Edit2,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });

  const { data: familyMembers } = useQuery({
    queryKey: ['/api/family-members/1'],
  });

  const addFamilyMember = useMutation({
    mutationFn: async (member: any) => {
      const response = await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, userId: 1 }),
      });
      if (!response.ok) throw new Error('Failed to add family member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-members/1'] });
      setNewContact({ name: "", phone: "", relationship: "" });
      toast({
        title: "Family member added",
        description: "New family member has been added to your tracking list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add family member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone && newContact.relationship) {
      addFamilyMember.mutate(newContact);
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to add a family member.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header */}
      <Card className="safety-card mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-safety-orange text-white text-2xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.phone || 'Phone not set'}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${
                  user?.safetyStatus === 'safe' ? 'bg-safe-green' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm capitalize">{user?.safetyStatus || 'Unknown'}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Personal Information */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user?.name || ''}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user?.phone || ''}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={user?.location || ''}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button className="bg-trustworthy-green hover:bg-green-600">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.emergencyContacts?.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emergency-red rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Emergency Contact {index + 1}</p>
                      <p className="text-sm text-gray-600">{contact}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-gray-600">No emergency contacts configured</p>
                  <Button variant="outline" className="mt-2">
                    Add Emergency Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          {/* Add Family Member */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Family Member</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-name">Name</Label>
                  <Input
                    id="new-name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone">Phone</Label>
                  <Input
                    id="new-phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="new-relationship">Relationship</Label>
                  <Input
                    id="new-relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    placeholder="e.g., Mother, Father, Sister"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddContact}
                disabled={addFamilyMember.isPending}
                className="bg-trustworthy-green hover:bg-green-600"
              >
                {addFamilyMember.isPending ? 'Adding...' : 'Add Family Member'}
              </Button>
            </CardContent>
          </Card>

          {/* Family Members List */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Family Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {familyMembers?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No family members</h3>
                  <p className="text-gray-600">Add family members to enable tracking and safety features.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {familyMembers?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-trustworthy-green text-white">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.relationship}</p>
                          <p className="text-sm text-gray-500">{member.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.safetyStatus === 'safe' ? 'default' : 'destructive'}>
                          {member.safetyStatus}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Notification Settings */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emergency-alerts">Emergency Alerts</Label>
                  <p className="text-sm text-gray-600">Receive notifications for emergency situations</p>
                </div>
                <Switch id="emergency-alerts" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="family-updates">Family Safety Updates</Label>
                  <p className="text-sm text-gray-600">Get notified when family members update their status</p>
                </div>
                <Switch id="family-updates" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-sharing">Location Sharing</Label>
                  <p className="text-sm text-gray-600">Allow family members to see your location</p>
                </div>
                <Switch id="location-sharing" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Safety</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-location">Auto Location Updates</Label>
                  <p className="text-sm text-gray-600">Automatically update your location every 15 minutes</p>
                </div>
                <Switch id="auto-location" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="offline-mode">Offline Mode</Label>
                  <p className="text-sm text-gray-600">Enable offline functionality for limited connectivity</p>
                </div>
                <Switch id="offline-mode" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing">Data Sharing with Authorities</Label>
                  <p className="text-sm text-gray-600">Share incident data with local authorities for better safety</p>
                </div>
                <Switch id="data-sharing" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>App Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                App Preferences
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notification History
              </Button>
              
              <Separator />
              
              <Button variant="destructive" className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
