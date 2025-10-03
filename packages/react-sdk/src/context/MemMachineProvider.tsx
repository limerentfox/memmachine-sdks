import { PropsWithChildren, useMemo, useRef } from 'react';
import { MemMachineClient, type ClientOptions } from '@instruct/memmachine-sdk';
import { MemMachineContext, type MemMachineConfig } from './MemMachineContext.js';

export interface MemMachineProviderProps extends PropsWithChildren<{}>, Omit<ClientOptions, 'fetch'> {
  /** Optional: Provide an existing client. If set, options are ignored. */
  client?: MemMachineClient;
}

export function MemMachineProvider(props: MemMachineProviderProps) {
  const { children, client: providedClient, ...options } = props;

  const stableOptions = useMemo(() => ({ ...(options as Omit<MemMachineConfig, 'client'>) }), [
    options.apiKey,
    options.baseUrl,
    options.headers,
    options.timeoutMs,
    options.restPrefix,
    options.mcpPrefix,
  ]);

  const client = useMemo(() => {
    if (providedClient) return providedClient;
    return new MemMachineClient(stableOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providedClient, stableOptions.baseUrl, stableOptions.apiKey, stableOptions.timeoutMs, stableOptions.restPrefix, stableOptions.mcpPrefix, JSON.stringify(stableOptions.headers ?? {})]);

  // Provide a stable setApiKey that updates the underlying client
  const setApiKeyRef = useRef<(token?: string) => void>(() => {});
  setApiKeyRef.current = (token?: string) => {
    client.setApiKey(token);
  };

  const value = useMemo(() => ({
    client,
    config: stableOptions,
    setApiKey: (token?: string) => setApiKeyRef.current(token),
  }), [client, stableOptions]);

  return (
    <MemMachineContext.Provider value={value}>{children}</MemMachineContext.Provider>
  );
}

export default MemMachineProvider;
