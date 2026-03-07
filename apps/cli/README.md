# Synth CLI

Plain interactive CLI for initializing a local Synth project.

## Commands

```bash
bun run init
bun run start
```

From repository root:

```bash
bun run cli:init
bun run cli:start
```

`init` asks for database URL, AI provider, and credentials, introspects the database, stores local config in `.synth/<project>/`, and starts a localhost dashboard.
