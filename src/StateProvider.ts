import { Observable } from "rxjs";

export default interface StateProvider<TState> {
  readonly state: TState;
  state$: Observable<TState>;
}
