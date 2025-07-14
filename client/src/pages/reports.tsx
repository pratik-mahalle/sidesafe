import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle, Clock, MapPin, Phone, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import IncidentForm from "@/components/safety/incident-form";
import { useAuth } from "@/hooks/use-auth";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("report");

  const { data: userIncidents, isLoading } = useQuery({
    queryKey: ['/api/incidents/user/1'],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      case 'investigating':
        return <Badge variant="secondary">Investigating</Badge>;
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'border-l-emergency-red';
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'harassment': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'stalking': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'emergency': return <Phone className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-dark">Safety Reports</h1>
        <p className="text-gray-600">Report incidents and track their status</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">Report Incident</TabsTrigger>
          <TabsTrigger value="history">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-6">
          {/* Quick Report Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-emergency-red cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emergency-red rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600">Emergency Report</h3>
                    <p className="text-sm text-gray-600">Immediate danger or ongoing incident</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-600">General Report</h3>
                    <p className="text-sm text-gray-600">Non-emergency safety concern</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Form */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle>Report Safety Incident</CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentForm />
            </CardContent>
          </Card>

          {/* Safety Resources */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle>Safety Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emergency-red rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium">Emergency Helpline</h4>
                  <p className="text-sm text-gray-600">Call 100 for immediate help</p>
                  <Button size="sm" className="bg-emergency-red hover:bg-red-600">
                    Call 100
                  </Button>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium">Women Helpline</h4>
                  <p className="text-sm text-gray-600">24/7 support for women</p>
                  <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                    Call 1091
                  </Button>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium">Nearest Police Station</h4>
                  <p className="text-sm text-gray-600">Find local police station</p>
                  <Button size="sm" variant="outline">
                    Find Station
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Report Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-dark">
                  {userIncidents?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {userIncidents?.filter(i => i.status === 'pending').length || 0}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {userIncidents?.filter(i => i.status === 'investigating').length || 0}
                </div>
                <div className="text-sm text-gray-600">Investigating</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-safe-green">
                  {userIncidents?.filter(i => i.status === 'resolved').length || 0}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle>Your Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safety-orange mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading reports...</p>
                </div>
              ) : userIncidents?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-gray-600">You haven't submitted any incident reports.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userIncidents?.map((incident) => (
                    <Card key={incident.id} className={`border-l-4 ${getUrgencyColor(incident.urgency)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getTypeIcon(incident.type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium capitalize">{incident.type}</h4>
                                {getStatusBadge(incident.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{incident.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(incident.reportedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {incident.urgency}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
