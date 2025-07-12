import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Lightbulb, Shield, Clock, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface RecommendationsProps {
  userId: number;
}

export default function Recommendations({ userId }: RecommendationsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations', userId],
  });

  const { data: recentIncidents } = useQuery({
    queryKey: ['/api/incidents'],
  });

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          location: "Maharashtra, India",
          recentIncidents: recentIncidents?.slice(0, 5) || []
        }),
      });
      if (!response.ok) throw new Error('Failed to generate recommendations');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', userId] });
      toast({
        title: "Recommendations Updated",
        description: "New AI-powered safety recommendations have been generated.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate new recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    await generateRecommendations.mutateAsync();
    setIsGenerating(false);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'route': return <MapPin className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'general': return <Shield className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-green-400 bg-green-50';
      default: return 'border-l-blue-400 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>;
      case 'medium': return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low': return <Badge variant="default">Low Priority</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border-l-4 border-l-gray-200 p-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          AI-powered recommendations based on your location and recent incidents
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateRecommendations}
          disabled={isGenerating || generateRecommendations.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              Generate personalized safety recommendations based on your location and recent incidents.
            </p>
            <Button 
              onClick={handleGenerateRecommendations}
              disabled={isGenerating || generateRecommendations.isPending}
              className="bg-safety-orange hover:bg-orange-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className={`border-l-4 ${getRecommendationColor(rec.priority)}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 ${
                    rec.priority === 'high' ? 'text-red-600' :
                    rec.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${
                        rec.priority === 'high' ? 'text-red-800' :
                        rec.priority === 'medium' ? 'text-yellow-800' :
                        'text-green-800'
                      }`}>
                        {rec.title}
                      </h4>
                      {getPriorityBadge(rec.priority)}
                    </div>
                    <p className={`text-sm mt-1 ${
                      rec.priority === 'high' ? 'text-red-700' :
                      rec.priority === 'medium' ? 'text-yellow-700' :
                      'text-green-700'
                    }`}>
                      {rec.description}
                    </p>
                    {rec.location && (
                      <div className="flex items-center space-x-1 mt-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{rec.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Emergency Notice */}
      <Card className="border-l-4 border-l-emergency-red bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Emergency Reminder</h4>
              <p className="text-sm text-red-700 mt-1">
                For immediate emergencies, always call 100 (Police) or 1091 (Women Helpline) first.
                These recommendations are for general safety awareness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
