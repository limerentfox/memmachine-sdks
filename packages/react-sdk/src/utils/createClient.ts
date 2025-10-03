import { MemMachineClient, type ClientOptions } from '@instruct/memmachine-sdk';

/**
 * Helper to create a MemMachineClient with sane defaults.
 */
export function createClient(options?: ClientOptions) {
  return new MemMachineClient(options);
}

export default createClient;
