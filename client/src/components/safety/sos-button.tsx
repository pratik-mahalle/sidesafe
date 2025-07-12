import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "@/hooks/use-location";

export default function SOSButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { location } = useLocation();

  const triggerEmergency = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/emergency-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          location: location || "Location unavailable",
          alertedContacts: ["+919876543211", "+919876543212"]
        }),
      });
      if (!response.ok) throw new Error('Failed to trigger emergency alert');
      return response.json();
    },
    onSuccess: () => {
      setIsActivated(true);
      toast({
        title: "Emergency Alert Sent!",
        description: "Your emergency contacts have been notified with your location.",
      });
      
      // Reset button after 5 seconds
      setTimeout(() => {
        setIsActivated(false);
      }, 5000);
    },
    onError: () => {
      toast({
        title: "Emergency Alert Failed",
        description: "Failed to send emergency alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
    },
  });

  const handleMouseDown = () => {
    setIsPressed(true);
    pressTimerRef.current = setTimeout(() => {
      triggerEmergency.mutate();
    }, 3000);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  return (
    <Button
      className={`sos-button ${isPressed ? 'scale-95' : ''} ${
        isActivated ? 'bg-safe-green hover:bg-green-600' : ''
      } ${triggerEmergency.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={triggerEmergency.isPending || isActivated}
    >
      {isActivated ? (
        <CheckCircle className="w-8 h-8" />
      ) : (
        <AlertTriangle className="w-8 h-8" />
      )}
    </Button>
  );
}
