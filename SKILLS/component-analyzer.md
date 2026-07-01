# Component Analysis & Improvement Guide

## Component Health Checklist

### Structure & Organization
- [ ] Single responsibility - one purpose per component
- [ ] Props interface defined (not inline)
- [ ] Proper TypeScript types on all props
- [ ] Clear prop documentation in JSDoc
- [ ] No prop drilling (max 2-3 levels)

### Performance
- [ ] No unnecessary re-renders
- [ ] Memoization used for expensive computations
- [ ] No inline object/function creation in render
- [ ] Callback dependencies correct in useEffect
- [ ] Images properly sized
- [ ] No N+1 renders on state changes

### Accessibility
- [ ] All interactive elements have labels
- [ ] Form inputs have associated labels
- [ ] Buttons have clear text or aria-label
- [ ] Color not the only indicator
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### Testing
- [ ] Component is testable (not too many internal states)
- [ ] Can test with props, not internal state
- [ ] Event handlers can be mocked
- [ ] No hard-coded test data

### Maintainability
- [ ] Clear variable names
- [ ] No magic numbers or strings
- [ ] Comments explain why, not what
- [ ] Consistent code style
- [ ] No dead code

---

## Analysis Process

### 1. Identify Component Purpose
```tsx
// ✅ GOOD: Clear single purpose
export function DeleteButton({ onDelete }: { onDelete: () => void }) {
  // Only handles delete button logic
}

// ❌ BAD: Multiple concerns
export function ImageCard({ image, onDelete, onEdit, onShare, ... }) {
  // Handles delete, edit, share, display - too many concerns
}
```

### 2. Check Props Interface
```tsx
// ✅ GOOD: Explicit interface
interface DeleteButtonProps {
  onDelete: () => void;
  isLoading?: boolean;
}

export function DeleteButton({ onDelete, isLoading }: DeleteButtonProps) { }

// ❌ BAD: Implicit or over-broad props
interface CardProps {
  [key: string]: any;
}

export function Card(props: CardProps) { }
```

### 3. Evaluate State Management
```tsx
// ✅ GOOD: Minimal state, clear purpose
function EditForm({ initialName, onSave }) {
  const [name, setName] = useState(initialName);
  // Only manages form input state
}

// ❌ BAD: Too much state, unclear dependencies
function ComplexComponent() {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  const [state3, setState3] = useState();
  const [state4, setState4] = useState();
  // Hard to understand interactions
}
```

### 4. Check Async Operations
```tsx
// ✅ GOOD: Proper loading/error state
function DeleteButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(...);
      // Refresh or callback
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
}

// ❌ BAD: Incomplete state handling
function DeleteButton() {
  const handleDelete = async () => {
    await fetch(...);
    // No loading or error state!
  };
}
```

### 5. Review Prop Drilling
```tsx
// ✅ GOOD: Props passed only 1-2 levels
<Page>
  <Section theme={theme} />
  <Section theme={theme} />
</Page>

<Section theme={theme}>
  <Card theme={theme} />
</Section>

// ❌ BAD: Deep prop drilling
<Page theme={theme}>
  <Section theme={theme}>
    <Panel theme={theme}>
      <Card theme={theme}>
        <Button theme={theme} />
      </Card>
    </Panel>
  </Section>
</Page>
```

---

## Common Component Patterns

### Form Component Template
```tsx
interface FormData {
  field1: string;
  field2: boolean;
}

interface MyFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
}

export function MyForm({ initialData, onSubmit }: MyFormProps) {
  const [formData, setFormData] = useState<FormData>(
    initialData || { field1: '', field2: false }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        value={formData.field1}
        onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Toggle Component Template
```tsx
interface ToggleProps {
  label: string;
  onToggle: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function Toggle({ label, onToggle, children }: ToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle(newState);
  };

