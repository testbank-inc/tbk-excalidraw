import type { Scene } from "@testbank-inc/element";

import { getNormalizedGridStep } from "../../scene";

import StatsDragInput from "./DragInput";
import { getStepSizedValue } from "./utils";

import type { AppState } from "../../types";

interface PositionProps {
  property: "gridStep";
  scene: Scene;
  appState: AppState;
  setAppState: React.Component<any, AppState>["setState"];
}

const STEP_SIZE = 5;

const CanvasGrid = ({
  property,
  scene,
  appState,
  setAppState,
}: PositionProps) => {
  return (
    <StatsDragInput
      label="Grid step"
      sensitivity={8}
      elements={[]}
      dragInputCallback={({
        nextValue,
        instantChange,
        shouldChangeByStepSize,
        setInputValue,
      }) => {
        setAppState((state) => {
          let nextGridStep;

          if (nextValue) {
            nextGridStep = nextValue;
          } else if (instantChange) {
            nextGridStep = shouldChangeByStepSize
              ? getStepSizedValue(
                  state.gridStep + STEP_SIZE * Math.sign(instantChange),
                  STEP_SIZE,
                )
              : state.gridStep + instantChange;
          }

          if (!nextGridStep) {
            setInputValue(state.gridStep);
            return null;
          }

          nextGridStep = getNormalizedGridStep(nextGridStep);
          setInputValue(nextGridStep);
          return {
            gridStep: nextGridStep,
          };
        });
      }}
      scene={scene}
      value={appState.gridStep}
      property={property}
      appState={appState}
    />
  );
};

export default CanvasGrid;
