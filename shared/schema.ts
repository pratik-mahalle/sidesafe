import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  emergencyContacts: jsonb("emergency_contacts").$type<string[]>().default([]),
  location: text("location"),
  safetyStatus: text("safety_status").default("safe"),
  lastStatusUpdate: timestamp("last_status_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // "harassment", "stalking", "emergency", "general"
  description: text("description").notNull(),
  location: text("location").notNull(),
  urgency: text("urgency").notNull(), // "low", "medium", "high", "emergency"
  status: text("status").default("pending"), // "pending", "investigating", "resolved"
  reportedAt: timestamp("reported_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  evidence: jsonb("evidence").$type<string[]>().default([]),
});

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  relationship: text("relationship").notNull(),
  location: text("location"),
  safetyStatus: text("safety_status").default("safe"),
  lastUpdate: timestamp("last_update").defaultNow(),
});

export const safetyRecommendations = pgTable("safety_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // "route", "time", "general"
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // "low", "medium", "high"
  location: text("location"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  location: text("location").notNull(),
  status: text("status").default("active"), // "active", "resolved", "false_alarm"
  alertedContacts: jsonb("alerted_contacts").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  phone: true,
  emergencyContacts: true,
  location: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).pick({
  type: true,
  description: true,
  location: true,
  urgency: true,
  evidence: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).pick({
  name: true,
  phone: true,
  relationship: true,
  location: true,
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).pick({
  location: true,
  alertedContacts: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type SafetyRecommendation = typeof safetyRecommendations.$inferSelect;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
