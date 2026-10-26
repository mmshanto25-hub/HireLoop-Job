/**
 * Subscription related types shared across the monorepo.
 */

import type { SubscriptionStatus } from '../constants/domain.js';

/** Identifier for a subscription plan. */
export type PlanId = 'free' | 'starter' | 'pro';

/** Billing interval options. */
export type BillingInterval = 'monthly' | 'yearly';

/** Definition of a product plan. */
export interface Plan {
  /** Unique plan identifier. */
  id: PlanId;
  /** Human‑readable name. */
  name: string;
  /** Price in cents for the default billing interval. */
  priceCents: number;
  /** Billing interval that this price applies to. */
  interval: BillingInterval;
  /** Optional description shown in UI. */
  description?: string;
  /** Feature limits attached to this plan. */
  limits: {
    /** Maximum number of job applications a seeker can submit per month. */
    maxApplicationsPerMonth: number;
    /** Maximum number of jobs a seeker can save. */
    maxSavedJobs: number;
    /** Optional limit on job postings for recruiter plans. */
    maxJobPostingsPerMonth?: number;
  };
}

/** Current subscription record stored in MongoDB. */
export interface Subscription {
  /** Internal DB identifier. */
  id: string;
  /** Owner of the subscription. */
  userId: string;
  /** Which plan the user is on. */
  planId: PlanId;
  /** Current Stripe‑derived status. */
  status: SubscriptionStatus;
  /** Unix timestamp (seconds) when the current period ends. */
  currentPeriodEnd: number;
  /** Stripe subscription identifier (optional for free tier). */
  stripeSubscriptionId?: string;
}

