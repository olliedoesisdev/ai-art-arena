/**
 * Validation Schemas for API Routes
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';
import { CONTEST_CONFIG } from './constants';

/**
 * Vote API Request Schema
 */
export const voteSchema = z.object({
  artworkId: z.string().uuid('Invalid artwork ID format'),
  contestId: z.string().uuid('Invalid contest ID format'),
});

export type VoteRequest = z.infer<typeof voteSchema>;

/**
 * Create Contest Schema
 */
export const createContestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  weekNumber: z.number().int().positive('Week number must be positive'),
  year: z.number().int().min(2024, 'Invalid year').max(2100, 'Invalid year'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
});

export type CreateContestRequest = z.infer<typeof createContestSchema>;

/**
 * Create Artwork Schema
 */
export const createArtworkSchema = z.object({
  contestId: z.string().uuid('Invalid contest ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  imageUrl: z.string().url('Invalid image URL'),
  prompt: z.string().max(2000, 'Prompt too long').optional().nullable(),
  artistName: z.string().max(100, 'Artist name too long').optional().nullable(),
  position: z.number()
    .int()
    .min(0)
    .max(CONTEST_CONFIG.max_artworks_per_contest)
    .optional(),
});

export type CreateArtworkRequest = z.infer<typeof createArtworkSchema>;

/**
 * Blog Post Schema
 */
export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.any(), // TipTap JSONContent
  excerpt: z.string().max(500, 'Excerpt too long').optional().nullable(),
  metaDescription: z.string().max(160, 'Meta description too long').optional().nullable(),
  metaKeywords: z.array(z.string()).max(10, 'Too many keywords').optional(),
  published: z.boolean().default(false),
});

export type CreateBlogPostRequest = z.infer<typeof createBlogPostSchema>;

/**
 * Pagination Query Schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * Helper function to validate request body
 *
 * @example
 * ```ts
 * const validation = validateRequest(voteSchema, await request.json());
 * if (!validation.success) {
 *   return NextResponse.json(
 *     { error: validation.error.message, details: validation.error.errors },
 *     { status: 400 }
 *   );
 * }
 * const { artworkId, contestId } = validation.data;
 * ```
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Helper to format Zod errors for API responses
 */
export function formatZodError(error: z.ZodError<unknown>): {
  message: string;
  errors: Array<{ field: string; message: string }>;
} {
  return {
    message: 'Validation failed',
    errors: error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}
