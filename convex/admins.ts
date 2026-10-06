import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get current user's profile and role (superadmin vs admin).
 */
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("adminProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

/**
 * Superadmin listing of all admin accounts.
 */
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("adminProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!caller || caller.role !== "superadmin") {
      throw new Error("Only Superadmin can list admins");
    }

    return await ctx.db.query("adminProfiles").collect();
  },
});

/**
 * Check if the system has been initialized with a Superadmin yet.
 */
export const isSystemInitialized = query({
  args: {},
  handler: async (ctx) => {
    const existingSuperadmin = await ctx.db
      .query("adminProfiles")
      .filter((q) => q.eq(q.field("role"), "superadmin"))
      .first();
    return !!existingSuperadmin;
  },
});

/**
 * One-time setup: Initialize Superadmin if none exists yet.
 */
export const initSuperadmin = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be logged in to initialize superadmin");

    const existingSuperadmin = await ctx.db
      .query("adminProfiles")
      .filter((q) => q.eq(q.field("role"), "superadmin"))
      .first();

    if (existingSuperadmin) {
      throw new Error("System is already initialized with a Superadmin");
    }

    const cleanUsername = args.username.trim().toLowerCase();

    const profileId = await ctx.db.insert("adminProfiles", {
      userId,
      username: cleanUsername,
      displayName: args.displayName.trim(),
      role: "superadmin",
      disabled: false,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

/**
 * Superadmin registers an Admin account.
 */
export const registerAdminProfile = mutation({
  args: {
    userId: v.id("users"),
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("adminProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", callerId))
      .first();

    if (!caller || caller.role !== "superadmin") {
      throw new Error("Only Superadmin can create admin accounts");
    }

    const cleanUsername = args.username.trim().toLowerCase();

    // Check if username already exists
    const existing = await ctx.db
      .query("adminProfiles")
      .withIndex("by_username", (q) => q.eq("username", cleanUsername))
      .first();

    if (existing) {
      throw new Error(`Username "${cleanUsername}" is already taken`);
    }

    const profileId = await ctx.db.insert("adminProfiles", {
      userId: args.userId,
      username: cleanUsername,
      displayName: args.displayName.trim(),
      role: "admin",
      disabled: false,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

/**
 * Superadmin toggle admin account status.
 */
export const toggleAdminStatus = mutation({
  args: {
    profileId: v.id("adminProfiles"),
    disabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("adminProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", callerId))
      .first();

    if (!caller || caller.role !== "superadmin") {
      throw new Error("Only Superadmin can modify admin accounts");
    }

    const target = await ctx.db.get(args.profileId);
    if (!target) throw new Error("Admin profile not found");
    if (target.role === "superadmin") throw new Error("Cannot disable superadmin");

    await ctx.db.patch(args.profileId, { disabled: args.disabled });
  },
});
