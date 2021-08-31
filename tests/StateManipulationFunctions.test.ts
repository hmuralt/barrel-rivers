import {
  update,
  addArrayItem,
  addOrReplaceArrayItem,
  removeArrayItem,
  shallowMerge,
  updateArrayItem,
  replaceArrayItem
} from "../src/StateManipulationFunctions";

describe("shallowMerge", () => {
  it("merges an object with a partial of the same type", () => {
    const testObject = { propertyOne: 1, propertyTwo: 2 };
    const testPartial: Partial<typeof testObject> = { propertyOne: 11 };
    const testee = shallowMerge(testPartial);

    const result = testee(testObject);

    expect(result.propertyOne).toBe(testPartial.propertyOne);
    expect(result.propertyTwo).toBe(testObject.propertyTwo);
  });
});

describe("update", () => {
  const testObject = {
    prop1: 1,
    prop2: "some string value",
    prop3: [4, 7],
    sub1: {
      propSub11: 2,
      propSub12: [1, 2, 3]
    }
  };
  type TestObject = typeof testObject;

  it("returns a function to update an objects property value by passing a new value", () => {
    const newValue = 2323;
    const testee = update<TestObject, number>((state) => state.prop1, newValue);

    const result = testee(testObject);

    expect(result.prop1).toBe(newValue);
  });

  it("returns a function to update an objects array property value by passing a new array getter callback", () => {
    const newValue = 2323;
    const testee = update<TestObject, number[]>(
      (state) => state.prop3,
      (arrayToUpdate) => [...arrayToUpdate, newValue]
    );

    const result = testee(testObject);

    expect(result.prop3[0]).toBe(testObject.prop3[0]);
    expect(result.prop3[1]).toBe(testObject.prop3[1]);
    expect(result.prop3[2]).toBe(newValue);
  });

  it("returns a function to update an objects property value by passing a new value getter callback", () => {
    const testee = update<TestObject, number>(
      (state) => state.prop1,
      (oldValue) => oldValue + 1
    );

    const result = testee(testObject);

    expect(result.prop1).toBe(testObject.prop1 + 1);
  });

  it("returns a function to update only one property value of an object", () => {
    const newValue = "new string";
    const testee = update<TestObject, string>((state) => state.prop2, newValue);

    const result = testee(testObject);

    expect(result.prop1).toBe(testObject.prop1);
    expect(result.prop2).toBe(newValue);
  });

  it("returns a function that clones an objects when updated", () => {
    const newValue = 2323;
    const testee = update<TestObject, number>((state) => state.prop1, newValue);

    const result = testee(testObject);

    expect(result).not.toBe(testObject);
  });

  describe("updating sub objects", () => {
    it("returns a function to update a sub objects property value by passing a new value", () => {
      const newValue = 1555;
      const testee = update<TestObject, number>((state) => state.sub1.propSub11, newValue);

      const result = testee(testObject);

      expect(result.sub1.propSub11).toBe(newValue);
    });

    it("returns a function that clones a sub objects when updated", () => {
      const newValue = 1555;
      const testee = update<TestObject, number>((state) => state.sub1.propSub11, newValue);

      const result = testee(testObject);

      expect(result.sub1).not.toBe(testObject.sub1);
    });

    it("returns a function to update a sub objects array property value by passing index selector and a new value", () => {
      const newValue = 987;
      const testee = update<TestObject, number>((state) => state.sub1.propSub12[0], newValue);

      const result = testee(testObject);

      expect(result.sub1.propSub12[0]).toBe(newValue);
    });

    it("returns a function that clones a sub objects array property when updated", () => {
      const newValue = 987;
      const testee = update<TestObject, number>((state) => state.sub1.propSub12[0], newValue);

      const result = testee(testObject);

      expect(result.sub1.propSub12).not.toBe(testObject.sub1.propSub12);
    });
  });
});

describe("addArrayItem", () => {
  it("returns a function to add the passed item to an array", () => {
    const testItem = 32;
    const testee = addArrayItem(testItem);

    const result = testee([255, 326]);

    expect(result[2]).toBe(testItem);
  });
});

describe("removeArrayItem", () => {
  it("returns a function to remove from an array by predicate", () => {
    const testItem = 32;
    const testee = removeArrayItem((item) => item === testItem);

    const result = testee([255, 326, 32]);

    expect(result.length).toBe(2);
    expect(result).not.toContain(testItem);
  });
});

describe("addOrReplaceArrayItem", () => {
  it("returns a function to add the passed primitive item to an array when predicate is false", () => {
    const testItem = { id: 3 };
    const testee = addOrReplaceArrayItem(testItem, () => false);

    const result = testee([{ id: 1 }, { id: 2 }]);

    expect(result[2]).toBe(testItem);
  });

  it("returns a function to replace item(s) of an array with the passed item when predicate is true", () => {
    const testItem = { id: 3, prop1: "a new test string" };

    const testee = addOrReplaceArrayItem(testItem, (item) => item.id === testItem.id);

    const result = testee([
      { id: 1, prop1: "another string" },
      { id: 2, prop1: "yet another string" },
      { id: 3, prop1: "a test string" }
    ]);

    expect(result[2]).toBe(testItem);
  });
});

describe("updateArrayItem", () => {
  it("returns a function to update item(s) of an array with the properties of the passed item when predicate is true", () => {
    const testItem = { id: 3, prop1: "a new test string" };

    const testee = updateArrayItem(testItem, (item) => item.id === testItem.id);

    const result = testee([
      { id: 1, prop1: "another string" },
      { id: 2, prop1: "yet another string" },
      { id: 3, prop1: "a test string" }
    ]);

    expect(result[2].prop1).toBe(testItem.prop1);
    expect(result[2]).not.toBe(testItem);
  });
});

describe("replaceArrayItem", () => {
  it("returns a function to replace item(s) of an array with the properties of the passed item when predicate is true", () => {
    const testItem = { id: 3, prop1: "a new test string" };

    const testee = replaceArrayItem(testItem, (item) => item.id === testItem.id);

    const result = testee([
      { id: 1, prop1: "another string" },
      { id: 2, prop1: "yet another string" },
      { id: 3, prop1: "a test string" }
    ]);

    expect(result[2]).toBe(testItem);
  });
});
