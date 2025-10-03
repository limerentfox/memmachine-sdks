import { useMemo } from 'react';
import { MemMachineClient, type ClientOptions } from '@instruct/memmachine-sdk';
import { useMemMachineContext } from '../context/MemMachineContext.js';

/**
 * Returns the MemMachineClient from context.
 * Optionally override options by creating a scoped client instance.
 */
export function useMemMachineClient(options?: Omit<ClientOptions, 'fetch'>): MemMachineClient {
  const ctx = useMemMachineContext();
  const client = useMemo(() => {
    if (!options) return ctx.client;
    // Create a scoped client with overridden options
    return new MemMachineClient({ ...ctx.config, ...options });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.client, options?.apiKey, options?.baseUrl, options?.timeoutMs, options?.restPrefix, options?.mcpPrefix, JSON.stringify(options?.headers ?? {})]);
  return client;
}
