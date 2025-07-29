import { supabase } from '../supabase/client';

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error) {
    console.error('Error fetching team by Stripe customer ID:', error);
    return null;
  }

  return data;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  const { error } = await supabase
    .from('teams')
    .update({
      ...subscriptionData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId);

  if (error) {
    console.error('Error updating team subscription:', error);
  }
}

export async function getUserWithTeam(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      team_members (
        team_id
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user with team:', error);
    return null;
  }

  return data;
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id,
      action,
      timestamp,
      ip_address,
      users (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  return data;
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('team_members')
    .select(`
      teams (
        *,
        team_members (
          *,
          users (
            id,
            name,
            email
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching team for user:', error);
    return null;
  }

  return data?.teams;
}
