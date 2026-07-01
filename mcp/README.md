# Project Skills MCP Server

This MCP (Model Context Protocol) server provides access to the project's skill guides as structured resources.

## Overview

The MCP server exposes the following skills:
- **api-endpoints** - Complete API reference
- **code-review** - Code quality standards
- **test-generator** - Testing templates
- **schema-migrator** - Database migration patterns
- **component-analyzer** - React component best practices

## How It Works

1. **Automatic Discovery** - Claude Code automatically loads this MCP server from `.mcp.json`
2. **Resource Access** - Skills are available as resources via the MCP protocol
3. **Claude Integration** - I can access and reference these guides automatically

## Architecture

```
.mcp.json (config)
    ↓
mcp/server.js (MCP server implementation)
    ↓
SKILLS/*.md (skill guide files)
    ↓
Claude Code / Claude (resource access)
```

## Configuration

### .mcp.json
Registers the MCP server:
```json
{
  "mcpServers": {
    "project-skills": {
      "command": "node",
      "args": ["mcp/server.js"]
    }
  }
}
```

### .claude/settings.json
Enables all project MCP servers:
```json
{
  "enableAllProjectMcpServers": true
}
```

## Usage

Once enabled, I can:
1. Access skill content automatically
2. Reference specific sections from guides
3. Apply patterns and best practices consistently
4. Provide accurate information about project conventions

## Server Implementation

The MCP server provides:
- **resources/list** - List all available skills
- **resources/read** - Read a specific skill's content
- **tools/list** - List skills as tools with descriptions

Each skill is served as a markdown resource with its full content.

## Benefits

✅ Centralized skill management
✅ Automatic integration with Claude Code
✅ Version controlled (in git)
✅ Accessible from any tool/agent
✅ Real-time updates (no deployment needed)

## Troubleshooting

**Server not loading?**
- Check `.mcp.json` syntax
- Verify `.claude/settings.json` has `enableAllProjectMcpServers: true`
- Restart Claude Code
- Check that `mcp/server.js` exists and is executable

**Resources not appearing?**
- Confirm MCP server started (check Claude Code logs)
- Verify `SKILLS/` directory has `.md` files
- Check file paths in server.js match actual locations

**Want to add more skills?**
1. Create new `.md` file in `SKILLS/` directory
2. Add entry to `skills` object in `mcp/server.js`
3. No need to restart - server dynamically discovers files
