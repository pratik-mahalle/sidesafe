import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
  Trash2,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone && newContact.relationship) {
      toast({
        title: "Feature Coming Soon",
        description: "Family member tracking will be available soon.",
      });
      setNewContact({ name: "", phone: "", relationship: "" });
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to add a family member.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header */}
      <Card className="safety-card mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-safety-orange text-white text-2xl">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark">{user?.displayName || user?.email || 'User'}</h2>
              <p className="text-gray-600">{user?.email || 'Email not set'}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-safe-green"></div>
                <span className="text-sm capitalize">Safe</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
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
                    value={user?.displayName || ''}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user?.phoneNumber || ''}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value="Maharashtra, India"
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              <Separator />

              {/* Account Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Account Created</Label>
                    <p className="text-sm text-gray-600">{user?.metadata?.creationTime || 'Today'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Sign In</Label>
                    <p className="text-sm text-gray-600">{user?.metadata?.lastSignInTime || 'Today'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Provider</Label>
                    <p className="text-sm text-gray-600">{user?.providerData?.[0]?.providerId || 'Email'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Verified</Label>
                    <Badge variant={user?.emailVerified ? 'default' : 'secondary'}>
                      {user?.emailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Status */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Safety Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-safe-green"></div>
                    <span className="text-sm text-gray-600">Safe</span>
                  </div>
                </div>
                <Badge className="bg-safe-green hover:bg-safe-green">
                  Safe
                </Badge>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Emergency Contacts</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">+91 100 (Police)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">+91 1091 (Women's Helpline)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">+91 181 (Women in Distress)</span>
                  </div>
                </div>
              </div>
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
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-relationship">Relationship</Label>
                  <Input
                    id="contact-relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Mother, Sister"
                  />
                </div>
              </div>
              <Button onClick={handleAddContact} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Family Member
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
              <p className="text-sm text-gray-500 text-center py-8">
                No family members added yet. Add your first family member above to start tracking.
              </p>
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
                  <p className="text-sm text-gray-600">Receive alerts for emergency situations</p>
                </div>
                <Switch id="emergency-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="family-updates">Family Updates</Label>
                  <p className="text-sm text-gray-600">Get notified about family member status changes</p>
                </div>
                <Switch id="family-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="safety-tips">Safety Tips</Label>
                  <p className="text-sm text-gray-600">Receive AI-powered safety recommendations</p>
                </div>
                <Switch id="safety-tips" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-sharing">Location Sharing</Label>
                  <p className="text-sm text-gray-600">Allow family members to see your location</p>
                </div>
                <Switch id="location-sharing" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status-sharing">Status Sharing</Label>
                  <p className="text-sm text-gray-600">Share your safety status with family</p>
                </div>
                <Switch id="status-sharing" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Edit2 className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
