import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, createAccount } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");

  const profile = await ctx.db
    .query("adminProfiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) throw new Error("Unauthorized");
  if (profile.disabled) throw new Error("Account is disabled");

  return { userId, profile };
}

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
    const { profile } = await requireAdmin(ctx);

    if (profile.role !== "superadmin") {
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
      .withIndex("by_role", (q) => q.eq("role", "superadmin"))
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
      .withIndex("by_role", (q) => q.eq("role", "superadmin"))
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

export const checkUsernameTaken = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const { profile } = await requireAdmin(ctx);
    if (profile.role !== "superadmin") throw new Error("Unauthorized");
    
    const existing = await ctx.db
      .query("adminProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    return !!existing;
  }
});

/**
 * Internal mutation to insert the admin profile record once auth account is created.
 */
export const insertAdminProfile = internalMutation({
  args: {
    userId: v.id("users"),
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const cleanUsername = args.username.trim().toLowerCase();

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
    const cleanUsername = args.username.trim().toLowerCase();
    
    // Check permissions and username availability first
    const isTaken = await ctx.runQuery(api.admins.checkUsernameTaken, { 
      username: cleanUsername 
    });
    
    if (isTaken) {
      throw new Error(`Username "${cleanUsername}" is already taken`);
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (!args.password || args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
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
    await ctx.runMutation(internal.admins.insertAdminProfile, {
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
    const { profile: caller } = await requireAdmin(ctx);

    if (caller.role !== "superadmin") {
      throw new Error("Only Superadmin can modify admin accounts");
    }

    const target = await ctx.db.get(args.profileId);
    if (!target) throw new Error("Admin profile not found");
    if (target.role === "superadmin") throw new Error("Cannot disable superadmin");

    await ctx.db.patch(args.profileId, { disabled: args.disabled });
  },
});
