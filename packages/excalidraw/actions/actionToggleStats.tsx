import { CODES, KEYS } from "@testbank-inc/common";

import { CaptureUpdateAction } from "@testbank-inc/element";

import { abacusIcon } from "../components/icons";

import { register } from "./register";

export const actionToggleStats = register({
  name: "stats",
  label: "stats.fullTitle",
  icon: abacusIcon,
  viewMode: true,
  trackEvent: { category: "menu" },
  keywords: ["edit", "attributes", "customize"],
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        stats: { ...appState.stats, open: !this.checked!(appState) },
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  checked: (appState) => appState.stats.open,
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.SLASH,
});