  return (
    <div>
      <button onClick={handleToggle}>
        {isOpen ? 'Hide' : 'Show'} {label}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
```

### List Component Template
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  empty?: React.ReactNode;
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  empty = 'No items',
}: ListProps<T>) {
  return (
    <div>
      {items.length === 0 ? (
        <div>{empty}</div>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={keyExtractor(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Performance Optimization

### Avoid Unnecessary Re-renders
```tsx
// ❌ BAD: Recreates object every render
function Component({ data }) {
  const obj = { x: 1, y: 2 }; // New object each time
  return <Child config={obj} />;
}

// ✅ GOOD: Object is stable
const defaultConfig = { x: 1, y: 2 };

function Component({ data }) {
  return <Child config={defaultConfig} />;
}

// ✅ GOOD: Use useMemo for computed objects
function Component({ data }) {
  const config = useMemo(
    () => ({ x: data.x, y: data.y }),
    [data]
  );
  return <Child config={config} />;
}
```

### Memoize Expensive Computations
```tsx
// ❌ BAD: Recomputes every render
function FilteredList({ items, filter }) {
  const filtered = items.filter(item =>
    item.name.includes(filter)
  );
  return <div>{filtered}</div>;
}

// ✅ GOOD: Memoize expensive computation
function FilteredList({ items, filter }) {
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  return <div>{filtered}</div>;
}
```

### Stabilize Callback References
```tsx
// ❌ BAD: New function every render
function Parent() {
  return <Child onChange={(val) => console.log(val)} />;
}

// ✅ GOOD: Stable callback
function Parent() {
  const handleChange = useCallback((val) => {
    console.log(val);
  }, []);

  return <Child onChange={handleChange} />;
}
```

---

## Accessibility Improvements

### Form Accessibility
```tsx
// ❌ BAD: No label association
<div>
  <span>Name</span>
  <input type="text" />
</div>

// ✅ GOOD: Proper label association
<div>
  <label htmlFor="name-input">Name</label>
  <input id="name-input" type="text" />
</div>
```

### Button Accessibility
```tsx
// ❌ BAD: No text, just icon
<button>
  <TrashIcon />
</button>

// ✅ GOOD: Either text or aria-label
<button aria-label="Delete item">
  <TrashIcon />
</button>

// ✅ GOOD: Has visible text
<button>Delete</button>
```

### Keyboard Navigation
```tsx
// ❌ BAD: Click handler on div
<div onClick={handleDelete}>Delete me</div>

// ✅ GOOD: Use proper semantic elements
<button onClick={handleDelete}>Delete me</button>
```

---

## Code Review Template

```markdown
## Component: ComponentName

### Structure
- [ ] Single responsibility
- [ ] Props interface defined
- [ ] TypeScript types correct
- [ ] No prop drilling

### Performance
- [ ] No unnecessary re-renders
- [ ] Memoization where needed
- [ ] Stable callbacks
- [ ] Proper dependencies

### Accessibility
- [ ] All interactive elements accessible
- [ ] Labels associated with inputs
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### Error Handling
- [ ] Loading states shown
- [ ] Errors displayed to user
- [ ] Try/catch for async operations
- [ ] Fallbacks provided

### Testing
- [ ] Component is testable
- [ ] Props-based testing possible
- [ ] Event handlers mockable
- [ ] Edge cases handled

### Maintainability
- [ ] Clear variable names
- [ ] No magic numbers
- [ ] Comments explain why
- [ ] No dead code

### Suggestions for Improvement
- [ ] Extract sub-component
- [ ] Memoize expensive operation
- [ ] Add error boundary
- [ ] Improve type safety
```

---

## Refactoring Examples

### Before: Monolithic Component
```tsx
export function ImageManager() {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ... many more handlers and render logic
}
```

### After: Composed Components
```tsx
// Separate concerns into smaller components
interface ImageManagerProps {
  onImageSelected?: (imageId: string) => void;
}

export function ImageManager({ onImageSelected }: ImageManagerProps) {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div>
      <ImageFilter filter={filter} onChange={setFilter} />
      <ImageGrid
        images={images}
        filter={filter}
        onSelect={onImageSelected}
      />
    </div>
  );
}

// Extract filter into separate component
function ImageFilter({ filter, onChange }) {
  return <input value={filter} onChange={(e) => onChange(e.target.value)} />;
}

// Extract grid into separate component
function ImageGrid({ images, filter, onSelect }) {
  const filtered = images.filter(img => img.name.includes(filter));
  return <div>{filtered.map(img => ...)}</div>;
}
```
