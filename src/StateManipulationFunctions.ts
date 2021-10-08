import clone from "lodash.clone";

interface GetCall {
  target: {};
  key: PropertyKey;
}

export type PropertySelector<TObject, TPropertyValue> = (obj: TObject) => TPropertyValue;
export type NewValueGetter<TValue> = (currentValue: TValue) => TValue;
export type Predicate<TItem> = (item: TItem) => boolean;

export function shallowMerge<TObject extends {}, TPartial extends Partial<TObject>>(partial: TPartial) {
  return (currentObject: TObject): TObject => ({ ...currentObject, ...partial });
}

export function update<TObject extends {}, TPropertyValue>(
  propertySelector: PropertySelector<TObject, TPropertyValue>,
  newValue: TPropertyValue | NewValueGetter<TPropertyValue>
) {
  return (currentObject: TObject): TObject => {
    const getCalls: GetCall[] = [];
    const proxiedObject = getProxiedObject(currentObject, (getCall) => getCalls.push(getCall));
    propertySelector(proxiedObject);

    const value = isNewValueGetter(newValue) ? newValue(propertySelector(currentObject)) : newValue;

    return updateObject<TObject, TPropertyValue>(getCalls, value);
  };
}

export function property<TObject extends {}, TKey extends keyof TObject>(key: TKey, newValue: TObject[TKey]) {
  return (currentObject: TObject): TObject => {
    const value = isNewValueGetter(newValue) ? newValue(currentObject[key]) : newValue;

    return { ...currentObject, [key]: value };
  };
}

export function addArrayItem<TItem>(item: TItem) {
  return (arrayToUpdate: TItem[]): TItem[] => [...arrayToUpdate, item];
}

export function removeArrayItem<TItem>(item: TItem | Predicate<TItem>): (arrayToUpdate: TItem[]) => TItem[] {
  const isStayingInArray = isPredicate(item)
    ? (currentItem: TItem) => !item(currentItem)
    : (currentItem: TItem) => currentItem !== item;
  return (arrayToUpdate: TItem[]) => {
    return arrayToUpdate.filter(isStayingInArray);
  };
}

export function addOrReplaceArrayItem<TItem>(
  item: TItem,
  predicate: Predicate<TItem>
): (arrayToUpdate: TItem[]) => TItem[] {
  return (arrayToUpdate: TItem[]): TItem[] => {
    let isUpdated = false;
    const updatedArray = arrayToUpdate.map((currentItem) => {
      if (predicate(currentItem)) {
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

export function updateArrayItem<TItem extends {}>(
  item: Partial<TItem>,
  predicate: Predicate<TItem>
): (arrayToUpdate: TItem[]) => TItem[] {
  return (arrayToUpdate: TItem[]) => {
    return arrayToUpdate.map((currentItem) => {
      if (predicate(currentItem)) {
        return { ...currentItem, ...item };
      }

      return currentItem;
    });
  };
}

export function replaceArrayItem<TItem>(item: TItem, predicate: Predicate<TItem>): (arrayToUpdate: TItem[]) => TItem[] {
  return (arrayToUpdate: TItem[]) => {
    return arrayToUpdate.map((currentItem) => {
      if (predicate(currentItem)) {
        return item;
      }

      return currentItem;
    });
  };
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

function isPredicate<T>(predicate: T | Predicate<T>): predicate is Predicate<T> {
  return typeof predicate === "function";
}
