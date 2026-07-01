# Claude Code Skills for Personal Website Project

These are custom skill guides I can reference to enhance my productivity and code quality when working on your project.

## Available Skills

### 📚 [api-endpoints.md](./api-endpoints.md)
**What it does:** Complete reference for all API routes, request/response formats, and usage examples
- All endpoint locations
- Request/response schemas
- Authentication requirements
- File operations
- Error handling patterns
- Common usage examples
- Testing checklist

**Use case:** When implementing new features, integrating with APIs, or understanding how endpoints work

---

### ✅ [code-review.md](./code-review.md)
**What it does:** Code quality standards and best practices specific to this project
- React component patterns (Server vs Client)
- API route patterns
- Form component best practices
- Error handling standards
- Security checklist
- Performance guidelines
- Common mistakes to avoid

**Use case:** When reviewing code, writing new components, or ensuring consistency

---

### 🧪 [test-generator.md](./test-generator.md)
**What it does:** Testing templates and best practices for components and API routes
- Jest/React Testing Library setup
- Component test templates
- API route test templates
- Test coverage goals
- Running tests
- Testing best practices
- Example test files

**Use case:** When creating or updating tests, improving test coverage

---

### 🗄️ [schema-migrator.md](./schema-migrator.md)
**What it does:** Database schema migration workflow and common patterns
- Migration commands
- Step-by-step workflow
- Common migration patterns
- Safety checklist
- Troubleshooting
- Best practices

**Use case:** When modifying database schema, adding new fields, or creating migrations

---

### 🎨 [component-analyzer.md](./component-analyzer.md)
**What it does:** React component analysis, improvement patterns, and health checklist
- Component health checklist
- Performance optimization
- Accessibility guidelines
- Common component patterns
- Refactoring examples
- Code review template

**Use case:** When creating new components, refactoring existing ones, or improving performance

---

## How I Use These Skills

When working on your project, I'll:

1. **Code Review** - Check against `code-review.md` patterns
2. **New Components** - Follow templates from `component-analyzer.md`
3. **API Changes** - Reference `api-endpoints.md` and update accordingly
4. **Database Changes** - Follow workflow from `schema-migrator.md`
5. **Testing** - Use templates from `test-generator.md`

---

## Quick Reference

### Common Questions

**"How do I add a new API endpoint?"**
→ See `api-endpoints.md` → API Route Patterns section

**"What's the right way to structure a form component?"**
→ See `component-analyzer.md` → Common Component Patterns

**"How do I write tests for a component?"**
→ See `test-generator.md` → React Component Tests section

**"How do I add a field to the database?"**
→ See `schema-migrator.md` → Step-by-Step workflow

**"Is my component following best practices?"**
→ See `component-analyzer.md` → Component Health Checklist

---

## Skill Files Structure

Each skill file follows this structure:
- **Quick Reference** - At the top for fast lookup
- **Detailed Explanations** - Full context and examples
- **Best Practices** - Do's and Don'ts
- **Examples** - Real code samples
- **Checklists** - For verification

---

## Integration with Project

These skills are designed specifically for:
- **Tech Stack:** Next.js 16 + React 19 + TypeScript + Prisma
- **Architecture:** Server/Client component pattern, API routes
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js

---

## Keeping Skills Updated

If your project standards change or you add new patterns:
1. Update the relevant skill file
2. Include examples from your codebase
3. Update this README if new skills are added

---

## Beyond These Skills

These skills cover the most common tasks. For other needs:
- Check `PROJECT_GUIDE.md` for project architecture
- Review `CLAUDE.md` if project-specific instructions exist
- Ask me for clarification on any patterns
