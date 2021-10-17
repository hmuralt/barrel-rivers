import { combineLatest } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import State, { applyNewValue, ApplyValue, NewValue } from "./State";

export interface MergedStateOptions<TValue1, TValue2, TMergedValue> {
  states: [State<TValue1>, State<TValue2>];
  merge: (values: [TValue1, TValue2]) => TMergedValue;
  split: (mergedValue: TMergedValue) => [NewValue<TValue1>, NewValue<TValue2>];
  compare?: (x: TMergedValue, y: TMergedValue) => boolean;
  applyNewMergedValue?: ApplyValue<TMergedValue>;
}

export function mergedState<TValue1, TValue2, TMergedValue>({
  states,
  merge,
  split,
  compare,
  applyNewMergedValue = applyNewValue
}: MergedStateOptions<TValue1, TValue2, TMergedValue>): State<TMergedValue> {
  const mergedValue$ = combineLatest([states[0].value$, states[1].value$]).pipe(
    map((values) => merge(values)),
    distinctUntilChanged(compare)
  );

  const set = (newMergedValue: NewValue<TMergedValue>) => {
    const currentMergedValue = merge([states[0].value, states[1].value]);
    const splitValues = split(applyNewMergedValue(currentMergedValue, newMergedValue));

    states[0].set(splitValues[0]);
    states[1].set(splitValues[1]);
  };

  return {
    value$: mergedValue$,
    get value() {
      return merge([states[0].value, states[1].value]);
    },
    set
  };
}
