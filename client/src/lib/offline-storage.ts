interface OfflineIncident {
  type: string;
  description: string;
  location: string;
  urgency: string;
  userId: number;
  timestamp: string;
}

interface OfflineStatusUpdate {
  userId: number;
  status: string;
  timestamp: string;
}

interface OfflineData {
  incidents: OfflineIncident[];
  statusUpdates: OfflineStatusUpdate[];
  emergencyAlerts: any[];
}

export class OfflineStorage {
  private static STORAGE_KEY = 'offlineData';

  static getOfflineData(): OfflineData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading offline data:', error);
    }
    
    return {
      incidents: [],
      statusUpdates: [],
      emergencyAlerts: []
    };
  }

  static saveOfflineData(data: OfflineData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  static addOfflineIncident(incident: Omit<OfflineIncident, 'timestamp'>): void {
    const data = this.getOfflineData();
    data.incidents.push({
      ...incident,
      timestamp: new Date().toISOString()
    });
    this.saveOfflineData(data);
  }

  static addOfflineStatusUpdate(update: Omit<OfflineStatusUpdate, 'timestamp'>): void {
    const data = this.getOfflineData();
    data.statusUpdates.push({
      ...update,
      timestamp: new Date().toISOString()
    });
    this.saveOfflineData(data);
  }

  static addOfflineEmergencyAlert(alert: any): void {
    const data = this.getOfflineData();
    data.emergencyAlerts.push({
      ...alert,
      timestamp: new Date().toISOString()
    });
    this.saveOfflineData(data);
  }

  static clearOfflineData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  static hasOfflineData(): boolean {
    const data = this.getOfflineData();
    return data.incidents.length > 0 || 
           data.statusUpdates.length > 0 || 
           data.emergencyAlerts.length > 0;
  }
}

// Enhanced API request function with offline support
export async function apiRequestWithOffline(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    // If offline, store the request for later sync
    if (!navigator.onLine) {
      console.log('Offline: storing request for later sync');
      
      if (options.method === 'POST' && url.includes('/api/incidents')) {
        const body = JSON.parse(options.body as string);
        OfflineStorage.addOfflineIncident(body);
      } else if (options.method === 'PUT' && url.includes('/status')) {
        const body = JSON.parse(options.body as string);
        const userId = parseInt(url.split('/')[2]);
        OfflineStorage.addOfflineStatusUpdate({
          userId,
          status: body.status
        });
      } else if (options.method === 'POST' && url.includes('/emergency-alerts')) {
        const body = JSON.parse(options.body as string);
        OfflineStorage.addOfflineEmergencyAlert(body);
      }
      
      // Return a mock successful response for offline operations
      return new Response(JSON.stringify({ success: true, offline: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}
