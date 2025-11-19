# Coding Agent Workspace

A universal toolbox for AI coding agents.

## Overview

The Coding Agent Workspace is a centralized repository of tools, references, and resources that AI agents can leverage across different projects. It is designed to be read-only for agents, providing them with a consistent environment and set of capabilities.

## Installation

### Global Installation (Recommended)

If you have Bun installed:

```bash
bun install -g @coding-agent/workspace
```

Or you can run it directly without installation:

```bash
bunx caw <command>
# or
npx caw <command>
```

## Quick Start

1. **Clone a global reference:**

   ```bash
   caw reference clone https://github.com/Effect-TS/effect --global
   ```

2. **Clone a project-specific reference:**

   ```bash
   caw reference clone https://github.com/user/repo --project my-project
   ```

3. **List references:**

   ```bash
   caw reference list --global
   ```

## Documentation

- [CLI Usage](./docs/CLI.md)
- [Workspace Structure](./docs/STRUCTURE.md)
