# Integration Guides (React TypeScript)

This guide shows how to integrate the MemMachine React SDK into common React toolchains.

- Next.js (App Router)
- Next.js (Pages Router)
- Vite
- Create React App

General tips:
- Only use hooks in client components. For Next.js App Router, add `'use client'` at the top of files that call hooks.
- Keep secrets server‑side. Expose only what you must in public env vars (e.g., base URL). Prefer runtime tokens set via `useApiKey()` after sign‑in.

## Next.js (App Router)

Directory: `app/`

1) Install packages:
```bash
npm i @instruct/memmachine-react-sdk @instruct/memmachine-sdk
```

2) Create a provider wrapper component marked as client:
```tsx
// app/providers.tsx
'use client';
import { PropsWithChildren } from 'react';
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';

export function Providers({ children }: PropsWithChildren) {
  return (
    <MemMachineProvider
      baseUrl={process.env.NEXT_PUBLIC_MEMMACHINE_BASE_URL}
      // Do not put secrets in NEXT_PUBLIC_ vars in production
    >
      {children}
    </MemMachineProvider>
  );
}
```

3) Use the provider in your root layout:
```tsx
// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = { title: 'MemMachine App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

4) Use hooks in client components:
```tsx
// app/page.tsx
'use client';
import { useHealth } from '@instruct/memmachine-react-sdk/hooks';

export default function Page() {
  const { data } = useHealth();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Authentication pattern:
- After user signs in (via your own auth), call `useApiKey()` to set the token at runtime.

```tsx
'use client';
import { useApiKey } from '@instruct/memmachine-react-sdk/hooks';

export function SignInClient() {
  const [, setApiKey] = useApiKey();
  return <button onClick={() => setApiKey(prompt('Token') || undefined)}>Set Token</button>;
}
```

## Next.js (Pages Router)

1) Add the provider at `_app.tsx`:
```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MemMachineProvider baseUrl={process.env.NEXT_PUBLIC_MEMMACHINE_BASE_URL}>
      <Component {...pageProps} />
    </MemMachineProvider>
  );
}
```

2) Use hooks in pages or components as usual.

## Vite

1) Add env vars in `.env.local`:
```
VITE_MEMMACHINE_BASE_URL=http://localhost:8080
```

2) Wrap the root in `main.tsx`:
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemMachineProvider baseUrl={import.meta.env.VITE_MEMMACHINE_BASE_URL}>
      <App />
    </MemMachineProvider>
  </React.StrictMode>
);
```

## Create React App

1) Env vars must be prefixed with `REACT_APP_`:
```
REACT_APP_MEMMACHINE_BASE_URL=http://localhost:8080
```

2) Wrap the app in `index.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemMachineProvider baseUrl={process.env.REACT_APP_MEMMACHINE_BASE_URL}>
      <App />
    </MemMachineProvider>
  </React.StrictMode>
);
```

## Advanced: Providing a Custom Client

If you need full control (e.g., custom `fetch`, logging, or headers), build a `MemMachineClient` and pass it to the provider.

```ts
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';
import { createClient } from '@instruct/memmachine-react-sdk/utils';

const client = createClient({ baseUrl: 'https://api.example.com', apiKey: '…' });

<MemMachineProvider client={client}>{/* ... */}</MemMachineProvider>
```

Best practices:
- Do not hard‑code tokens in client bundles. Obtain them at runtime from your auth flow and set via `useApiKey()`.
- Co-locate env var reading at the boundary (providers) to keep hooks/components clean.
