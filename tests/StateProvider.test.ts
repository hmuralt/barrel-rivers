import { Subject } from "rxjs";
import StateProvider, { withStateProvider } from "../src/StateProvider";

describe("withStateProvider", () => {
  const stateMock = jest.fn(() => 323);
  const state$ = new Subject<number>();
  const testProvider: StateProvider<number> = {
    get state() {
      return stateMock();
    },
    state$
  };

  it("creates a new object", () => {
    const target = {};

    const result = withStateProvider(testProvider)(target);

    expect(result).not.toBe(target);
  });

  it("assigns state$ to new object", () => {
    const target = {};

    const result = withStateProvider(testProvider)(target);

    expect(result.state$).toBe(state$);
  });

  it("assigns state getter to new object", () => {
    const target = {};
    const testState = 2393;
    stateMock.mockReturnValue(testState);

    const result = withStateProvider(testProvider)(target);

    expect(result.state).toBe(testState);
  });
});
