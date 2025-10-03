import { useMemo } from 'react';
import type { HealthResponse } from '@instruct/memmachine-sdk';
import { useMemMachineClient } from './useMemMachineClient.js';
import { useQuery } from './common.js';

/** Auto-fetches health on mount, returns state. */
export function useHealth() {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.health(), [client]);
  return useQuery<HealthResponse>(fetcher, [fetcher]);
}
