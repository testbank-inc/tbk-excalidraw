import { CODES, KEYS } from "@testbank-inc/common";

import { CaptureUpdateAction } from "@testbank-inc/element";

import { eyeIcon } from "../components/icons";

import { register } from "./register";

export const actionToggleViewMode = register({
  name: "viewMode",
  label: "labels.viewMode",
  icon: eyeIcon,
  viewMode: true,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.viewModeEnabled,
  },
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        viewModeEnabled: !this.checked!(appState),
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  checked: (appState) => appState.viewModeEnabled,
  predicate: (elements, appState, appProps) => {
    return typeof appProps.viewModeEnabled === "undefined";
  },
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.R,
});
