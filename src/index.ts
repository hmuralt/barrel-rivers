export * from "./StateManipulationFunctions";
export { shallowMerge as merge } from "./StateManipulationFunctions";
export {
  default as State,
  StateOptions,
  NewValueGetter,
  NewValue,
  ApplyValue,
  SetValue,
  SetValueExtension,
  state,
  isNewValueGetter,
  extendApplyValue,
  applyNewValue
} from "./State";
export { subState } from "./SubState";
export { mergedState } from "./MergedState";
export { default as ValueContainer, withValueContainer } from "./ValueContainer";
