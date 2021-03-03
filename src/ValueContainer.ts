import { Observable } from "rxjs";

export default interface ValueContainer<TValue> {
  readonly value: TValue;
  readonly value$: Observable<TValue>;
}

export function withValueContainer<TValue>(valueContainer: ValueContainer<TValue>) {
  return <TTarget extends {}>(target: TTarget): TTarget & ValueContainer<TValue> => {
    const extendedObject = {
      ...target,
      value$: valueContainer.value$
    };

    return Object.defineProperty(extendedObject, "value", { get: () => valueContainer.value });
  };
}
