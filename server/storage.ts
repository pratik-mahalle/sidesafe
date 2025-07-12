import { 
  users, incidents, familyMembers, safetyRecommendations, emergencyAlerts,
  type User, type InsertUser, type Incident, type InsertIncident, 
  type FamilyMember, type InsertFamilyMember, type SafetyRecommendation, 
  type EmergencyAlert, type InsertEmergencyAlert
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSafetyStatus(id: number, status: string): Promise<User>;
  updateUserLocation(id: number, location: string): Promise<User>;

  // Incidents
  getIncidents(): Promise<Incident[]>;
  getIncidentsByUser(userId: number): Promise<Incident[]>;
  createIncident(incident: InsertIncident & { userId: number }): Promise<Incident>;
  updateIncidentStatus(id: number, status: string): Promise<Incident>;

  // Family Members
  getFamilyMembers(userId: number): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember & { userId: number }): Promise<FamilyMember>;
  updateFamilyMemberStatus(id: number, status: string, location?: string): Promise<FamilyMember>;

  // Safety Recommendations
  getRecommendations(userId: number): Promise<SafetyRecommendation[]>;
  createRecommendation(recommendation: Omit<SafetyRecommendation, 'id' | 'createdAt'>): Promise<SafetyRecommendation>;

  // Emergency Alerts
  getActiveAlerts(): Promise<EmergencyAlert[]>;
  createEmergencyAlert(alert: InsertEmergencyAlert & { userId: number }): Promise<EmergencyAlert>;
  resolveEmergencyAlert(id: number): Promise<EmergencyAlert>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private incidents: Map<number, Incident> = new Map();
  private familyMembers: Map<number, FamilyMember> = new Map();
  private recommendations: Map<number, SafetyRecommendation> = new Map();
  private emergencyAlerts: Map<number, EmergencyAlert> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const user1: User = {
      id: 1,
      name: "Priya Sharma",
      phone: "+919876543210",
      emergencyContacts: ["+919876543211", "+919876543212"],
      location: "Pune, Maharashtra",
      safetyStatus: "safe",
      lastStatusUpdate: new Date(),
      createdAt: new Date()
    };
    this.users.set(1, user1);

    // Create sample family members
    const family1: FamilyMember = {
      id: 1,
      userId: 1,
      name: "Anita Devi",
      phone: "+919876543211",
      relationship: "Mother",
      location: "Nashik, Maharashtra",
      safetyStatus: "safe",
      lastUpdate: new Date()
    };
    this.familyMembers.set(1, family1);

    const family2: FamilyMember = {
      id: 2,
      userId: 1,
      name: "Rajesh Sharma",
      phone: "+919876543212",
      relationship: "Father",
      location: "Pune, Maharashtra",
      safetyStatus: "safe",
      lastUpdate: new Date()
    };
    this.familyMembers.set(2, family2);

    // Create sample incidents
    const incident1: Incident = {
      id: 1,
      userId: 1,
      type: "harassment",
      description: "Inappropriate comments from unknown person near college campus",
      location: "Pune University Campus",
      urgency: "medium",
      status: "pending",
      reportedAt: new Date(),
      resolvedAt: null,
      evidence: []
    };
    this.incidents.set(1, incident1);

    this.currentId = 3;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      location: insertUser.location || null,
      emergencyContacts: insertUser.emergencyContacts ? insertUser.emergencyContacts as string[] : null,
      safetyStatus: "safe",
      lastStatusUpdate: new Date(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSafetyStatus(id: number, status: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, safetyStatus: status, lastStatusUpdate: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserLocation(id: number, location: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, location };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).sort((a, b) => 
      new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime()
    );
  }

  async getIncidentsByUser(userId: number): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.userId === userId)
      .sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime());
  }

  async createIncident(incident: InsertIncident & { userId: number }): Promise<Incident> {
    const id = this.currentId++;
    const newIncident: Incident = {
      ...incident,
      id,
      userId: incident.userId,
      status: "pending",
      reportedAt: new Date(),
      resolvedAt: null,
      evidence: incident.evidence ? incident.evidence as string[] : null
    };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident> {
    const incident = this.incidents.get(id);
    if (!incident) throw new Error("Incident not found");
    
    const updatedIncident = { 
      ...incident, 
      status,
      resolvedAt: status === "resolved" ? new Date() : null
    };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // Family Members
  async getFamilyMembers(userId: number): Promise<FamilyMember[]> {
    return Array.from(this.familyMembers.values()).filter(member => member.userId === userId);
  }

  async createFamilyMember(member: InsertFamilyMember & { userId: number }): Promise<FamilyMember> {
    const id = this.currentId++;
    const newMember: FamilyMember = {
      ...member,
      id,
      userId: member.userId,
      location: member.location || null,
      safetyStatus: "safe",
      lastUpdate: new Date()
    };
    this.familyMembers.set(id, newMember);
    return newMember;
  }

  async updateFamilyMemberStatus(id: number, status: string, location?: string): Promise<FamilyMember> {
    const member = this.familyMembers.get(id);
    if (!member) throw new Error("Family member not found");
    
    const updatedMember = { 
      ...member, 
      safetyStatus: status,
      location: location || member.location,
      lastUpdate: new Date()
    };
    this.familyMembers.set(id, updatedMember);
    return updatedMember;
  }

  // Safety Recommendations
  async getRecommendations(userId: number): Promise<SafetyRecommendation[]> {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createRecommendation(recommendation: Omit<SafetyRecommendation, 'id' | 'createdAt'>): Promise<SafetyRecommendation> {
    const id = this.currentId++;
    const newRec: SafetyRecommendation = {
      ...recommendation,
      id,
      createdAt: new Date()
    };
    this.recommendations.set(id, newRec);
    return newRec;
  }

  // Emergency Alerts
  async getActiveAlerts(): Promise<EmergencyAlert[]> {
    return Array.from(this.emergencyAlerts.values()).filter(alert => alert.status === "active");
  }

  async createEmergencyAlert(alert: InsertEmergencyAlert & { userId: number }): Promise<EmergencyAlert> {
    const id = this.currentId++;
    const newAlert: EmergencyAlert = {
      ...alert,
      id,
      userId: alert.userId,
      status: "active",
      createdAt: new Date(),
      resolvedAt: null,
      alertedContacts: alert.alertedContacts ? alert.alertedContacts as string[] : null
    };
    this.emergencyAlerts.set(id, newAlert);
    return newAlert;
  }

  async resolveEmergencyAlert(id: number): Promise<EmergencyAlert> {
    const alert = this.emergencyAlerts.get(id);
    if (!alert) throw new Error("Emergency alert not found");
    
    const updatedAlert = { 
      ...alert, 
      status: "resolved",
      resolvedAt: new Date()
    };
    this.emergencyAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

export const storage = new MemStorage();
