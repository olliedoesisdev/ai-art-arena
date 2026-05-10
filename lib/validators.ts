import { z } from "zod";

// Vote validation
export const VoteSchema = z.object({
  artwork_id: z.string().uuid("Invalid artwork ID"),
  contest_id: z.string().uuid("Invalid contest ID"),
});

// Contest creation validation (admin only)
export const CreateContestSchema = z.object({
  week_number: z.number().int().positive(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: z.enum(["active", "archived"]).default("active"),
  artwork_count: z.number().int().min(1).max(50).default(6),
});

// Artwork creation validation (admin only)
export const CreateArtworkSchema = z.object({
  contest_id: z.string().uuid(),
  image_url: z.string().url(),
  title: z.string().min(1).max(100),
  prompt: z.string().max(500).optional(),
});

// User profile update validation
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
});

// Comment submission validation
export const CreateCommentSchema = z.object({
  artwork_id: z.string().uuid("Invalid artwork ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be 50 characters or fewer"),
  email: z.string().email("Invalid email address").max(254).optional().or(z.literal("")),
  body: z.string().min(5, "Comment must be at least 5 characters").max(500, "Comment must be 500 characters or fewer"),
});
