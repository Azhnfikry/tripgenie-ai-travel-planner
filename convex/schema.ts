import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    username: v.string(),
  }).index("by_userId", ["userId"]).index("by_username", ["username"]),
  trips: defineTable({
    destination: v.string(),
    days: v.number(),
    budget: v.number(),
    currency: v.string(),
    interests: v.array(v.string()),
    totalEstimatedCost: v.number(),
    dailyPlan: v.array(v.object({
      day: v.number(),
      title: v.string(),
      estimatedCost: v.number(),
      activities: v.array(v.object({
        timeOfDay: v.string(),
        name: v.string(),
        description: v.string(),
        category: v.string(),
        estimatedCost: v.number(),
        location: v.optional(v.object({
          placeName: v.string(),
          lat: v.number(),
          lng: v.number(),
        })),
      })),
    })),
    packingTips: v.array(v.string()),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
