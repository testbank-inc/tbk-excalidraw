import { register } from "./register";
import { KEYS } from "@excalidraw/common";
import { trackEvent } from "../analytics";
import { CaptureUpdateAction } from "@excalidraw/element";
import { t } from "../i18n";

export const actionTogglePageSettings = register({
  name: "pageSettings",
  label: "labels.pageSettings",
  trackEvent: { category: "canvas", action: "togglePageSettings" },
  perform: (elements, appState) => {
    const isOpen = appState.openDialog?.name === "pageSettings";
    
    return {
      appState: {
        ...appState,
        openDialog: isOpen ? null : { name: "pageSettings" },
      },
      elements,
      commitToHistory: false,
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  keyTest: (event) => event.key === KEYS.P && event.ctrlKey,
});

