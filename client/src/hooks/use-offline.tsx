import { useState, useEffect } from "react";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync offline data when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    try {
      // Get offline data from localStorage
      const offlineData = localStorage.getItem('offlineData');
      if (offlineData) {
        const data = JSON.parse(offlineData);
        
        // Sync incidents
        if (data.incidents && data.incidents.length > 0) {
          for (const incident of data.incidents) {
            try {
              await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(incident),
              });
            } catch (error) {
              console.error('Failed to sync incident:', error);
            }
          }
        }

        // Sync status updates
        if (data.statusUpdates && data.statusUpdates.length > 0) {
          for (const update of data.statusUpdates) {
            try {
              await fetch(`/api/users/${update.userId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: update.status }),
              });
            } catch (error) {
              console.error('Failed to sync status update:', error);
            }
          }
        }

        // Clear offline data after successful sync
        localStorage.removeItem('offlineData');
        console.log('Offline data synced successfully');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  return { isOnline, syncOfflineData };
}
