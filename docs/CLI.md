# CLI Usage Guide

The `caw` (Coding Agent Workspace) CLI allows you to manage the workspace resources.

## Commands

### Reference

Manage reference repositories.

#### Clone

Clone a repository as a reference.

```bash
caw reference clone <url> [--global | -g] [--project <name> | -p <name>]
```

**Examples:**

```bash
# Clone to global scope
caw reference clone https://github.com/Effect-TS/effect --global

# Clone to project scope
caw reference clone https://github.com/some/repo --project backend-api
```

#### List

List registered references.

```bash
caw reference list [--global | -g] [--project <name> | -p <name>]
```

If no scope is provided, lists all references.

**Examples:**

```bash
caw reference list
caw reference list --global
caw reference list --project backend-api
```

#### Remove

Remove a reference.

```bash
caw reference remove <name> [--global | -g] [--project <name> | -p <name>]
```

**Examples:**

```bash
caw reference remove effect --global
```

## Global Flags

- `--help`: Show help information.
- `--version`: Show version information.
