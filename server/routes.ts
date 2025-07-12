import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, insertFamilyMemberSchema, insertEmergencyAlertSchema } from "@shared/schema";
import { generateSafetyRecommendations } from "./services/gemini";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.string(),
  location: z.string().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.put("/api/users/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, location } = updateStatusSchema.parse(req.body);
      
      let user = await storage.updateUserSafetyStatus(id, status);
      if (location) {
        user = await storage.updateUserLocation(id, location);
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Incidents
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get incidents" });
    }
  });

  app.get("/api/incidents/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const incidents = await storage.getIncidentsByUser(userId);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user incidents" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const userId = req.body.userId || 1; // Default to user 1 for demo
      
      const incident = await storage.createIncident({ ...validatedData, userId });
      res.status(201).json(incident);
    } catch (error) {
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  app.put("/api/incidents/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const incident = await storage.updateIncidentStatus(id, status);
      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: "Failed to update incident status" });
    }
  });

  // Family Members
  app.get("/api/family-members/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const members = await storage.getFamilyMembers(userId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to get family members" });
    }
  });

  app.post("/api/family-members", async (req, res) => {
    try {
      const validatedData = insertFamilyMemberSchema.parse(req.body);
      const userId = req.body.userId || 1; // Default to user 1 for demo
      
      const member = await storage.createFamilyMember({ ...validatedData, userId });
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to create family member" });
    }
  });

  app.put("/api/family-members/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, location } = req.body;
      
      const member = await storage.updateFamilyMemberStatus(id, status, location);
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to update family member status" });
    }
  });

  // Safety Recommendations
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recommendations = await storage.getRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { userId, location, recentIncidents } = req.body;
      
      const recommendations = await generateSafetyRecommendations(
        location || "Maharashtra",
        recentIncidents || []
      );
      
      // Save recommendations to storage
      const savedRecommendations = await Promise.all(
        recommendations.map(rec => storage.createRecommendation({
          userId: userId || 1,
          ...rec,
          location: rec.location || null,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }))
      );
      
      res.json(savedRecommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Emergency Alerts
  app.get("/api/emergency-alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get emergency alerts" });
    }
  });

  app.post("/api/emergency-alerts", async (req, res) => {
    try {
      const validatedData = insertEmergencyAlertSchema.parse(req.body);
      const userId = req.body.userId || 1; // Default to user 1 for demo
      
      const alert = await storage.createEmergencyAlert({ ...validatedData, userId });
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to create emergency alert" });
    }
  });

  app.put("/api/emergency-alerts/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.resolveEmergencyAlert(id);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve emergency alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
