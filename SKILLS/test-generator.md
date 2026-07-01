# Test Generation Guide

## Setup

### Install Testing Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest
```

### Jest Configuration
Create `jest.config.ts`:
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
```

Create `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

---

## React Component Tests

### Form Component Test Template
```typescript
// src/components/__tests__/my-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyForm } from '../my-form';

// Mock fetch
global.fetch = jest.fn();

describe('MyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<MyForm />);
    expect(screen.getByLabelText('Field Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows error on validation failure', async () => {
    render(<MyForm />);
    const button = screen.getByRole('button', { name: /submit/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error message/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<MyForm />);

    const input = screen.getByLabelText('Field Name');
    fireEvent.change(input, { target: { value: 'Test Value' } });

    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/endpoint',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Value'),
        })
      );
    });
  });

  it('shows success message on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<MyForm />);
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    let resolveResponse: any;
    (global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(resolve => { resolveResponse = resolve; })
    );

    render(<MyForm />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button).toBeDisabled();

    resolveResponse({ ok: true, json: async () => ({}) });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
```

### Client Component with useState Test
```typescript
describe('InteractiveComponent', () => {
  it('toggles state on button click', () => {
    render(<InteractiveComponent />);
    const button = screen.getByRole('button', { name: /toggle/i });

    expect(screen.getByText('Initial State')).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByText('Toggled State')).toBeInTheDocument();
  });

  it('handles multiple clicks correctly', () => {
    render(<InteractiveComponent />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.getByText('State 1')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('State 2')).toBeInTheDocument();
  });
});
```

---

## API Route Tests

### API Route Test Template
```typescript
// src/app/api/endpoint/__tests__/route.test.ts
import { PUT } from '../route';

describe('PUT /api/endpoint', () => {
  const mockAuth = jest.fn();
  const mockPrisma = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await PUT(
      new Request('http://localhost:3000/api/endpoint', {
        method: 'PUT',
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not owner', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { uuid: 'user-2' },
    });

    const response = await PUT(
      new Request('http://localhost:3000/api/endpoint', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Not authorized');
  });

  it('updates resource successfully', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { uuid: 'user-1' },
    });

    const response = await PUT(
      new Request('http://localhost:3000/api/endpoint', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Updated successfully');
  });

  it('returns 400 on invalid input', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { uuid: 'user-1' },
    });

    const response = await PUT(
      new Request('http://localhost:3000/api/endpoint', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }), // Invalid: empty
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid');
  });

  it('returns 500 on server error', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { uuid: 'user-1' },
    });
    mockPrisma.mockRejectedValueOnce(new Error('DB Error'));

    const response = await PUT(
      new Request('http://localhost:3000/api/endpoint', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('An error occurred');
  });
});
```

---

## Test Coverage Goals

### Components
- [ ] Renders correctly
- [ ] Props display properly
- [ ] Event handlers trigger
- [ ] Loading states show
- [ ] Error messages display
- [ ] Success messages display
- [ ] Form validation works
- [ ] Toggle/hidden content works

### API Routes
- [ ] Returns correct status codes
- [ ] Auth checks pass/fail correctly
- [ ] Ownership verified
- [ ] Input validation works
- [ ] Data persisted correctly
- [ ] Error handling works
- [ ] File cleanup happens

### Integration
- [ ] Form submission to API works
- [ ] Error states propagate correctly
- [ ] Success states propagate correctly
- [ ] Redirects happen correctly

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test my-component.test.tsx

# Watch mode
npm test --watch

# Coverage report
npm test --coverage
```

---

## Testing Best Practices

### ✅ DO
- Test user behavior, not implementation
- Use `screen.getByRole`, `getByLabelText` queries
- Wait for async operations with `waitFor`
- Mock external dependencies (fetch, router)
- Test error cases
- Test edge cases

### ❌ DON'T
- Test implementation details
- Use `querySelector` queries
- Test without waiting for async
- Leave mocks from previous tests
- Only test happy paths
- Make tests dependent on each other

---

## Example: Complete Component Test

```typescript
describe('DeleteImageButton', () => {
  it('shows confirmation dialog and deletes image', async () => {
    window.confirm = jest.fn().mockReturnValueOnce(true);
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

    render(<DeleteImageButton imageId="image-123" />);

    const button = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure?');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/images/image-123',
        { method: 'DELETE' }
      );
    });
  });

  it('does not delete when user cancels', () => {
    window.confirm = jest.fn().mockReturnValueOnce(false);
    global.fetch = jest.fn();

    render(<DeleteImageButton imageId="image-123" />);

    const button = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(button);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
```
