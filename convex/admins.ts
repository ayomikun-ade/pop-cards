import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

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
 * Internal mutation to insert the admin profile record once auth account is created.
 */
export const insertAdminProfile = mutation({
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

    // Check if username already exists in profiles
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
 * Superadmin creates a new Admin account with an initial password.
 */
export const createAdminUser = action({
  args: {
    displayName: v.string(),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Unauthorized");

    const cleanUsername = args.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (!args.password || args.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const emailIdentifier = cleanUsername.includes("@")
      ? cleanUsername
      : `${cleanUsername}@popcards.local`;

    // 1. Create auth account with password hashing via Convex Auth
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: {
        id: emailIdentifier,
        secret: args.password,
      },
      profile: {
        name: args.displayName.trim(),
        email: emailIdentifier,
      },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });

    // 2. Insert admin profile record linked to the created user ID
    await ctx.runMutation(api.admins.insertAdminProfile, {
      userId: user._id as any,
      username: cleanUsername,
      displayName: args.displayName.trim(),
    });

    return user._id;
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
