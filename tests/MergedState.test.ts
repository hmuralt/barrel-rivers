import { skip } from "rxjs/operators";
import State, { state } from "../src/State";
import { SplitResult, mergedState } from "../src/MergedState";

function testMerge(values: [number, string]) {
  return `${values[0]}-${values[1]}`;
}

function testSplit(mergedValue: string) {
  const splitValues = mergedValue.split("-");
  return [parseInt(splitValues[0]), splitValues[1]] as SplitResult<number, string>;
}

describe("mergedState", () => {
  const compareMock = jest.fn((a, b) => a === b);
  const applyNewMergedValueMock = jest.fn((_a, b) => b);
  const needsFeedingSplitValue1Mock = jest.fn((_a: number, _b: number) => true);
  let testState1: State<number>;
  let testState2: State<string>;
  let testee: State<string>;

  beforeEach(() => {
    compareMock.mockClear();
    applyNewMergedValueMock.mockClear();
    needsFeedingSplitValue1Mock.mockClear();

    testState1 = state({ initialValue: 1 });
    testState2 = state({ initialValue: "a" });

    testee = mergedState<number, string, string>({
      states: [testState1, testState2],
      merge: testMerge,
      split: testSplit,
      compareMergedValue: compareMock,
      applyNewMergedValue: applyNewMergedValueMock,
      needsFeedingSplitValue1: needsFeedingSplitValue1Mock
    });
  });

  describe("value$", () => {
    it("emits the merged value", () => {
      // arrange
      const callback = jest.fn();

      // act
      testee.value$.subscribe(callback);

      // assert
      expect(callback).toHaveBeenCalledWith(testMerge([testState1.value, testState2.value]));
    });

    it("emits when compare returns false", () => {
      expect.assertions(1);
      // arrange
      const callback = jest.fn();
      const newValue1 = 2;
      testee.value$.pipe(skip(1)).subscribe(callback);
      compareMock.mockReturnValue(false);

      // act
      testState1.set(newValue1);

      // assert
      expect(callback).toHaveBeenCalledWith(testMerge([newValue1, testState2.value]));
    });

    it("does not emit when compare returns true", () => {
      expect.assertions(1);
      // arrange
      const callback = jest.fn();
      testee.value$.pipe(skip(1)).subscribe(callback);
      compareMock.mockReturnValue(true);

      // act
      testState1.set(2);

      // assert
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("value", () => {
    it("returns merged value", () => {
      // arrange
      // act
      // assert
      expect(testee.value).toBe(testMerge([testState1.value, testState2.value]));
    });
  });

  describe("set", () => {
    it("applies the new merged value by splitting it and setting state1", () => {
      // arrange
      const newValue1 = 256;

      // act
      testee.set(testMerge([newValue1, "a"]));

      // assert
      expect(testState1.value).toBe(newValue1);
    });

    it("applies the new merged value by splitting it and setting state2", () => {
      // arrange
      const newValue2 = "c";

      // act
      testee.set(testMerge([1, newValue2]));

      // assert
      expect(testState2.value).toBe(newValue2);
    });

    it("feeds split value 1 when needsFeedingSplitValue1 is returning true", () => {
      // arrange
      jest.spyOn(testState1, "set");
      needsFeedingSplitValue1Mock.mockImplementation(
        (currentValue: number, newValue: number) => currentValue !== newValue
      );

      // act
      testee.set(testMerge([testState1.value + 1, "test"]));

      // assert
      expect(testState1.set).toHaveBeenCalled();
    });

    it("doesn't feed split value 1 when needsFeedingSplitValue1 is returning false", () => {
      // arrange
      jest.spyOn(testState1, "set");
      needsFeedingSplitValue1Mock.mockImplementation(
        (currentValue: number, newValue: number) => currentValue !== newValue
      );

      // act
      testee.set(testMerge([testState1.value, "test"]));

      // assert
      expect(testState1.set).not.toHaveBeenCalled();
    });
  });
});
