import { Observable } from "rxjs";

export default interface StateProvider<TState> {
  readonly state: TState;
  state$: Observable<TState>;
}

export function withStateProvider<TState>(stateProvider: StateProvider<TState>) {
  return <TTarget extends {}>(target: TTarget): TTarget & StateProvider<TState> => {
    const extendedObject = {
      ...target,
      state$: stateProvider.state$
    };

    return Object.defineProperty(extendedObject, "state", { get: () => stateProvider.state });
  };
}
