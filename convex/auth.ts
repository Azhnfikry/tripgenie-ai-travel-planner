import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    // Get the user profile to include username and email
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return {
      ...user,
      username: profile?.username || user.email,
      emailProfile: profile?.email,
    };
  },
});

// Create user profile after signup
export const createUserProfile = mutation({
  args: {
    email: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists for this user
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Profile already exists, just return success
      return true;
    }

    // Check if username already exists
    const existingUsername = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    await ctx.db.insert("userProfiles", {
      userId,
      email: args.email,
      username: args.username,
    });

    return true;
  },
});
