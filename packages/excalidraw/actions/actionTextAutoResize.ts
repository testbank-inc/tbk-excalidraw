import { getFontString } from "@testbank-inc/common";

import { newElementWith } from "@testbank-inc/element";
import { measureText } from "@testbank-inc/element";

import { isTextElement } from "@testbank-inc/element";

import { CaptureUpdateAction } from "@testbank-inc/element";

import { getSelectedElements } from "../scene";

import { register } from "./register";

import type { AppClassProperties } from "../types";

export const actionTextAutoResize = register({
  name: "autoResize",
  label: "labels.autoResize",
  icon: null,
  trackEvent: { category: "element" },
  predicate: (elements, appState, _: unknown, app: AppClassProperties) => {
    const selectedElements = getSelectedElements(elements, appState);
    return (
      selectedElements.length === 1 &&
      isTextElement(selectedElements[0]) &&
      !selectedElements[0].autoResize
    );
  },
  perform: (elements, appState, _, app) => {
    const selectedElements = getSelectedElements(elements, appState);

    return {
      appState,
      elements: elements.map((element) => {
        if (element.id === selectedElements[0].id && isTextElement(element)) {
          const metrics = measureText(
            element.originalText,
            getFontString(element),
            element.lineHeight,
          );

          return newElementWith(element, {
            autoResize: true,
            width: metrics.width,
            height: metrics.height,
            text: element.originalText,
          });
        }
        return element;
      }),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
