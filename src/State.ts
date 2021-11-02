import { BehaviorSubject } from "rxjs";
import ValueContainer from "./ValueContainer";

export type NewValueGetter<TValue> = (currentValue: TValue) => TValue;
export type NewValue<TValue> = TValue | NewValueGetter<TValue>;
export type ApplyValue<TValue> = (currentValue: TValue, newValue: NewValue<TValue>) => TValue;
export type SetValue<TValue> = (newValue: NewValue<TValue>) => void;
export type ApplyValueExtension<TValue> = (next: ApplyValue<TValue>) => ApplyValue<TValue>;

export interface StateOptions<TValue> {
  initialValue: TValue;
  applyValue?: ApplyValue<TValue>;
}

export function state<TValue>({ initialValue, applyValue = applyNewValue }: StateOptions<TValue>): State<TValue> {
  const stateSubject = new BehaviorSubject(initialValue);

  const set = (newValue: NewValue<TValue>) => {
    stateSubject.next(applyValue(stateSubject.value, newValue));
  };

  return {
    get value() {
      return stateSubject.value;
    },
    value$: stateSubject.asObservable(),
    set
  };
}

export default interface State<TValue> extends ValueContainer<TValue> {
  set: SetValue<TValue>;
}

export function isNewValueGetter<TValue>(
  newValue: Partial<TValue> | NewValueGetter<TValue>
): newValue is NewValueGetter<TValue> {
  return typeof newValue === "function";
}

export function extendApplyValue<TValue>(
  applyValueExtensions: ApplyValueExtension<TValue>[],
  applyValue: ApplyValue<TValue> = applyNewValue
): ApplyValue<TValue> {
  return applyValueExtensions.reduceRight(
    (next: ApplyValue<TValue>, applyValueExtension: ApplyValueExtension<TValue>) => {
      return applyValueExtension(next);
    },
    applyValue
  );
}

export function applyNewValue<TValue>(currentValue: TValue, newValue: NewValue<TValue>): TValue {
  if (isNewValueGetter(newValue)) {
    return newValue(currentValue);
  }

  return newValue;
}
