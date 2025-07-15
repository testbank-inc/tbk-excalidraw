import { getVisibleElements } from "@excalidraw/element";
import {
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
} from "@excalidraw/common";

import { getClosestElementBounds } from "@excalidraw/element";

import { getCommonBounds } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import type { AppState, Offsets, PointerCoords, Zoom } from "../types";

const isOutsideViewPort = (appState: AppState, cords: Array<number>) => {
  const [x1, y1, x2, y2] = cords;
  const { x: viewportX1, y: viewportY1 } = sceneCoordsToViewportCoords(
    { sceneX: x1, sceneY: y1 },
    appState,
  );
  const { x: viewportX2, y: viewportY2 } = sceneCoordsToViewportCoords(
    { sceneX: x2, sceneY: y2 },
    appState,
  );
  return (
    viewportX2 - viewportX1 > appState.width ||
    viewportY2 - viewportY1 > appState.height
  );
};

export const centerScrollOn = ({
  scenePoint,
  viewportDimensions,
  zoom,
  offsets,
}: {
  scenePoint: PointerCoords;
  viewportDimensions: { height: number; width: number };
  zoom: Zoom;
  offsets?: Offsets;
}) => {
  let scrollX =
    (viewportDimensions.width - (offsets?.right ?? 0)) / 2 / zoom.value -
    scenePoint.x;

  scrollX += (offsets?.left ?? 0) / 2 / zoom.value;

  let scrollY =
    (viewportDimensions.height - (offsets?.bottom ?? 0)) / 2 / zoom.value -
    scenePoint.y;

  scrollY += (offsets?.top ?? 0) / 2 / zoom.value;

  return {
    scrollX,
    scrollY,
  };
};

export const calculateScrollCenter = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
): { scrollX: number; scrollY: number } => {
  elements = getVisibleElements(elements);

  if (!elements.length) {
    return {
      scrollX: 0,
      scrollY: 0,
    };
  }
  let [x1, y1, x2, y2] = getCommonBounds(elements);

  if (isOutsideViewPort(appState, [x1, y1, x2, y2])) {
    [x1, y1, x2, y2] = getClosestElementBounds(
      elements,
      viewportCoordsToSceneCoords(
        { clientX: appState.scrollX, clientY: appState.scrollY },
        appState,
      ),
    );
  }

  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  return centerScrollOn({
    scenePoint: { x: centerX, y: centerY },
    viewportDimensions: { width: appState.width, height: appState.height },
    zoom: appState.zoom,
  });
};

export const constrainScrollToPageBounds = (
  scrollX: number,
  scrollY: number,
  appState: AppState,
): { scrollX: number; scrollY: number } => {
  const { canvasPageSettings, zoom, width, height } = appState;
  
  if (!canvasPageSettings?.enabled) {
    return { scrollX, scrollY };
  }

  const viewportWidth = width / zoom.value;
  const viewportHeight = height / zoom.value;
  
  // Page bounds: (0, 0) to (pageWidth, pageHeight)
  const pageWidth = canvasPageSettings.width;
  const pageHeight = canvasPageSettings.height;
  
  // Scroll limits based on page and viewport dimensions
  // In Excalidraw, scroll values can be negative
  // scrollX/scrollY represent the top-left corner of the viewport in scene coordinates
  
  // When page fits in viewport, center it
  if (pageWidth <= viewportWidth && pageHeight <= viewportHeight) {
    const centerX = -(viewportWidth - pageWidth) / 2;
    const centerY = -(viewportHeight - pageHeight) / 2;
    return {
      scrollX: centerX,
      scrollY: centerY,
    };
  }
  
  // When page is larger than viewport, allow scrolling within bounds
  const minScrollX = Math.min(0, -(pageWidth - viewportWidth));
  const maxScrollX = 0;
  
  const minScrollY = Math.min(0, -(pageHeight - viewportHeight));
  const maxScrollY = 0;
  
  return {
    scrollX: Math.max(minScrollX, Math.min(maxScrollX, scrollX)),
    scrollY: Math.max(minScrollY, Math.min(maxScrollY, scrollY)),
  };
};
