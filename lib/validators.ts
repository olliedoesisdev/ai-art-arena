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
});

// Artwork creation validation (admin only)
export const CreateArtworkSchema = z.object({
  contest_id: z.string().uuid(),
  image_url: z.string().url(),
  title: z.string().min(1).max(100),
  artist_prompt: z.string().max(500).optional(),
});

// User profile update validation
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
});
