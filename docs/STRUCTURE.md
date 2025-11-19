# Workspace Structure

The Coding Agent Workspace is organized as follows:

```
~/.coding-agent-workspace/
├── bin/                    # Executable binaries
├── cli/                    # Source code for the CLI tool
├── docs/                   # Documentation
├── global/                 # Global resources
│   └── references/         # Global reference repositories
├── mcp/                    # MCP server configurations
├── projects/               # Project-specific resources
│   └── <project-name>/
│       └── references/     # Project-specific reference repositories
├── registry/               # Metadata registry
│   ├── references.json     # Registry of cloned references
│   ├── projects.json       # Registry of projects
│   └── tools.json          # Registry of available tools
├── scripts/                # Utility scripts
└── sessions/               # Agent session data (future)
```

## Scopes

### Global Scope
Resources under `global/` are available to all agents and projects. This is suitable for standard libraries, documentation for widely used frameworks, and general-purpose tools.

### Project Scope
Resources under `projects/<name>/` are specific to a project. This allows for isolating references and tools that are only relevant to a particular context.
