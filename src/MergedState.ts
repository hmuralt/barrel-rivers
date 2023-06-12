import { combineLatest } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import State, { applyNewValue, ApplyValue, NeedsFeedingNewValue, NewValue } from "./State";

export type SplitResult<TValue1, TValue2> = [TValue1, TValue2];

export interface MergedStateOptions<TValue1, TValue2, TMergedValue> {
  states: [State<TValue1>, State<TValue2>];
  merge: (values: [TValue1, TValue2]) => TMergedValue;
  split: (mergedValue: TMergedValue) => SplitResult<TValue1, TValue2>;
  compareMergedValue?: (x: TMergedValue, y: TMergedValue) => boolean;
  applyNewMergedValue?: ApplyValue<TMergedValue>;
  needsFeedingSplitValue1?: NeedsFeedingNewValue<TValue1>;
  needsFeedingSplitValue2?: NeedsFeedingNewValue<TValue2>;
}

export function mergedState<TValue1, TValue2, TMergedValue>({
  states,
  merge,
  split,
  compareMergedValue,
  applyNewMergedValue = applyNewValue,
  needsFeedingSplitValue1,
  needsFeedingSplitValue2
}: MergedStateOptions<TValue1, TValue2, TMergedValue>): State<TMergedValue> {
  const mergedValue$ = combineLatest([states[0].value$, states[1].value$]).pipe(
    map((values) => merge(values)),
    distinctUntilChanged(compareMergedValue)
  );

  const set = (newMergedValue: NewValue<TMergedValue>) => {
    const currentValue1 = states[0].value;
    const currentValue2 = states[1].value;
    const currentMergedValue = merge([currentValue1, currentValue2]);
    const splitValues = split(applyNewMergedValue(currentMergedValue, newMergedValue));

    if (needsFeedingSplitValue1 === undefined || needsFeedingSplitValue1(currentValue1, splitValues[0]))
      states[0].set(splitValues[0]);

    if (needsFeedingSplitValue2 === undefined || needsFeedingSplitValue2(currentValue2, splitValues[1]))
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
