import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { IStorage } from "../storage";
import { 
  User, 
  InsertUser, 
  Incident, 
  InsertIncident, 
  FamilyMember, 
  InsertFamilyMember, 
  SafetyRecommendation, 
  EmergencyAlert, 
  InsertEmergencyAlert 
} from "../../shared/schema";

export class FirebaseStorage implements IStorage {
  // Collections
  private readonly users = collection(db, "users");
  private readonly incidents = collection(db, "incidents");
  private readonly familyMembers = collection(db, "familyMembers");
  private readonly recommendations = collection(db, "recommendations");
  private readonly emergencyAlerts = collection(db, "emergencyAlerts");

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const userDoc = await getDoc(doc(this.users, id.toString()));
    if (!userDoc.exists()) return undefined;
    return { id, ...userDoc.data() } as User;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const q = query(this.users, where("phone", "==", phone), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return undefined;
    
    const userDoc = querySnapshot.docs[0];
    return { id: parseInt(userDoc.id), ...userDoc.data() } as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const docRef = await addDoc(this.users, {
      ...user,
      safetyStatus: "safe",
      lastStatusUpdate: Timestamp.now(),
      createdAt: Timestamp.now()
    });
    
    return {
      id: parseInt(docRef.id),
      ...user,
      location: user.location || null,
      emergencyContacts: user.emergencyContacts || null,
      safetyStatus: "safe",
      lastStatusUpdate: new Date(),
      createdAt: new Date()
    };
  }

  async updateUserSafetyStatus(id: number, status: string): Promise<User> {
    const userRef = doc(this.users, id.toString());
    await updateDoc(userRef, {
      safetyStatus: status,
      lastStatusUpdate: Timestamp.now()
    });
    
    const updatedUser = await this.getUser(id);
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }

  async updateUserLocation(id: number, location: string): Promise<User> {
    const userRef = doc(this.users, id.toString());
    await updateDoc(userRef, { location });
    
    const updatedUser = await this.getUser(id);
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    const q = query(this.incidents, orderBy("reportedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
      reportedAt: doc.data().reportedAt?.toDate() || null,
      resolvedAt: doc.data().resolvedAt?.toDate() || null
    })) as Incident[];
  }

  async getIncidentsByUser(userId: number): Promise<Incident[]> {
    const q = query(
      this.incidents, 
      where("userId", "==", userId), 
      orderBy("reportedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
      reportedAt: doc.data().reportedAt?.toDate() || null,
      resolvedAt: doc.data().resolvedAt?.toDate() || null
    })) as Incident[];
  }

  async createIncident(incident: InsertIncident & { userId: number }): Promise<Incident> {
    const docRef = await addDoc(this.incidents, {
      ...incident,
      status: "pending",
      reportedAt: Timestamp.now(),
      resolvedAt: null
    });
    
    return {
      id: parseInt(docRef.id),
      ...incident,
      evidence: incident.evidence || null,
      status: "pending",
      reportedAt: new Date(),
      resolvedAt: null
    };
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident> {
    const incidentRef = doc(this.incidents, id.toString());
    const updateData: any = { status };
    
    if (status === "resolved") {
      updateData.resolvedAt = Timestamp.now();
    }
    
    await updateDoc(incidentRef, updateData);
    
    const updatedIncident = await getDoc(incidentRef);
    if (!updatedIncident.exists()) throw new Error("Incident not found");
    
    return {
      id,
      ...updatedIncident.data(),
      reportedAt: updatedIncident.data().reportedAt?.toDate() || null,
      resolvedAt: updatedIncident.data().resolvedAt?.toDate() || null
    } as Incident;
  }

  // Family Members
  async getFamilyMembers(userId: number): Promise<FamilyMember[]> {
    const q = query(this.familyMembers, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
      lastUpdate: doc.data().lastUpdate?.toDate() || null
    })) as FamilyMember[];
  }

  async createFamilyMember(member: InsertFamilyMember & { userId: number }): Promise<FamilyMember> {
    const docRef = await addDoc(this.familyMembers, {
      ...member,
      safetyStatus: "safe",
      lastUpdate: Timestamp.now()
    });
    
    return {
      id: parseInt(docRef.id),
      ...member,
      location: member.location || null,
      safetyStatus: "safe",
      lastUpdate: new Date()
    };
  }

  async updateFamilyMemberStatus(id: number, status: string, location?: string): Promise<FamilyMember> {
    const memberRef = doc(this.familyMembers, id.toString());
    const updateData: any = {
      safetyStatus: status,
      lastUpdate: Timestamp.now()
    };
    
    if (location) {
      updateData.location = location;
    }
    
    await updateDoc(memberRef, updateData);
    
    const updatedMember = await getDoc(memberRef);
    if (!updatedMember.exists()) throw new Error("Family member not found");
    
    return {
      id,
      ...updatedMember.data(),
      lastUpdate: updatedMember.data().lastUpdate?.toDate() || null
    } as FamilyMember;
  }

  // Safety Recommendations
  async getRecommendations(userId: number): Promise<SafetyRecommendation[]> {
    const q = query(
      this.recommendations, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      validUntil: doc.data().validUntil?.toDate() || null
    })) as SafetyRecommendation[];
  }

  async createRecommendation(recommendation: Omit<SafetyRecommendation, 'id' | 'createdAt'>): Promise<SafetyRecommendation> {
    const docRef = await addDoc(this.recommendations, {
      ...recommendation,
      createdAt: Timestamp.now(),
      validUntil: recommendation.validUntil ? Timestamp.fromDate(recommendation.validUntil) : null
    });
    
    return {
      id: parseInt(docRef.id),
      ...recommendation,
      createdAt: new Date()
    };
  }

  // Emergency Alerts
  async getActiveAlerts(): Promise<EmergencyAlert[]> {
    const q = query(this.emergencyAlerts, where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      resolvedAt: doc.data().resolvedAt?.toDate() || null
    })) as EmergencyAlert[];
  }

  async createEmergencyAlert(alert: InsertEmergencyAlert & { userId: number }): Promise<EmergencyAlert> {
    const docRef = await addDoc(this.emergencyAlerts, {
      ...alert,
      status: "active",
      createdAt: Timestamp.now(),
      resolvedAt: null
    });
    
    return {
      id: parseInt(docRef.id),
      ...alert,
      alertedContacts: alert.alertedContacts || null,
      status: "active",
      createdAt: new Date(),
      resolvedAt: null
    };
  }

  async resolveEmergencyAlert(id: number): Promise<EmergencyAlert> {
    const alertRef = doc(this.emergencyAlerts, id.toString());
    await updateDoc(alertRef, {
      status: "resolved",
      resolvedAt: Timestamp.now()
    });
    
    const updatedAlert = await getDoc(alertRef);
    if (!updatedAlert.exists()) throw new Error("Emergency alert not found");
    
    return {
      id,
      ...updatedAlert.data(),
      createdAt: updatedAlert.data().createdAt?.toDate() || null,
      resolvedAt: updatedAlert.data().resolvedAt?.toDate() || null
    } as EmergencyAlert;
  }
}