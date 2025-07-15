import type { AppState, NormalizedZoomValue } from "../types";
import { constrainScrollToPageBounds } from "./scroll";

export const getStateForZoom = (
  {
    viewportX,
    viewportY,
    nextZoom,
  }: {
    viewportX: number;
    viewportY: number;
    nextZoom: NormalizedZoomValue;
  },
  appState: AppState,
) => {
  const appLayerX = viewportX - appState.offsetLeft;
  const appLayerY = viewportY - appState.offsetTop;

  const currentZoom = appState.zoom.value;

  // get original scroll position without zoom
  const baseScrollX = appState.scrollX + (appLayerX - appLayerX / currentZoom);
  const baseScrollY = appState.scrollY + (appLayerY - appLayerY / currentZoom);

  // get scroll offsets for target zoom level
  const zoomOffsetScrollX = -(appLayerX - appLayerX / nextZoom);
  const zoomOffsetScrollY = -(appLayerY - appLayerY / nextZoom);

  let scrollX = baseScrollX + zoomOffsetScrollX;
  let scrollY = baseScrollY + zoomOffsetScrollY;

  // Apply page bounds constraint if enabled
  if (appState.canvasPageSettings?.enabled) {
    // Create a temporary state for constraint calculation
    const tempState = { 
      ...appState, 
      zoom: { value: nextZoom },
      scrollX,
      scrollY,
      width: appState.width,
      height: appState.height
    };
    
    const constrainedScroll = constrainScrollToPageBounds(
      scrollX,
      scrollY,
      tempState
    );
    scrollX = constrainedScroll.scrollX;
    scrollY = constrainedScroll.scrollY;
  }

  return {
    scrollX,
    scrollY,
    zoom: {
      value: nextZoom,
    },
  };
};
