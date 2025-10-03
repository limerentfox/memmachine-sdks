import { useEffect, useMemo, useRef, useState } from 'react';
import type { AllSessionsResponse } from '@instruct/memmachine-sdk';
import { useMemMachineClient } from '../hooks/useMemMachineClient.js';

export interface SessionsListProps {
  source?: 'rest' | 'mcp';
  variant?: 'all' | 'user' | 'group' | 'agent';
  id?: string;
  render?: (resp: AllSessionsResponse) => JSX.Element;
}

export function SessionsList({ source = 'rest', variant = 'all', id, render }: SessionsListProps) {
  const client = useMemMachineClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AllSessionsResponse | null>(null);
  const reqId = useRef(0);
  const deps = useMemo(() => [client, source, variant, id] as const, [client, source, variant, id]);

  useEffect(() => {
    let canceled = false;
    const myReq = ++reqId.current;
    setLoading(true); setError(null);
    const run = async () => {
      try {
        let resp: AllSessionsResponse;
        if (source === 'mcp') {
          if (variant === 'all') resp = await client.mcp.sessions();
          else if (variant === 'user') { if (!id) throw new Error('id required for user'); resp = await client.mcp.userSessions(id); }
          else if (variant === 'group') { if (!id) throw new Error('id required for group'); resp = await client.mcp.groupSessions(id); }
          else { if (!id) throw new Error('id required for agent'); resp = await client.mcp.agentSessions(id); }
        } else {
          if (variant === 'all') resp = await client.sessions.getAll();
          else if (variant === 'user') { if (!id) throw new Error('id required for user'); resp = await client.sessions.forUser(id); }
          else if (variant === 'group') { if (!id) throw new Error('id required for group'); resp = await client.sessions.forGroup(id); }
          else { if (!id) throw new Error('id required for agent'); resp = await client.sessions.forAgent(id); }
        }
        if (canceled || myReq !== reqId.current) return;
        setData(resp);
      } catch (e) {
        if (canceled || myReq !== reqId.current) return;
        setError(e as Error);
      } finally {
        if (!canceled && myReq === reqId.current) setLoading(false);
      }
    };
    void run();
    return () => { canceled = true; };
  }, deps);

  if (loading) return <div role="status">Loading sessions…</div>;
  if (error) return <div role="alert" style={{ color: 'red' }}>{error.message}</div>;
  if (!data) return null;

  return render ? render(data) : (
    <ul>
      {data.sessions.map((s) => (
        <li key={s.session_id}>
          <code>{s.session_id}</code> — users: {(s.user_ids || []).join(', ')}{s.group_id ? ` — group: ${s.group_id}` : ''}
        </li>
      ))}
    </ul>
  );
}

export default SessionsList;
