import { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Hook for real-time user data
export function useFirebaseUser(userId: number) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userRef = doc(db, 'users', userId.toString());
    const unsubscribe = onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          setUser({ id: userId, ...doc.data() });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { user, loading, error };
}

// Hook for real-time incidents
export function useFirebaseIncidents(userId?: number) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q;
    if (userId) {
      q = query(
        collection(db, 'incidents'),
        where('userId', '==', userId),
        orderBy('reportedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'incidents'),
        orderBy('reportedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const incidentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          reportedAt: doc.data().reportedAt?.toDate() || null,
          resolvedAt: doc.data().resolvedAt?.toDate() || null
        }));
        setIncidents(incidentsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { incidents, loading, error };
}

// Hook for real-time family members
export function useFirebaseFamilyMembers(userId: number) {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'familyMembers'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastUpdate: doc.data().lastUpdate?.toDate() || null
        }));
        setFamilyMembers(membersData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { familyMembers, loading, error };
}

// Hook for real-time emergency alerts
export function useFirebaseEmergencyAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'emergencyAlerts'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null,
          resolvedAt: doc.data().resolvedAt?.toDate() || null
        }));
        setAlerts(alertsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { alerts, loading, error };
}

// Hook for real-time recommendations
export function useFirebaseRecommendations(userId: number) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'recommendations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const recsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null,
          validUntil: doc.data().validUntil?.toDate() || null
        }));
        setRecommendations(recsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { recommendations, loading, error };
}

// Utility functions for Firebase operations
export const firebaseOperations = {
  // Add incident
  addIncident: async (incidentData: any) => {
    return await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      status: 'pending',
      reportedAt: Timestamp.now(),
      resolvedAt: null
    });
  },

  // Update user status
  updateUserStatus: async (userId: number, status: string) => {
    const userRef = doc(db, 'users', userId.toString());
    return await updateDoc(userRef, {
      safetyStatus: status,
      lastStatusUpdate: Timestamp.now()
    });
  },

  // Add emergency alert
  addEmergencyAlert: async (alertData: any) => {
    return await addDoc(collection(db, 'emergencyAlerts'), {
      ...alertData,
      status: 'active',
      createdAt: Timestamp.now(),
      resolvedAt: null
    });
  },

  // Add family member
  addFamilyMember: async (memberData: any) => {
    return await addDoc(collection(db, 'familyMembers'), {
      ...memberData,
      safetyStatus: 'safe',
      lastUpdate: Timestamp.now()
    });
  }
};