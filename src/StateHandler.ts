import { BehaviorSubject } from "rxjs";
import StateProvider from "./StateProvider";

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
export type NewStateGetter<TState> = (currentValue: TState) => TState;

export function createStateHandler<TState>(defaultState: TState): StateHandler<TState> {
  const stateSubject = new BehaviorSubject(defaultState);

  const setState = (newState: TState | NewStateGetter<TState>) => {
    if (isNewStateGetter(newState)) {
      stateSubject.next(newState(stateSubject.value));
      return;
    }

    if (typeof newState === "object" && !Array.isArray(newState)) {
      stateSubject.next({ ...stateSubject.value, ...newState });
      return;
    }

    stateSubject.next(newState);
  };

  return {
    get state() {
      return stateSubject.value;
    },
    state$: stateSubject.asObservable(),
    setState
  };
}

export default interface StateHandler<TState> extends StateProvider<TState> {
  setState(newState: TState | NewStateGetter<TState> | (TState extends {} ? RecursivePartial<TState> : never)): void;
}

function isNewStateGetter<TState>(
  newValue: RecursivePartial<TState> | NewStateGetter<TState>
): newValue is NewStateGetter<TState> {
  return typeof newValue === "function";
}
