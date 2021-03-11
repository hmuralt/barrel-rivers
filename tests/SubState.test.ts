import { skip } from "rxjs/operators";
import State, { state } from "../src/State";
import { subState } from "../src/SubState";

interface Value {
  firstProperty: string;
  secondProperty: {
    aSubProperty: number;
  };
}

const testValue: Value = {
  firstProperty: "some test value",
  secondProperty: {
    aSubProperty: 32
  }
};

describe("subState", () => {
  const compareMock = jest.fn((a, b) => a === b);
  const applySubValueMock = jest.fn((_a, b) => b);
  let testState: State<Value>;
  let testee: State<number>;

  beforeEach(() => {
    compareMock.mockClear();
    applySubValueMock.mockClear();

    testState = state({ initialValue: testValue });

    testee = subState<Value, number>({
      state: testState,
      select: (value) => value.secondProperty.aSubProperty,
      merge: (value, subValue) => {
        return {
          ...value,
          secondProperty: {
            ...value.secondProperty,
            aSubProperty: subValue
          }
        };
      },
      compare: compareMock,
      applySubValue: applySubValueMock
    });
  });

  describe("value$", () => {
    it("emits sub value based on the selector", () => {
      // arrange
      const callback = jest.fn();

      // act
      testee.value$.subscribe(callback);

      // assert
      expect(callback).toHaveBeenCalledWith(testState.value.secondProperty.aSubProperty);
    });

    it("emits when compare returns false", () => {
      expect.assertions(1);
      // arrange
      const callback = jest.fn();
      const newValue = 323;
      testee.value$.pipe(skip(1)).subscribe(callback);
      compareMock.mockReturnValue(false);

      // act
      testState.set({ secondProperty: { aSubProperty: newValue } });

      // assert
      expect(callback).toHaveBeenCalledWith(newValue);
    });

    it("does not emit when compare returns true", () => {
      expect.assertions(1);
      // arrange
      const callback = jest.fn();
      testee.value$.pipe(skip(1)).subscribe(callback);
      compareMock.mockReturnValue(true);

      // act
      testState.set({ secondProperty: { aSubProperty: testState.value.secondProperty.aSubProperty } });

      // assert
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("value", () => {
    it("returns sub value based on the selector", () => {
      // arrange
      // act
      // assert
      expect(testee.value).toBe(testState.value.secondProperty.aSubProperty);
    });
  });

  describe("set", () => {
    it("applies the new sub value, merges it with the hole value and sets that new value", () => {
      // arrange
      const newSubValue = 256;

      // act
      testee.set(newSubValue);

      // assert
      expect(testState.value.secondProperty.aSubProperty).toBe(newSubValue);
    });
  });
});
