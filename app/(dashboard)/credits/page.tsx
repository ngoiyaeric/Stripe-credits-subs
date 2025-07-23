import { CreditDashboard } from '@/components/credits/credit-components';
import { getUser } from '@/lib/auth/session';
import { getTeamById } from '@/lib/db/queries';

export default async function CreditsPage() {
  const user = await getUser();
  // This is a placeholder for getting the current team.
  // You should replace this with your actual logic for getting the current team.
  const team = user ? await getTeamById(1) : null;

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Credit Management</h1>
      <CreditDashboard teamId={team.id} />
    </div>
  );
}
