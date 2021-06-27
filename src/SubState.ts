import { distinctUntilChanged, map } from "rxjs/operators";
import State, { applyNewValue, ApplyValue, NewValue } from "./State";

export interface SubStateOptions<TValue, TSubValue> {
  state: State<TValue>;
  select: (value: TValue) => TSubValue;
  merge: (subValue: TSubValue) => NewValue<TValue>;
  compare?: (x: TSubValue, y: TSubValue) => boolean;
  applySubValue?: ApplyValue<TSubValue>;
}

export function subState<TValue, TSubValue>({
  state,
  select,
  merge,
  compare,
  applySubValue = applyNewValue
}: SubStateOptions<TValue, TSubValue>): State<TSubValue> {
  const subValue$ = state.value$.pipe(
    map((value) => select(value)),
    distinctUntilChanged(compare)
  );

  const set = (newSubValue: NewValue<TSubValue>) => {
    const currentValue = state.value;
    const subValueToMerge = applySubValue(select(currentValue), newSubValue);

    state.set(merge(subValueToMerge));
  };

  return {
    value$: subValue$,
    get value() {
      return select(state.value);
    },
    set
  };
}
