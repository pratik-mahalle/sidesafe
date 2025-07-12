import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone, 
  FileText, 
  TrendingUp, 
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import AuthWrapper from "@/components/auth/auth-wrapper";

export default function AuthorityDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  
  if (!isAuthenticated) {
    return <AuthWrapper onSuccess={() => {}} />;
  }

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents'],
  });

  const { data: activeAlerts } = useQuery({
    queryKey: ['/api/emergency-alerts'],
  });

  const updateIncidentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update incident status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      toast({
        title: "Status Updated",
        description: "Incident status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update incident status. Please try again.",
        variant: "destructive",
      });
    },
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

  const filteredIncidents = incidents?.filter(incident => {
    if (statusFilter === 'all') return true;
    return incident.status === statusFilter;
  });

  const stats = {
    total: incidents?.length || 0,
    pending: incidents?.filter(i => i.status === 'pending').length || 0,
    investigating: incidents?.filter(i => i.status === 'investigating').length || 0,
    resolved: incidents?.filter(i => i.status === 'resolved').length || 0,
    activeAlerts: activeAlerts?.length || 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-dark">Authority Dashboard</h1>
        <p className="text-gray-600">Monitor and respond to safety incidents</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-dark">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-red-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-yellow-600">{stats.investigating}</div>
                <div className="text-sm text-gray-600">Investigating</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-safe-green">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-emergency-red">{stats.activeAlerts}</div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents?.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        incident.status === 'resolved' ? 'bg-safe-green' : 
                        incident.status === 'investigating' ? 'bg-yellow-500' : 'bg-emergency-red'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm capitalize">{incident.type}</p>
                        <p className="text-xs text-gray-500">{incident.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(incident.status)}
                      <p className="text-xs text-gray-500 mt-1">{formatDate(incident.reportedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="safety-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-medium">Emergency Response</h3>
                <p className="text-sm text-gray-600">Immediate action required</p>
              </CardContent>
            </Card>
            
            <Card className="safety-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium">Safety Analytics</h3>
                <p className="text-sm text-gray-600">View trends and patterns</p>
              </CardContent>
            </Card>
            
            <Card className="safety-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-trustworthy-green" />
                <h3 className="font-medium">Community Outreach</h3>
                <p className="text-sm text-gray-600">Safety awareness programs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          {/* Filters */}
          <Card className="safety-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <Label htmlFor="status-filter">Filter by Status:</Label>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Incidents List */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safety-orange mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading incidents...</p>
                </div>
              ) : filteredIncidents?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                  <p className="text-gray-600">No incidents match the selected criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIncidents?.map((incident) => (
                    <Card key={incident.id} className={`border-l-4 ${getUrgencyColor(incident.urgency)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium capitalize">{incident.type}</h4>
                              {getStatusBadge(incident.status)}
                              <Badge variant="outline" className="capitalize">
                                {incident.urgency}
                              </Badge>
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
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedIncident(incident)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            {incident.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-trustworthy-green hover:bg-green-600"
                                onClick={() => updateIncidentStatus.mutate({ id: incident.id, status: 'investigating' })}
                                disabled={updateIncidentStatus.isPending}
                              >
                                Start Investigation
                              </Button>
                            )}
                            {incident.status === 'investigating' && (
                              <Button
                                size="sm"
                                className="bg-safe-green hover:bg-green-600"
                                onClick={() => updateIncidentStatus.mutate({ id: incident.id, status: 'resolved' })}
                                disabled={updateIncidentStatus.isPending}
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Active Emergency Alerts */}
          <Card className="safety-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Active Emergency Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAlerts?.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active alerts</h3>
                  <p className="text-gray-600">There are currently no emergency alerts requiring attention.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts?.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-emergency-red">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-red-600">Emergency Alert</h4>
                              <Badge variant="destructive">{alert.status}</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{alert.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(alert.createdAt)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Contacts alerted: {alert.alertedContacts?.length || 0}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                            <Button
                              size="sm"
                              className="bg-safe-green hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          </div>
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
