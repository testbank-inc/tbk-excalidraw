import { getVisibleElements } from "@testbank-inc/element";
import {
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
} from "@testbank-inc/common";

import { getClosestElementBounds } from "@testbank-inc/element";

import { getCommonBounds } from "@testbank-inc/element";

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

  const pageWidth = 1000; //canvasPageSettings.width;
  const pageHeight = 1000; //canvasPageSettings.height;
  const viewportWidth = width / zoom.value;
  const viewportHeight = height / zoom.value;

  // 스크롤 제한: 페이지 영역 (0,0)~(pageWidth,pageHeight) 내에서만 이동
  const maxScrollX = 0;
  const maxScrollY = 0;
  const minScrollX = Math.min(0, -(pageWidth - viewportWidth));
  const minScrollY = Math.min(0, -(pageHeight - viewportHeight));

  return {
    scrollX: Math.max(minScrollX, Math.min(maxScrollX, scrollX)),
    scrollY: Math.max(minScrollY, Math.min(maxScrollY, scrollY)),
  };
};

export const constrainZoomForPageBounds = (
  zoom: number,
  appState: AppState,
): number => {
  const { canvasPageSettings, width, height } = appState;

  if (!canvasPageSettings?.enabled) {
    return zoom;
  }

  const pageWidth = 1000; // 캔버스 크기는 항상 1000x1000 고정
  const pageHeight = 1000;

  // 컨테이너 크기와 페이지 크기에 따른 적절한 줌 계산
  const scaleX = width / pageWidth;
  const scaleY = height / pageHeight;
  const minZoom = Math.min(scaleX, scaleY);
  const maxZoom = 5;

  return Math.max(minZoom, Math.min(maxZoom, zoom));
};
