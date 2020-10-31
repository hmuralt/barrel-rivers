import { BehaviorSubject } from "rxjs";
import ValueContainer from "./ValueContainer";

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
export type NewValueGetter<TValue> = (currentValue: TValue) => TValue;

export function state<TValue>(initialValue: TValue): State<TValue> {
  const stateSubject = new BehaviorSubject(initialValue);

  const set = (newValue: TValue | NewValueGetter<TValue>) => {
    if (isNewValueGetter(newValue)) {
      stateSubject.next(newValue(stateSubject.value));
      return;
    }

    if (typeof newValue === "object" && !Array.isArray(newValue)) {
      stateSubject.next({ ...stateSubject.value, ...newValue });
      return;
    }

    stateSubject.next(newValue);
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
  set(newValue: TValue | NewValueGetter<TValue> | (TValue extends {} ? RecursivePartial<TValue> : never)): void;
}

function isNewValueGetter<TValue>(
  newValue: RecursivePartial<TValue> | NewValueGetter<TValue>
): newValue is NewValueGetter<TValue> {
  return typeof newValue === "function";
}
