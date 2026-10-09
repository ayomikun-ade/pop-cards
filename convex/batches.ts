import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admins";

/**
 * Public query: Fetch batch configuration by slug for corps members.
 */
export const getBatchBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const batch = await ctx.db
      .query("batches")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!batch) return null;

    let logoUrl: string | undefined = undefined;
    if (batch.logoStorageId) {
      const url = await ctx.storage.getUrl(batch.logoStorageId);
      if (url) logoUrl = url;
    }

    return {
      _id: batch._id,
      slug: batch.slug,
      cdsName: batch.cdsName,
      batchName: batch.batchName,
      templateId: batch.templateId,
      paletteId: batch.paletteId,
      customPalette: batch.customPalette,
      logoUrl,
      defaultFields: batch.defaultFields,
      customFields: batch.customFields,
      roleOptions: batch.roleOptions,
      hasExcoCode: !!batch.excoCode && batch.excoCode.trim().length > 0,
      isActive: batch.isActive,
      closedMessage: batch.closedMessage,
    };
  },
});

/**
 * Public verification: Verify an entered exco code for a batch.
 */
export const verifyExcoCode = query({
  args: {
    slug: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db
      .query("batches")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!batch || !batch.excoCode) return false;
    return batch.excoCode.trim().toLowerCase() === args.code.trim().toLowerCase();
  },
});

/**
 * Admin query: List batches.
 * Superadmin sees all batches; regular admins see their own.
 */
export const listMyBatches = query({
  args: {},
  handler: async (ctx) => {
    let session;
    try {
      session = await requireAdmin(ctx);
    } catch {
      return [];
    }
    const { userId, profile } = session;

    if (profile.role === "superadmin") {
      const allBatches = await ctx.db.query("batches").order("desc").collect();
      return allBatches;
    } else {
      const myBatches = await ctx.db
        .query("batches")
        .withIndex("by_owner", (q) => q.eq("ownerId", userId))
        .order("desc")
        .collect();
      return myBatches;
    }
  },
});

/**
 * Admin query: Get batch by ID for editing.
 */
export const getBatchById = query({
  args: { id: v.id("batches") },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireAdmin(ctx);

    const batch = await ctx.db.get(args.id);
    if (!batch) return null;

    if (profile.role !== "superadmin" && batch.ownerId !== userId) {
      throw new Error("Unauthorized to access this batch");
    }

    let logoUrl: string | undefined = undefined;
    if (batch.logoStorageId) {
      const url = await ctx.storage.getUrl(batch.logoStorageId);
      if (url) logoUrl = url;
    }

    return { ...batch, logoUrl };
  },
});

/**
 * Admin mutation: Generate storage upload URL for CDS logo upload.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Admin mutation: Create or Update a Batch.
 */
export const saveBatch = mutation({
  args: {
    id: v.optional(v.id("batches")),
    slug: v.string(),
    cdsName: v.string(),
    batchName: v.string(),
    templateId: v.string(),
    paletteId: v.string(),
    customPalette: v.optional(
      v.object({
        primary: v.string(),
        accent: v.string(),
        background: v.string(),
        cardBg: v.string(),
        textColor: v.string(),
        headingColor: v.string(),
        textOnPrimary: v.string(),
        textOnAccent: v.string(),
      })
    ),
    logoStorageId: v.optional(v.id("_storage")),
    defaultFields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        required: v.boolean(),
        maxLength: v.number(),
      })
    ),
    customFields: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        required: v.boolean(),
        maxLength: v.number(),
      })
    ),
    roleOptions: v.array(
      v.object({
        label: v.string(),
        isExco: v.boolean(),
      })
    ),
    excoCode: v.optional(v.string()),
    isActive: v.boolean(),
    closedMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireAdmin(ctx);

    const cleanSlug = args.slug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");

    if (args.cdsName.trim().length > 100) throw new Error("CDS Name must be under 100 characters");
    if (args.batchName.trim().length > 100) throw new Error("Batch Name must be under 100 characters");
    if (args.customFields.length > 10) throw new Error("Maximum of 10 custom fields allowed");
    if (args.roleOptions.length > 30) throw new Error("Maximum of 30 role options allowed");

    // Check slug uniqueness
    const existingWithSlug = await ctx.db
      .query("batches")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (existingWithSlug && (!args.id || existingWithSlug._id !== args.id)) {
      throw new Error(`The link slug "/b/${cleanSlug}" is already taken. Please choose another one.`);
    }

    const now = Date.now();

    if (args.id) {
      // Update
      const existing = await ctx.db.get(args.id);
      if (!existing) throw new Error("Batch not found");

      if (profile.role !== "superadmin" && existing.ownerId !== userId) {
        throw new Error("Unauthorized to edit this batch");
      }

      if (args.logoStorageId && existing.logoStorageId && args.logoStorageId !== existing.logoStorageId) {
        try {
          await ctx.storage.delete(existing.logoStorageId);
        } catch (e) {
          console.warn("Storage deletion ignored", e);
        }
      }

      await ctx.db.patch(args.id, {
        slug: cleanSlug,
        cdsName: args.cdsName.trim(),
        batchName: args.batchName.trim(),
        templateId: args.templateId,
        paletteId: args.paletteId,
        customPalette: args.customPalette,
        logoStorageId: args.logoStorageId ?? existing.logoStorageId,
        defaultFields: args.defaultFields,
        customFields: args.customFields,
        roleOptions: args.roleOptions,
        excoCode: args.excoCode?.trim() || undefined,
        isActive: args.isActive,
        closedMessage: args.closedMessage?.trim(),
        updatedAt: now,
      });

      return args.id;
    } else {
      // Create new
      const newId = await ctx.db.insert("batches", {
        slug: cleanSlug,
        ownerId: userId,
        cdsName: args.cdsName.trim(),
        batchName: args.batchName.trim(),
        templateId: args.templateId,
        paletteId: args.paletteId,
        customPalette: args.customPalette,
        logoStorageId: args.logoStorageId,
        defaultFields: args.defaultFields,
        customFields: args.customFields,
        roleOptions: args.roleOptions,
        excoCode: args.excoCode?.trim() || undefined,
        isActive: args.isActive,
        closedMessage: args.closedMessage?.trim(),
        createdAt: now,
        updatedAt: now,
      });

      return newId;
    }
  },
});

/**
 * Admin mutation: Delete a Batch.
 */
export const deleteBatch = mutation({
  args: { id: v.id("batches") },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireAdmin(ctx);

    const batch = await ctx.db.get(args.id);
    if (!batch) return;

    if (profile.role !== "superadmin" && batch.ownerId !== userId) {
      throw new Error("Unauthorized to delete this batch");
    }

    if (batch.logoStorageId) {
      try {
        await ctx.storage.delete(batch.logoStorageId);
      } catch (e) {
        console.warn("Storage deletion ignored", e);
      }
    }

    await ctx.db.delete(args.id);
  },
});
