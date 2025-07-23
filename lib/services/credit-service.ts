import { db } from '@/lib/db/drizzle';
import { teams, creditUsageLogs, creditGrantsLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';

export class InsufficientCreditsError extends Error {
  constructor(message = 'Insufficient credits') {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

const CREDIT_PLANS = {
  'price_basic_monthly': { credits: 100, name: 'Basic' },
  'price_pro_monthly': { credits: 500, name: 'Pro' },
  'price_enterprise_monthly': { credits: 2000, name: 'Enterprise' },
  'price_basic_yearly': { credits: 1200, name: 'Basic (Yearly)' },
  'price_pro_yearly': { credits: 6000, name: 'Pro (Yearly)' },
  'price_enterprise_yearly': { credits: 24000, name: 'Enterprise (Yearly)' },
};

class CreditService {
  async getCreditBalance(teamId: number) {
    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team.length) throw new Error('Team not found');

    const { creditBalance, creditLimit, creditsGrantedThisPeriod, billingPeriodStart, billingPeriodEnd } = team[0];
    const usage = creditsGrantedThisPeriod - creditBalance;

    return {
      balance: creditBalance,
      limit: creditLimit,
      usage: usage,
      billingPeriodStart,
      billingPeriodEnd,
    };
  }

  async useCredits(teamId: number, userId: number | null, credits: number, actionType: string, description?: string, metadata?: Record<string, any>) {
    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team.length) throw new Error('Team not found');
    if (team[0].creditBalance < credits) {
      throw new InsufficientCreditsError();
    }

    const newBalance = team[0].creditBalance - credits;
    await db.update(teams).set({ creditBalance: newBalance }).where(eq(teams.id, teamId));

    await db.insert(creditUsageLogs).values({
      teamId,
      userId,
      creditsUsed: credits,
      actionType,
      description,
      metadata,
    });

    if (team[0].stripeCustomerId && team[0].stripeMeterId) {
      await stripe.billing.meterEvents.create({
        meter: team[0].stripeMeterId,
        value: credits,
        customer: team[0].stripeCustomerId,
      });
    }

    return this.getCreditBalance(teamId);
  }

  async grantCreditsForSubscription(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const team = await db.select().from(teams).where(eq(teams.stripeCustomerId, customerId)).limit(1);
    if (!team.length) throw new Error('Team not found for customer');

    const priceId = subscription.items.data[0]?.price.id;
    const plan = CREDIT_PLANS[priceId as keyof typeof CREDIT_PLANS];
    if (!plan) return;

    const creditsToGrant = plan.credits;
    await db.update(teams).set({
      creditBalance: creditsToGrant,
      creditLimit: creditsToGrant,
      creditsGrantedThisPeriod: creditsToGrant,
      billingPeriodStart: new Date(subscription.current_period_start * 1000),
      billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeMeterId: process.env.STRIPE_CREDIT_METER_ID,
    }).where(eq(teams.id, team[0].id));

    await db.insert(creditGrantsLogs).values({
      teamId: team[0].id,
      creditsGranted: creditsToGrant,
      grantReason: 'subscription_payment',
      stripeGrantId: subscription.id,
      billingPeriodStart: new Date(subscription.current_period_start * 1000),
      billingPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  async getUsageHistory(teamId: number, limit: number, offset: number) {
    return db.select().from(creditUsageLogs).where(eq(creditUsageLogs.teamId, teamId)).orderBy(creditUsageLogs.createdAt).limit(limit).offset(offset);
  }

  async getGrantsHistory(teamId: number, limit: number, offset: number) {
    return db.select().from(creditGrantsLogs).where(eq(creditGrantsLogs.teamId, teamId)).orderBy(creditGrantsLogs.createdAt).limit(limit).offset(offset);
  }
}

export const creditService = new CreditService();
