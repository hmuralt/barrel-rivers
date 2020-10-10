import { skip } from "rxjs/operators";
import StateHandler, { RecursivePartial, createStateHandler } from "../src/StateHandler";

const testState = {
  firstProperty: "some test value",
  secondProperty: 42,
  thirdProperty: [{ value: 1 }, { value: 2 }, { value: 3 }]
};

type TestState = typeof testState;

describe("StateHandler", () => {
  let testee: StateHandler<TestState>;

  beforeEach(() => {
    testee = createStateHandler(testState);
  });

  describe("setState", () => {
    it("takes a partial state object and merges the current state with the values from passed partial state", () => {
      // Arrange
      const testPartialState: RecursivePartial<TestState> = {
        secondProperty: 2123
      };

      // Act
      testee.setState(testPartialState);

      // Assert
      expect(testee.state).toEqual({
        firstProperty: testState.firstProperty,
        secondProperty: testPartialState.secondProperty,
        thirdProperty: testState.thirdProperty
      });
    });

    it("takes a function and passes current state to it", () => {
      // Arrange
      const updateState = jest.fn((state) => state);

      // Act
      testee.setState(updateState);

      // Assert
      expect(updateState).toHaveBeenCalledWith(testee.state);
    });

    it("takes a function and replaces the current state with state return by passed function", () => {
      // Arrange
      const newTestState: TestState = {
        firstProperty: "something new",
        secondProperty: 696,
        thirdProperty: []
      };
      const updateState = jest.fn(() => newTestState);

      // Act
      testee.setState(updateState);

      // Assert
      expect(testee.state).toBe(newTestState);
    });

    it("replaces primitive values", () => {
      // Arrange
      const primitiveTestee = createStateHandler(0);
      const testValue = 10;

      // Act
      primitiveTestee.setState(testValue);

      // Assert
      expect(primitiveTestee.state).toBe(testValue);
    });

    it("results in emitting primitive values", () => {
      expect.assertions(1);

      // Arrange
      const primitiveTestee = createStateHandler(0);
      const testValue = -10;

      primitiveTestee.state$.pipe(skip(1)).subscribe((value) => {
        // Assert
        expect(value).toBe(testValue);
      });

      // Act
      primitiveTestee.setState(testValue);
    });

    it("does a shallow merge", () => {
      // Arrange
      // Act
      testee.setState({ thirdProperty: [] });

      // Assert
      expect(testee.state.thirdProperty.length).toBe(0);
    });
  });
});
