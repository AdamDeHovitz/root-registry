# Code Style Guide

## General Principles
- Write clean, readable, and maintainable code
- Follow TypeScript strict mode conventions
- Prefer composition over inheritance
- Keep functions small and focused
- Use meaningful variable and function names

## TypeScript
- Enable strict mode (already configured in tsconfig.json)
- Avoid using `any` types - use `unknown` if type is truly unknown
- Prefer interfaces for object shapes, types for unions/intersections
- Use const assertions for literal types
- Export types alongside implementation

## File Organization
- One component per file
- Group related files in feature directories
- Keep components, hooks, and utilities separate
- Use index.ts for barrel exports when appropriate

## Naming Conventions
- **Files**: kebab-case for files (`game-form.tsx`, `use-auth.ts`)
- **Components**: PascalCase (`GameForm`, `LeagueCard`)
- **Functions**: camelCase (`createGame`, `validateScore`)
- **Constants**: UPPER_SNAKE_CASE (`FACTIONS`, `MAX_PLAYERS`)
- **Types/Interfaces**: PascalCase (`Game`, `LeagueSettings`)

## React Components
- Use function components with hooks
- Prefer named exports for components
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use prop destructuring
- Define prop types inline or as separate interface

```typescript
// Good
interface GameCardProps {
  game: Game;
  onEdit: (id: string) => void;
}

export function GameCard({ game, onEdit }: GameCardProps) {
  // component logic
}
```

## Hooks
- Prefix custom hooks with `use` (`useAuth`, `useGames`)
- Keep hooks focused on a single responsibility
- Return objects for multiple values, not arrays
- Document complex hooks with JSDoc comments

## API Routes
- Use descriptive route names
- Validate input with Zod schemas
- Return consistent error shapes
- Use appropriate HTTP status codes
- Handle errors gracefully

## Database
- Use Drizzle ORM for all database operations
- Define schema in `lib/db/schema.ts`
- Keep queries in `lib/db/queries/` directory
- Use transactions for multi-step operations
- Validate data before database operations

## Forms
- Use React Hook Form for form management
- Validate with Zod schemas
- Provide clear error messages
- Show loading states
- Disable submit during submission

## Error Handling
- Use try-catch for async operations
- Log errors for debugging
- Show user-friendly error messages
- Provide recovery actions when possible

## Comments
- Write self-documenting code first
- Add comments for complex business logic
- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date

## Testing
- Write tests for critical paths
- Test user interactions, not implementation
- Use descriptive test names
- Mock external dependencies
- Aim for meaningful coverage, not 100%

## Performance
- Use lazy loading for routes
- Optimize images (next/image)
- Minimize client-side JavaScript
- Use server components by default
- Add 'use client' only when needed

## Accessibility
- Use semantic HTML
- Provide alt text for images
- Ensure keyboard navigation
- Use ARIA labels appropriately
- Test with screen readers
- Maintain sufficient color contrast

## Git Commits
- Write concise commit messages
- Follow conventional commits format
- One logical change per commit
- Reference issues when applicable
