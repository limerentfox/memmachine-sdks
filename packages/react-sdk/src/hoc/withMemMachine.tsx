import React from 'react';
import { useMemMachineContext } from '../context/MemMachineContext.js';
import type { MemMachineContextValue } from '../context/MemMachineContext.js';

export type WithMemMachineProps = { memmachine: MemMachineContextValue };

export function withMemMachine<P extends object>(Component: React.ComponentType<P & WithMemMachineProps>) {
  const Wrapped: React.FC<P> = (props) => {
    const ctx = useMemMachineContext();
    return <Component {...props} memmachine={ctx} />;
  };
  Wrapped.displayName = `withMemMachine(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

export default withMemMachine;
