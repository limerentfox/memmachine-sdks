import { FormEvent, useCallback, useMemo, useState } from 'react';
import type { NewEpisode, SessionData } from '@instruct/memmachine-sdk';
import { useAddEpisodicMemory, useAddMemory, useAddProfileMemory } from '../hooks/memories.js';

export interface AddMemoryFormProps {
  session: SessionData;
  store?: 'all' | 'episodic' | 'profile';
  defaultProducer?: string;
  defaultProducedFor?: string;
  defaultType?: string;
  onSubmitted?: (input: NewEpisode) => void;
  submitLabel?: string;
}

export function AddMemoryForm({ session, store = 'all', defaultProducer = '', defaultProducedFor = '', defaultType = 'dialog', onSubmitted, submitLabel = 'Add' }: AddMemoryFormProps) {
  const [content, setContent] = useState('');
  const [producer, setProducer] = useState(defaultProducer);
  const [producedFor, setProducedFor] = useState(defaultProducedFor);
  const [episodeType, setEpisodeType] = useState(defaultType);

  const add = useAddMemory();
  const addE = useAddEpisodicMemory();
  const addP = useAddProfileMemory();

  const busy = add.loading || addE.loading || addP.loading;
  const err = add.error || addE.error || addP.error;
  const status = useMemo(() => add.status === 'loading' || addE.status === 'loading' || addP.status === 'loading' ? 'loading' : (add.status === 'error' || addE.status === 'error' || addP.status === 'error' ? 'error' : (add.status === 'success' || addE.status === 'success' || addP.status === 'success' ? 'success' : 'idle')), [add.status, addE.status, addP.status]);

  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const body: NewEpisode = {
      session,
      producer,
      produced_for: producedFor,
      episode_content: content,
      episode_type: episodeType,
    };
    if (store === 'episodic') await addE.mutate(body);
    else if (store === 'profile') await addP.mutate(body);
    else await add.mutate(body);
    onSubmitted?.(body);
    setContent('');
  }, [add, addE, addP, content, episodeType, onSubmitted, producer, producedFor, session, store]);

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={3} required />
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="Producer" required />
        <input value={producedFor} onChange={(e) => setProducedFor(e.target.value)} placeholder="Produced for" required />
        <input value={episodeType} onChange={(e) => setEpisodeType(e.target.value)} placeholder="Type" />
      </div>
      {status === 'error' && err ? <div role="alert" style={{ color: 'red' }}>{err.message}</div> : null}
      <button type="submit" disabled={busy}>{submitLabel}</button>
    </form>
  );
}

export default AddMemoryForm;
