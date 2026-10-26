/**
 * Zod schemas for subscription‑related data shared across the monorepo.
 */
import { z } from 'zod';
import type { PlanId, BillingInterval } from '../types/subscription.js';
import type { SubscriptionStatus } from '../constants/domain.js';

// Schema for creating a subscription (checkout) – only planId is required from client.
export const CreateSubscriptionSchema = z.object({
  planId: z.enum(['free', 'starter', 'pro'] as const),
});

// Schema for a Plan definition (returned from API).
export const PlanSchema = z.object({
  id: z.enum(['free', 'starter', 'pro'] as const),
  name: z.string(),
  priceCents: z.number().int().nonnegative(),
  interval: z.enum(['monthly', 'yearly'] as const),
  description: z.string().optional(),
  limits: z.object({
    maxApplicationsPerMonth: z.number().int().nonnegative(),
    maxSavedJobs: z.number().int().nonnegative(),
    maxJobPostingsPerMonth: z.number().int().nonnegative().optional(),
  }),
});

// Schema representing a stored subscription.
export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.enum(['free', 'starter', 'pro'] as const),
  status: z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'past_due',
    'unpaid',
  ] as const),
  currentPeriodEnd: z.number().int(),
  stripeSubscriptionId: z.string().optional(),
});
