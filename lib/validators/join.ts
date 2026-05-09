import { z } from "zod";

export const subscriberSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be under 60 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type SubscriberInput = z.infer<typeof subscriberSchema>;

export const artistStep1Schema = z.object({
  name: z.string().min(1, "Name is required").max(80).trim(),
  email: z.string().email("Valid email required").toLowerCase().trim(),
  location: z.string().max(80).optional().or(z.literal("")),
});

export const artistStep2Schema = z.object({
  artist_bio: z
    .string()
    .min(20, "Bio must be at least 20 characters")
    .max(600, "Bio must be under 600 characters")
    .trim(),
  art_style: z
    .string()
    .min(1, "Please describe your style")
    .max(200)
    .trim(),
  primary_tools: z
    .array(z.string())
    .min(1, "Select at least one tool"),
  years_using_ai: z.string().min(1, "Please select an option"),
  portfolio_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  social_handle: z.string().max(60).optional().or(z.literal("")),
});

export const artistStep3Schema = z.object({
  submission_title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .trim(),
  submission_prompt: z
    .string()
    .min(10, "Please share the prompt you used")
    .max(1000, "Prompt must be under 1000 characters")
    .trim(),
});

export const fullArtistApplicationSchema = artistStep1Schema
  .merge(artistStep2Schema)
  .merge(artistStep3Schema)
  .extend({
    submission_image_url: z.string().url(),
    submission_image_path: z.string().min(1),
  });

export type FullArtistApplicationInput = z.infer<typeof fullArtistApplicationSchema>;
