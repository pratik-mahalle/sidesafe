import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, AlertTriangle, Camera, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "@/hooks/use-location";
import { useAuth } from "@/hooks/use-auth";

const incidentSchema = z.object({
  type: z.string().min(1, "Please select an incident type"),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
  location: z.string().min(1, "Location is required"),
  urgency: z.string().min(1, "Please select urgency level"),
  evidence: z.array(z.string()).optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

export default function IncidentForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { location: currentLocation } = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      type: "",
      description: "",
      location: currentLocation || "",
      urgency: "",
      evidence: [],
    },
  });

  const watchedValues = watch();

  const submitIncident = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: user?.id }),
      });
      if (!response.ok) throw new Error('Failed to submit incident');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/user', user?.id] });
      toast({
        title: "Incident Reported",
        description: "Your incident report has been submitted successfully. Authorities will be notified.",
      });
      reset();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit incident report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncidentFormData) => {
    setIsSubmitting(true);
    submitIncident.mutate(data);
    setIsSubmitting(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("location", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast({
            title: "Location Updated",
            description: "Current location has been added to the report.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  const incidentTypes = [
    { value: "harassment", label: "Harassment" },
    { value: "stalking", label: "Stalking" },
    { value: "inappropriate_behavior", label: "Inappropriate Behavior" },
    { value: "threatening", label: "Threatening" },
    { value: "physical_assault", label: "Physical Assault" },
    { value: "verbal_abuse", label: "Verbal Abuse" },
    { value: "suspicious_activity", label: "Suspicious Activity" },
    { value: "other", label: "Other" },
  ];

  const urgencyLevels = [
    { value: "low", label: "Low - General concern" },
    { value: "medium", label: "Medium - Requires attention" },
    { value: "high", label: "High - Urgent response needed" },
    { value: "emergency", label: "Emergency - Immediate action required" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Incident Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type of Incident *</Label>
        <Select onValueChange={(value) => setValue("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select incident type" />
          </SelectTrigger>
          <SelectContent>
            {incidentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Urgency Level */}
      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency Level *</Label>
        <Select onValueChange={(value) => setValue("urgency", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            {urgencyLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.urgency && (
          <p className="text-sm text-red-600">{errors.urgency.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <div className="flex space-x-2">
          <Input
            {...register("location")}
            placeholder="Enter location details"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCurrentLocation}
            className="shrink-0"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Use Current
          </Button>
        </div>
        {errors.location && (
          <p className="text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          {...register("description")}
          placeholder="Provide detailed description of the incident..."
          rows={4}
          className="resize-none"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Evidence Upload Placeholder */}
      <div className="space-y-2">
        <Label>Evidence (Optional)</Label>
        <Card className="border-dashed">
          <CardContent className="p-4 text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Evidence collection feature coming soon
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For now, please describe any evidence in the description field
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alert */}
      {watchedValues.urgency === "emergency" && (
        <Card className="border-l-4 border-l-emergency-red bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Emergency Report</h4>
                <p className="text-sm text-red-700 mt-1">
                  For immediate emergencies, please call 100 (Police) or 1091 (Women Helpline) 
                  before or after submitting this report.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={isSubmitting || submitIncident.isPending}
          className="flex-1 bg-trustworthy-green hover:bg-green-600"
        >
          {isSubmitting || submitIncident.isPending ? "Submitting..." : "Submit Report"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting || submitIncident.isPending}
        >
          Clear Form
        </Button>
      </div>

      {/* Emergency Contacts */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">Emergency Contacts</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Police: 100</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Women Helpline: 1091</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
