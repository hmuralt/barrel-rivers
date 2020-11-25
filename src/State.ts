import { BehaviorSubject } from "rxjs";
import ValueContainer from "./ValueContainer";

export type NewValueGetter<TValue> = (currentValue: TValue) => TValue;
export type NewValue<TValue> = TValue | NewValueGetter<TValue> | (TValue extends {} ? Partial<TValue> : never);
export type UpdateValue<TValue> = (newValue: NewValue<TValue>) => TValue;
export type Set<TValue> = (newValue: NewValue<TValue>) => void;
export type SetExtension<TValue> = (next: UpdateValue<TValue>) => UpdateValue<TValue>;

export function state<TValue>(initialValue: TValue, ...setExtensions: SetExtension<TValue>[]): State<TValue> {
  const stateSubject = new BehaviorSubject(initialValue);

  const applyNewValue = (newValue: NewValue<TValue>) => {
    if (isNewValueGetter(newValue)) {
      return newValue(stateSubject.value);
    }

    if (typeof newValue === "object" && !Array.isArray(newValue)) {
      return { ...stateSubject.value, ...newValue };
    }

    return newValue as TValue;
  };

  const updateValue = setExtensions.reduceRight((next, setExtension) => {
    return setExtension(next);
  }, applyNewValue);

  const set = (newValue: NewValue<TValue>) => {
    stateSubject.next(updateValue(newValue));
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
  set: Set<TValue>;
}

export function isNewValueGetter<TValue>(
  newValue: Partial<TValue> | NewValueGetter<TValue>
): newValue is NewValueGetter<TValue> {
  return typeof newValue === "function";
}
