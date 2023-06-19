import { BehaviorSubject, Observable, distinctUntilChanged, from, isObservable, map, scan, takeWhile } from "rxjs";
import State, { NewValue } from "./State";
import { withValueContainer } from "./ValueContainer";

export type SetValueAsync<TValue> = (
  newValue: NewValue<TValue> | Observable<NewValue<TValue>> | Promise<NewValue<TValue>>
) => void;

export interface LoadStatus {
  isLoading: boolean;
}

export interface SetStatus extends LoadStatus {
  error?: unknown;
}

export interface OverallSetStatus extends LoadStatus {
  errors: unknown[];
}

export function asyncLoadableState<TValue>(state: State<TValue>): AsyncLoadableState<TValue> {
  const emptyErrors: unknown[] = [];
  const setStatusSubject = new BehaviorSubject<SetStatus>({ isLoading: false });
  const overallSetStatus$ = setStatusSubject.pipe(
    scan(
      (accumulated, current) => ({
        loadingCount: Math.max(0, accumulated.loadingCount + (current.isLoading ? 1 : -1)),
        errors: current.error ? [...accumulated.errors, current.error] : emptyErrors
      }),
      { loadingCount: 0, errors: [] as unknown[] }
    ),
    map((accumulated) => ({ isLoading: accumulated.loadingCount > 0, errors: accumulated.errors } as OverallSetStatus)),
    distinctUntilChanged((a, b) => a.isLoading === b.isLoading && a.errors === b.errors)
  );

  const next = (newValue: NewValue<TValue>) => {
    state.set(newValue);
  };
  const error = (error: unknown) => {
    setStatusSubject.next({ isLoading: false, error });
  };
  const complete = () => {
    setStatusSubject.next({ isLoading: false });
  };

  const set = (newValue: NewValue<TValue> | Observable<NewValue<TValue>> | Promise<NewValue<TValue>>) => {
    if (isPromise(newValue) || isObservable(newValue)) {
      setStatusSubject.next({ isLoading: true });
      from(newValue).subscribe({ next, error, complete });
      return;
    }

    state.set(newValue);
  };

  return withValueContainer(state)({ setStatus$: setStatusSubject.asObservable(), overallSetStatus$, set });
}

export function oneLoadCycle<TStatus extends LoadStatus>(setStatus$: Observable<TStatus>) {
  return setStatus$.pipe(takeWhile((status) => status.isLoading, true));
}

export default interface AsyncLoadableState<TValue> extends State<TValue> {
  setStatus$: Observable<SetStatus>;
  overallSetStatus$: Observable<OverallSetStatus>;
  set: SetValueAsync<TValue>;
}

function isPromise<T>(obj: T | Promise<T>): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as { then: unknown }).then === "function"
  );
}
