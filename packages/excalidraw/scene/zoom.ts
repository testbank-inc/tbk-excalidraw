import type { AppState, NormalizedZoomValue } from "../types";
import { constrainScrollToPageBounds, constrainZoomForPageBounds } from "./scroll";

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
  
  // Apply zoom constraints for page bounds
  const constrainedZoom = constrainZoomForPageBounds(nextZoom, appState);

  // get original scroll position without zoom
  const baseScrollX = appState.scrollX + (appLayerX - appLayerX / currentZoom);
  const baseScrollY = appState.scrollY + (appLayerY - appLayerY / currentZoom);

  // get scroll offsets for target zoom level (using constrained zoom)
  const zoomOffsetScrollX = -(appLayerX - appLayerX / constrainedZoom);
  const zoomOffsetScrollY = -(appLayerY - appLayerY / constrainedZoom);

  let scrollX = baseScrollX + zoomOffsetScrollX;
  let scrollY = baseScrollY + zoomOffsetScrollY;

  // Apply page bounds constraint if enabled
  if (appState.canvasPageSettings?.enabled) {
    // Create a temporary state for constraint calculation
    const tempState = { 
      ...appState, 
      zoom: { value: constrainedZoom },
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
      value: constrainedZoom,
    },
  };
};
