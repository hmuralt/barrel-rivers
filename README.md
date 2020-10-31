# RxJS based state management

This projects provides a basic toolset to manage states.

# Example

## Primitive type

```typescript
const counterState = state(0);

const increment = () => counterState.set((currentCount) => ++currentCount);

const decrement = () => counterState.set((currentCount) => --currentCount);

counterState.value$.subscribe((count) => console.log(`Count is ${count}`));

increment();

counterState.set(8);

decrement();

// console output
// Count is 0
// Count is 1
// Count is 8
// Count is 7
```

## Object

```typescript
const counterState = state({ count: 0, lastUpdated: new Date() });

const increment = () => {
  counterState.set(
    update(
      (obj) => obj.count,
      (count) => ++count
    )
  );
  counterState.set(update((obj) => obj.lastUpdated, new Date()));
};

const decrement = () => counterState.set((obj) => ({ count: obj.count - 1, lastUpdated: new Date() }));
```
