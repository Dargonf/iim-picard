#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// MCP Server for Project Skills
// Provides skill guides as accessible tools

const skills = {
  'api-endpoints': {
    description: 'Complete API reference with all endpoints, request/response formats, and examples',
    category: 'API Reference'
  },
  'code-review': {
    description: 'Code quality standards and best practices specific to the project',
    category: 'Code Quality'
  },
  'test-generator': {
    description: 'Testing templates and workflows for components and API routes',
    category: 'Testing'
  },
  'schema-migrator': {
    description: 'Database migration workflow and patterns',
    category: 'Database'
  },
  'component-analyzer': {
    description: 'React component analysis and improvement patterns',
    category: 'React'
  }
};

// Helper to read skill files
function getSkillContent(skillName) {
  const skillPath = path.join(__dirname, '..', 'SKILLS', `${skillName}.md`);
  try {
    return fs.readFileSync(skillPath, 'utf-8');
  } catch (err) {
    return `Error reading skill file: ${err.message}`;
  }
}

// List all available skills
function listSkills() {
  return Object.entries(skills).map(([name, info]) => ({
    name,
    description: info.description,
    category: info.category
  }));
}

// Main MCP response handler
function handleRequest(request) {
  const method = request.method;

  // List available resources (skills)
  if (method === 'resources/list') {
    return {
      resources: Object.entries(skills).map(([name, info]) => ({
        uri: `skill://${name}`,
        name: name.replace('-', ' ').toUpperCase(),
        description: info.description,
        mimeType: 'text/markdown'
      }))
    };
  }

  // Read a specific skill
  if (method === 'resources/read') {
    const uri = request.params.uri;
    const skillName = uri.replace('skill://', '');

    if (!skills[skillName]) {
      return {
        error: `Unknown skill: ${skillName}`
      };
    }

    const content = getSkillContent(skillName);
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: content
      }]
    };
  }

  // Get skill summary
  if (method === 'tools/list') {
    return {
      tools: listSkills().map(skill => ({
        name: skill.name.replace(' ', '-'),
        description: skill.description,
        inputSchema: {
          type: 'object',
          properties: {
            section: {
              type: 'string',
              description: 'Optional section to focus on (e.g., "patterns", "examples", "checklist")'
            }
          }
        }
      }))
    };
  }

  return { error: 'Unknown method' };
}

// Process stdin/stdout
let inputBuffer = '';

process.stdin.on('data', (chunk) => {
  inputBuffer += chunk.toString();

  // Try to parse complete JSON objects
  try {
    const lines = inputBuffer.split('\n');
    inputBuffer = lines[lines.length - 1]; // Keep incomplete line

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const request = JSON.parse(line);
      const response = handleRequest(request);

      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    // Wait for more data if JSON is incomplete
    if (!(err instanceof SyntaxError)) {
      console.error('Error:', err);
    }
  }
});

process.stdin.on('end', () => {
  if (inputBuffer.trim()) {
    try {
      const request = JSON.parse(inputBuffer);
      const response = handleRequest(request);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (err) {
      console.error('Error parsing final input:', err);
    }
  }
});
