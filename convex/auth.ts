import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple auth without Convex Auth Password provider
// This is a workaround for the Password provider issues

export const signup = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // Check if username already exists
    const existingUsername = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      username: args.username,
      password: args.password, // In production, hash this!
    });

    // Create user profile
    await ctx.db.insert("userProfiles", {
      userId,
      email: args.email.toLowerCase(),
      username: args.username,
    });

    return { userId, email: args.email, username: args.username };
  },
});

export const signin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password");
    }

    return { userId: user._id, email: user.email, username: user.username };
  },
});

export const loggedInUser = query({
  handler: async (ctx) => {
    // This would need session management
    // For now, return null - we'll handle auth on client side
    return null;
  },
});
