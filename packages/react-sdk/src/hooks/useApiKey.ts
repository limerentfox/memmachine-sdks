import { useCallback } from 'react';
import { useMemMachineContext } from '../context/MemMachineContext.js';

/** Access and update the API key used by the client. */
export function useApiKey(): [string | undefined, (token?: string) => void] {
  const { setApiKey, config } = useMemMachineContext();
  const set = useCallback((token?: string) => setApiKey(token), [setApiKey]);
  return [config.apiKey, set];
}
