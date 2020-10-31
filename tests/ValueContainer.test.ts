import { Subject } from "rxjs";
import ValueContainer, { withValueContainer } from "../src/ValueContainer";

describe("withValueContainer", () => {
  const valueMock = jest.fn(() => 323);
  const value$ = new Subject<number>();
  const testContainer: ValueContainer<number> = {
    get value() {
      return valueMock();
    },
    value$
  };

  it("creates a new object", () => {
    const target = {};

    const result = withValueContainer(testContainer)(target);

    expect(result).not.toBe(target);
  });

  it("assigns state$ to new object", () => {
    const target = {};

    const result = withValueContainer(testContainer)(target);

    expect(result.value$).toBe(value$);
  });

  it("assigns state getter to new object", () => {
    const target = {};
    const testState = 2393;
    valueMock.mockReturnValue(testState);

    const result = withValueContainer(testContainer)(target);

    expect(result.value).toBe(testState);
  });
});
