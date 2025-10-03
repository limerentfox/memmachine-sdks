import { createContext, useContext } from 'react';
import { MemMachineClient, type ClientOptions } from '@instruct/memmachine-sdk';

export interface MemMachineConfig extends Omit<ClientOptions, 'fetch'> {
  /** Optional: provide a prebuilt client (overrides options). */
  client?: MemMachineClient;
}

export interface MemMachineContextValue {
  client: MemMachineClient;
  /** Current config used to construct the client (sans client instance). */
  config: Omit<MemMachineConfig, 'client'>;
  /** Update or clear the bearer token. */
  setApiKey: (token?: string) => void;
}

export const MemMachineContext = createContext<MemMachineContextValue | null>(null);

export function useMemMachineContext(): MemMachineContextValue {
  const ctx = useContext(MemMachineContext);
  if (!ctx) {
    throw new Error('useMemMachineContext must be used within <MemMachineProvider>');
  }
  return ctx;
}
