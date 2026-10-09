import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Admin and Superadmin profile records
  adminProfiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    role: v.union(v.literal("superadmin"), v.literal("admin")),
    displayName: v.string(),
    disabled: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  // Batches configured by admins
  batches: defineTable({
    slug: v.string(),
    ownerId: v.id("users"),
    cdsName: v.string(),
    batchName: v.string(),
    templateId: v.string(), // "classic-wave" | "bold-split" | "polaroid" | "spotlight"
    paletteId: v.string(),  // "nysc-classic" | "navy-gold" | etc.
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
    excoCode: v.optional(v.string()), // stored for validation
    isActive: v.boolean(),
    closedMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),
});
