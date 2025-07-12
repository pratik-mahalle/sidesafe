import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  MapPin, 
  Clock,
  Brain,
  CheckCircle,
  XCircle
} from "lucide-react";

import SOSButton from "@/components/safety/sos-button";
import SafetyStatus from "@/components/safety/safety-status";
import FamilyTracking from "@/components/safety/family-tracking";
import Recommendations from "@/components/safety/recommendations";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthWrapper onSuccess={() => {}} />;
  }

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents'],
  });

  const { data: activeAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/emergency-alerts'],
  });

  const emergencyContacts = [
    { name: "Police", number: "100", icon: Phone, color: "bg-emergency-red" },
    { name: "Women Helpline", number: "1091", icon: Shield, color: "bg-pink-500" },
    { name: "Rajesh Sharma", number: "+91 98765 43210", icon: Users, color: "bg-trustworthy-green" },
  ];

  const safetyTips = [
    { icon: MapPin, title: "Share Your Location", description: "Always inform family about your whereabouts" },
    { icon: Users, title: "Travel in Groups", description: "Especially during early morning or late evening hours" },
    { icon: Phone, title: "Keep Phone Charged", description: "Ensure your device is always ready for emergencies" },
    { icon: Shield, title: "Stay Alert", description: "Be aware of your surroundings at all times" },
  ];

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Emergency SOS Section */}
      <Card className="border-l-4 border-emergency-red">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold emergency-red">Emergency SOS</h2>
            <p className="text-gray-600">Press and hold for 3 seconds to send emergency alert</p>
            <SOSButton />
            <p className="text-sm text-gray-500">
              Emergency contacts: {userData?.emergencyContacts?.length || 0} configured
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Safety Status Card */}
        <Card className="safety-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Safety Status</CardTitle>
            <div className={`status-indicator ${userData?.safetyStatus || 'safe'}`}></div>
          </CardHeader>
          <CardContent>
            <SafetyStatus user={userData} />
          </CardContent>
        </Card>

        {/* Family Tracking Card */}
        <Card className="safety-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Family Tracking</CardTitle>
            <Users className="h-5 w-5 trustworthy-green" />
          </CardHeader>
          <CardContent>
            <FamilyTracking userId={1} />
          </CardContent>
        </Card>

        {/* Report Incident Card */}
        <Card className="safety-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Report Incident</CardTitle>
            <FileText className="h-5 w-5 safety-orange" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Report safety incidents to help authorities take action
            </p>
            <div className="space-y-2">
              <Link href="/reports">
                <Button className="w-full bg-emergency-red hover:bg-red-600" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Urgent Report
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="w-full bg-gray-500 hover:bg-gray-600" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  General Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Safety Recommendations */}
      <Card className="safety-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">AI Safety Recommendations</CardTitle>
          <Brain className="h-6 w-6 safety-orange" />
        </CardHeader>
        <CardContent>
          <Recommendations userId={1} />
        </CardContent>
      </Card>

      {/* Recent Incidents Dashboard */}
      <Card className="safety-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Recent Incidents</CardTitle>
          <Link href="/authority">
            <Badge variant="destructive">
              {incidents?.filter(i => i.status === 'pending').length || 0} Pending
            </Badge>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidentsLoading ? (
              <div className="text-center py-4">Loading incidents...</div>
            ) : incidents?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No incidents reported</div>
            ) : (
              <div className="space-y-2">
                {incidents?.slice(0, 3).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        incident.status === 'resolved' ? 'bg-safe-green' : 
                        incident.status === 'investigating' ? 'bg-yellow-500' : 'bg-emergency-red'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm">{incident.type}</p>
                        <p className="text-xs text-gray-500">{incident.location}</p>
                      </div>
                    </div>
                    <Badge variant={incident.status === 'resolved' ? 'default' : 'destructive'}>
                      {incident.status}
                    </Badge>
                  </div>
                ))}
                <Link href="/authority">
                  <Button variant="outline" className="w-full mt-2">
                    View All Incidents
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contacts */}
        <Card className="safety-card">
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${contact.color} rounded-full flex items-center justify-center`}>
                    <contact.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">
                      {contact.name === "Police" ? "Emergency Services" : 
                       contact.name === "Women Helpline" ? "24/7 Support" : "Personal Contact"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium ${
                    contact.name === "Police" ? "emergency-red" :
                    contact.name === "Women Helpline" ? "text-pink-500" : "trustworthy-green"
                  }`}
                  onClick={() => window.open(`tel:${contact.number}`, '_self')}
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="safety-card">
          <CardHeader>
            <CardTitle>Safety Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <tip.icon className="w-5 h-5 safety-orange mt-1" />
                <div>
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-xs text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
