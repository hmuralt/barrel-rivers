/* eslint-disable @typescript-eslint/no-empty-function */
import State, { NewValue, state } from "../src/State";
import AsyncLoadableState, { asyncLoadableState } from "../src/AsyncLoadableState";
import { Subject } from "rxjs";

describe("AsyncState", () => {
  let testState: State<number>;
  let testee: AsyncLoadableState<number>;

  beforeEach(() => {
    testState = state({ initialValue: 0 });
    jest.spyOn(testState, "set");
    testee = asyncLoadableState(testState);
  });

  describe("set", () => {
    it("sets passed new value", () => {
      // Arrange
      const newValue = 1;

      // Act
      testee.set(newValue);

      // Assert
      expect(testState.set).toHaveBeenCalledWith(newValue);
    });

    it("sets passed new value getter", () => {
      // Arrange
      const newValue = () => 1;

      // Act
      testee.set(newValue);

      // Assert
      expect(testState.set).toHaveBeenCalledWith(newValue);
    });

    it("sets promise new value", async () => {
      // Arrange
      const newValue = 2;
      const promise = Promise.resolve(newValue);

      // Act
      testee.set(promise);

      // Assert
      await promise;
      expect(testState.set).toHaveBeenCalledWith(newValue);
    });

    it("sets promise new value getter", async () => {
      // Arrange
      const newValue = () => 7;
      const promise = Promise.resolve(newValue);

      // Act
      testee.set(promise);

      // Assert
      await promise;
      expect(testState.set).toHaveBeenCalledWith(newValue);
    });

    it("sets observable new value", async () => {
      // Arrange
      const newValue = 5;
      const subject = new Subject<NewValue<number>>();
      const observable = subject.asObservable();

      // Act
      testee.set(observable);
      subject.next(newValue);
      subject.complete();

      // Assert
      expect(testState.set).toHaveBeenCalledWith(newValue);
    });

    it("sets observable new value getter", async () => {
      // Arrange
      const newValue = () => 6;
      const subject = new Subject<NewValue<number>>();
      const observable = subject.asObservable();

      // Act
      testee.set(observable);
      subject.next(newValue);
      subject.complete();

      // Assert
      expect(testState.set).toHaveBeenCalledWith(newValue);
    });
  });

  describe("setStatus$", () => {
    it("emits isLoading when promise set", async () => {
      // Arrange
      const promise = Promise.resolve(5);
      const statusCallback = jest.fn();
      testee.setStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise);

      // Assert
      await promise;
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false });
    });

    it("emits error when promise set and error is thrown", async () => {
      // Arrange
      const error = new Error("test error");
      const promise = Promise.reject(error);
      const statusCallback = jest.fn();
      testee.setStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise);

      // Assert
      await promise.catch(() => {});
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, error });
    });

    it("emits isLoading when observable set", async () => {
      // Arrange
      const newValue = 5;
      const subject = new Subject<NewValue<number>>();
      const observable = subject.asObservable();
      const statusCallback = jest.fn();
      testee.setStatus$.subscribe(statusCallback);

      // Act
      testee.set(observable);
      subject.next(newValue);
      subject.complete();

      // Assert
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false });
    });

    it("emits error when observable set and error is thrown", async () => {
      // Arrange
      const subject = new Subject<NewValue<number>>();
      const observable = subject.asObservable();
      const statusCallback = jest.fn();
      const error = new Error("test error");
      testee.setStatus$.subscribe(statusCallback);

      // Act
      testee.set(observable);
      subject.error(error);

      // Assert
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, error });
    });
  });

  describe("overallSetStatus$", () => {
    it("emits isLoading when promise set", async () => {
      // Arrange
      const promise = Promise.resolve(5);
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise);

      // Assert
      await promise;
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, errors: [] });
    });

    it("emits isLoading when multiple promise are set", async () => {
      // Arrange
      const promise1 = Promise.resolve(5);
      const promise2 = Promise.resolve(2);
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise1);
      testee.set(promise2);

      // Assert
      await Promise.all([promise1, promise2]);
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, errors: [] });
    });

    it("emits error when promise set and error is thrown", async () => {
      // Arrange
      const error = new Error("test error");
      const promise = Promise.reject(error);
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise);

      // Assert
      await promise.catch(() => {});
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, errors: [error] });
    });

    it("emits error when multiple promise are set and error is thrown", async () => {
      // Arrange
      const error1 = new Error("test error 1");
      const error2 = new Error("test error 2");
      const promise1 = Promise.reject(error1);
      const promise2 = Promise.reject(error2);
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise1);
      testee.set(promise2);

      // Assert
      await Promise.all([promise1.catch(() => {}), promise2.catch(() => {})]);
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: true, errors: [error1] });
      expect(statusCallback).toHaveBeenNthCalledWith(4, { isLoading: false, errors: [error1, error2] });
    });

    it("emits isLoading when observable set", async () => {
      // Arrange
      const newValue = 5;
      const subject = new Subject<NewValue<number>>();
      const observable = subject.asObservable();
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(observable);
      subject.next(newValue);
      subject.complete();

      // Assert
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, errors: [] });
    });

    it("emits isLoading when multiple observable are set", async () => {
      // Arrange
      const newValue1 = 5;
      const newValue2 = 2;
      const subject1 = new Subject<NewValue<number>>();
      const subject2 = new Subject<NewValue<number>>();
      const observable1 = subject1.asObservable();
      const observable2 = subject2.asObservable();
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(observable1);
      testee.set(observable2);
      subject1.next(newValue1);
      subject1.complete();
      subject2.next(newValue2);
      subject2.complete();

      // Assert
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, errors: [] });
    });

    it("emits error when observable set and error is thrown", async () => {
      // Arrange
      const subject = new Subject<NewValue<number>>();
      const observable = subject.asObservable();
      const statusCallback = jest.fn();
      const error = new Error("test error");
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(observable);
      subject.error(error);

      // Assert
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: false, errors: [error] });
    });

    it("emits error when multiple observable are set and error is thrown", async () => {
      // Arrange
      const subject1 = new Subject<NewValue<number>>();
      const subject2 = new Subject<NewValue<number>>();
      const observable1 = subject1.asObservable();
      const observable2 = subject2.asObservable();
      const statusCallback = jest.fn();
      const error1 = new Error("test error 1");
      const error2 = new Error("test error 2");
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(observable1);
      testee.set(observable2);
      subject1.error(error1);
      subject2.error(error2);

      // Assert
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: true, errors: [error1] });
      expect(statusCallback).toHaveBeenNthCalledWith(4, { isLoading: false, errors: [error1, error2] });
    });

    it("resets errors when new resolved promise is set", async () => {
      // Arrange
      const error = new Error("test error");
      const promise1 = Promise.reject(error);
      const promise2 = Promise.resolve(5);
      const statusCallback = jest.fn();
      testee.overallSetStatus$.subscribe(statusCallback);

      // Act
      testee.set(promise1);
      testee.set(promise2);

      // Assert
      await promise1.catch(() => {});
      await promise2;
      expect(statusCallback).toHaveBeenNthCalledWith(1, { isLoading: false, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(2, { isLoading: true, errors: [] });
      expect(statusCallback).toHaveBeenNthCalledWith(3, { isLoading: true, errors: [error] });
      expect(statusCallback).toHaveBeenNthCalledWith(4, { isLoading: false, errors: [] });
    });
  });
});
