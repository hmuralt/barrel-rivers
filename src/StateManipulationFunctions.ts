import clone from "lodash.clone";
import eq from "lodash.eq";

export type PropertySelector<TState, TPropertyValue> = (state: TState) => TPropertyValue;
export type NewValueGetter<TValue> = (currentValue: TValue) => TValue;

interface GetCall {
  target: {};
  key: PropertyKey;
}

export function set<TState extends {}, TPropertyValue>(
  propertySelector: PropertySelector<TState, TPropertyValue>,
  newValue: TPropertyValue | NewValueGetter<TPropertyValue>
) {
  return (currentState: TState): TState => {
    const getCalls: GetCall[] = [];
    const proxiedState = getProxiedObject(currentState, (getCall) => getCalls.push(getCall));
    propertySelector(proxiedState);

    const value = isNewValueGetter(newValue) ? newValue(propertySelector(currentState)) : newValue;

    return updateObject<TState, TPropertyValue>(getCalls, value);
  };
}

export function addArrayItem<TItem>(item: TItem) {
  return (arrayToUpdate: TItem[]): TItem[] => [...arrayToUpdate, item];
}

export function removeArrayItem<TItem>(
  item: TItem,
  isEqual?: (a: TItem, b: TItem) => boolean
): (arrayToUpdate: TItem[]) => TItem[] {
  const isEqualItem = isEqual ?? eq;
  return (arrayToUpdate: TItem[]) => {
    return arrayToUpdate.filter((currentItem) => !isEqualItem(currentItem, item));
  };
}

export function addOrUpdateArrayItem<TItem>(
  item: TItem,
  isEqual?: (a: TItem, b: TItem) => boolean
): (arrayToUpdate: TItem[]) => TItem[] {
  const isEqualItem = isEqual ?? eq;
  return (arrayToUpdate: TItem[]): TItem[] => {
    let isUpdated = false;
    const updatedArray = arrayToUpdate.map((currentItem) => {
      if (isEqualItem(currentItem, item)) {
        isUpdated = true;
        return item;
      }

      return currentItem;
    });

    if (!isUpdated) {
      updatedArray.push(item);
    }

    return updatedArray;
  };
}

export function updateArrayItem<TItem>(
  item: Partial<TItem>,
  isEqual?: (a: Partial<TItem>, b: Partial<TItem>) => boolean
): (arrayToUpdate: TItem[]) => TItem[] {
  const isEqualItem = isEqual ?? eq;
  return (arrayToUpdate: TItem[]) => {
    return arrayToUpdate.map((currentItem) => {
      if (isEqualItem(currentItem, item)) {
        return {
          ...currentItem,
          ...item
        };
      }

      return currentItem;
    });
  };
}

export function withEqual<TItem>(property: keyof TItem) {
  return (a: Partial<TItem>, b: Partial<TItem>): boolean =>
    a[property] !== undefined && b[property] !== undefined && a[property] === b[property];
}

function getProxiedObject<TObject extends object>(obj: TObject, addGetCall: (getCall: GetCall) => void): TObject {
  return new Proxy(obj, {
    get: (target, key, receiver) => {
      addGetCall({
        target,
        key
      });

      const value = Reflect.get(target, key, receiver);

      if (typeof value === "object") {
        return getProxiedObject(value, addGetCall);
      }

      return value;
    }
  });
}

function updateObject<TObject extends object, TValue>(getCalls: GetCall[], value: TValue) {
  let newValue: object | TValue = value;

  while (getCalls.length > 0) {
    const getCall = getCalls.pop();

    if (getCall === undefined) {
      continue;
    }

    const clonedTarget = clone(getCall.target);
    Reflect.set(clonedTarget, getCall.key, newValue);
    newValue = clonedTarget;
  }

  return newValue as TObject;
}

function isNewValueGetter<T>(newValue: T | NewValueGetter<T>): newValue is NewValueGetter<T> {
  return typeof newValue === "function";
}
