# MemMachine SDKs Monorepo

A professionally organized monorepo containing:

- Core JavaScript/TypeScript SDK (Node/Browser)
- React TypeScript SDK (hooks, context, components)
- Comprehensive documentation for both SDKs

## Repository Structure

```
memmachine-sdks/
├─ packages/
│  ├─ js-sdk/           # Core JS/TS SDK
│  └─ react-sdk/        # React TypeScript SDK
└─ docs/
   ├─ js-sdk/           # Core SDK docs
   └─ react-sdk/        # React SDK docs
```

## Quick Start

1. Install dependencies (uses npm workspaces):
   ```bash
   npm install
   ```
2. Build all packages:
   ```bash
   npm run build
   ```
3. Type-check all packages:
   ```bash
   npm run typecheck
   ```

## Storybook (React SDK)

An interactive Storybook is provided to showcase React components, hooks, and integration patterns, including accessible and responsive testing.

- Run Storybook:
  ```bash
  npm run storybook:react-sdk
  ```
- Build static Storybook:
  ```bash
  npm run build-storybook:react-sdk
  ```

For package-scoped commands, see the React SDK README.

## Documentation

- Core JS/TS SDK docs: ./docs/js-sdk/README.md
- React SDK docs: ./docs/react-sdk/README.md

Each docs section includes tutorials, integrations, and API references.

## Packages

- packages/js-sdk — publishes `@instruct/memmachine-sdk`
- packages/react-sdk — publishes `@instruct/memmachine-react-sdk`

Refer to each package README for usage and examples.

## License

MIT © 2025 Instruct
