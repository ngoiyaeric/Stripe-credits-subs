'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CreditBalance({ teamId }: { teamId: number }) {
  const { data, error } = useSWR(`/api/credits/balance?teamId=${teamId}`, fetcher, {
    refreshInterval: 30000,
  });

  if (error) return <div>Failed to load credit balance</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{data.balance} / {data.limit}</p>
        <p className="text-sm text-gray-500">
          Used this period: {data.usage}
        </p>
      </CardContent>
    </Card>
  );
}

export function CreditDashboard({ teamId }: { teamId: number }) {
  return (
    <div className="space-y-6">
      <CreditBalance teamId={teamId} />
      <UsageHistory teamId={teamId} />
      <GrantsHistory teamId={teamId} />
    </div>
  );
}

function UsageHistory({ teamId }: { teamId: number }) {
  const { data, error } = useSWR(`/api/credits/usage-history?teamId=${teamId}`, fetcher);

  if (error) return <div>Failed to load usage history</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {data.map((item: any) => (
            <li key={item.id} className="border-b py-2">
              <p><strong>Action:</strong> {item.actionType}</p>
              <p><strong>Credits Used:</strong> {item.creditsUsed}</p>
              <p><strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}</p>
              {item.description && <p><strong>Description:</strong> {item.description}</p>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function GrantsHistory({ teamId }: { teamId: number }) {
  const { data, error } = useSWR(`/api/credits/grants-history?teamId=${teamId}`, fetcher);

  if (error) return <div>Failed to load grants history</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grants History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {data.map((item: any) => (
            <li key={item.id} className="border-b py-2">
              <p><strong>Credits Granted:</strong> {item.creditsGranted}</p>
              <p><strong>Reason:</strong> {item.grantReason}</p>
              <p><strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function useCreditCheck(teamId: number, requiredCredits: number) {
  const { data, error } = useSWR(`/api/credits/balance?teamId=${teamId}`, fetcher);

  return {
    hasSufficientCredits: data ? data.balance >= requiredCredits : false,
    loading: !data && !error,
  };
}
