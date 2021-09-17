import { ApplyValue, SetValueExtension } from "./../src/State";
import { skip } from "rxjs/operators";
import State, { applyNewValue, extendApplyValue, isNewValueGetter, state } from "../src/State";

describe("state", () => {
  describe("set", () => {
    const initialTestValue = 0;
    const testApplyValue = jest.fn((currentValue, newValue) => currentValue + newValue);
    let testee: State<number>;

    beforeEach(() => {
      testApplyValue.mockClear();
      testee = state({ initialValue: initialTestValue, applyValue: testApplyValue });
    });

    it("updates the new value", () => {
      // Arrange
      const newTestValue = 10;

      // Act
      testee.set(newTestValue);

      // Assert
      expect(testee.value).toEqual(initialTestValue + newTestValue);
    });

    it("emits the new value", () => {
      expect.assertions(1);

      // Arrange
      const newTestValue = 10;

      testee.value$.pipe(skip(1)).subscribe((value) => {
        // Assert
        expect(value).toEqual(initialTestValue + newTestValue);
      });

      // Act
      testee.set(newTestValue);
    });
  });
});

describe("isNewValueGetter", () => {
  it("return true if passed argument is a function", () => {
    // Arrange
    // Act
    const result = isNewValueGetter(jest.fn());

    // Assert
    expect(result).toBeTruthy();
  });

  it("return false if passed argument is not a function", () => {
    // Arrange
    // Act
    const result = isNewValueGetter(23);

    // Assert
    expect(result).toBeFalsy();
  });
});

describe("extendApplyValue", () => {
  const applyValue: ApplyValue<number> = (currentValue, newValue) => {
    if (isNewValueGetter(newValue)) {
      return newValue(currentValue);
    }
    return currentValue + newValue;
  };
  const extension1: SetValueExtension<number> = (next) => (currentValue, newValue) => {
    const nextValue = next(currentValue, newValue);

    if (nextValue === 100) {
      return 20;
    }

    return nextValue;
  };

  const extension2: SetValueExtension<number> = (next) => (currentValue, newValue) => {
    const nextValue = next(currentValue, newValue);

    if (nextValue === 10) {
      return 100;
    }

    return nextValue;
  };
  const testee = extendApplyValue([extension1, extension2], applyValue);

  it("creates enhanced ApplyValue function", () => {
    // Arrange

    // Act
    const result = testee(9, 1);

    // Assert
    expect(result).toBe(20);
  });
});

describe("applyNewValue", () => {
  const testValue = {
    firstProperty: "some test value",
    secondProperty: 42,
    thirdProperty: [{ value: 1 }, { value: 2 }, { value: 3 }]
  };

  type TestValue = typeof testValue;

  it("takes a function and passes current state to it", () => {
    // Arrange
    const updateState = jest.fn((state) => state);

    // Act
    applyNewValue(testValue, updateState);

    // Assert
    expect(updateState).toHaveBeenCalledWith(testValue);
  });

  it("takes a function and returns returned value", () => {
    // Arrange
    const newTestState: TestValue = {
      firstProperty: "something new",
      secondProperty: 696,
      thirdProperty: []
    };
    const updateState = jest.fn(() => newTestState);

    // Act
    const result = applyNewValue(testValue, updateState);

    // Assert
    expect(result).toBe(newTestState);
  });

  it("replaces a value", () => {
    // Arrange
    const currentValue = 0;
    const newValue = 10;

    // Act
    const result = applyNewValue(currentValue, newValue);

    // Assert
    expect(result).toBe(newValue);
  });
});
