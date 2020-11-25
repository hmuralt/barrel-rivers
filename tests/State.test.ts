import { skip } from "rxjs/operators";
import State, { state } from "../src/State";

const testValue = {
  firstProperty: "some test value",
  secondProperty: 42,
  thirdProperty: [{ value: 1 }, { value: 2 }, { value: 3 }]
};

type TestValue = typeof testValue;

describe("State", () => {
  let testee: State<TestValue>;

  beforeEach(() => {
    testee = state(testValue);
  });

  describe("set", () => {
    it("takes a partial state object and merges the current state with the values from passed partial state", () => {
      // Arrange
      const testPartialState: Partial<TestValue> = {
        secondProperty: 2123
      };

      // Act
      testee.set(testPartialState);

      // Assert
      expect(testee.value).toEqual({
        firstProperty: testValue.firstProperty,
        secondProperty: testPartialState.secondProperty,
        thirdProperty: testValue.thirdProperty
      });
    });

    it("takes a function and passes current state to it", () => {
      // Arrange
      const updateState = jest.fn((state) => state);

      // Act
      testee.set(updateState);

      // Assert
      expect(updateState).toHaveBeenCalledWith(testee.value);
    });

    it("takes a function and replaces the current state with state return by passed function", () => {
      // Arrange
      const newTestState: TestValue = {
        firstProperty: "something new",
        secondProperty: 696,
        thirdProperty: []
      };
      const updateState = jest.fn(() => newTestState);

      // Act
      testee.set(updateState);

      // Assert
      expect(testee.value).toBe(newTestState);
    });

    it("replaces primitive values", () => {
      // Arrange
      const primitiveTestee = state(0);
      const testValue = 10;

      // Act
      primitiveTestee.set(testValue);

      // Assert
      expect(primitiveTestee.value).toBe(testValue);
    });

    it("results in emitting primitive values", () => {
      expect.assertions(1);

      // Arrange
      const primitiveTestee = state(0);
      const testValue = -10;

      primitiveTestee.value$.pipe(skip(1)).subscribe((value) => {
        // Assert
        expect(value).toBe(testValue);
      });

      // Act
      primitiveTestee.set(testValue);
    });

    it("does a shallow merge", () => {
      // Arrange
      // Act
      testee.set({ thirdProperty: [] });

      // Assert
      expect(testee.value.thirdProperty.length).toBe(0);
    });
  });
});
