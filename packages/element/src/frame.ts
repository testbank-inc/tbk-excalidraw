import { arrayToMap } from "@testbank-inc/common";
import { isPointWithinBounds, pointFrom } from "@testbank-inc/math";
import { doLineSegmentsIntersect } from "@excalidraw/utils/bbox";
import { elementsOverlappingBBox } from "@excalidraw/utils/withinBounds";

import type {
  AppClassProperties,
  AppState,
  StaticCanvasAppState,
} from "@excalidraw/excalidraw/types";

import type { ReadonlySetLike } from "@excalidraw/common/utility-types";

import { getElementsWithinSelection, getSelectedElements } from "./selection";
import { getElementsInGroup, selectGroupsFromGivenElements } from "./groups";

import {
  getElementLineSegments,
  getCommonBounds,
  getElementAbsoluteCoords,
} from "./bounds";
import { mutateElement } from "./mutateElement";
import { getBoundTextElement, getContainerElement } from "./textElement";
import {
  isFrameElement,
  isFrameLikeElement,
  isTextElement,
} from "./typeChecks";

import type { ExcalidrawElementsIncludingDeleted } from "./Scene";

import type {
  ElementsMap,
  ElementsMapOrArray,
  ExcalidrawElement,
  ExcalidrawFrameLikeElement,
  NonDeleted,
  NonDeletedExcalidrawElement,
} from "./types";

// --------------------------- Frame State ------------------------------------
export const bindElementsToFramesAfterDuplication = (
  nextElements: readonly ExcalidrawElement[],
  origElements: readonly ExcalidrawElement[],
  origIdToDuplicateId: Map<ExcalidrawElement["id"], ExcalidrawElement["id"]>,
) => {
  const nextElementMap = arrayToMap(nextElements) as Map<
    ExcalidrawElement["id"],
    ExcalidrawElement
  >;

  for (const element of origElements) {
    if (element.frameId) {
      // use its frameId to get the new frameId
      const nextElementId = origIdToDuplicateId.get(element.id);
      const nextFrameId = origIdToDuplicateId.get(element.frameId);
      const nextElement = nextElementId && nextElementMap.get(nextElementId);
      if (nextElement) {
        mutateElement(nextElement, nextElementMap, {
          frameId: nextFrameId ?? null,
        });
      }
    }
  }
};

export function isElementIntersectingFrame(
  element: ExcalidrawElement,
  frame: ExcalidrawFrameLikeElement,
  elementsMap: ElementsMap,
) {
  const frameLineSegments = getElementLineSegments(frame, elementsMap);

  const elementLineSegments = getElementLineSegments(element, elementsMap);

  const intersecting = frameLineSegments.some((frameLineSegment) =>
    elementLineSegments.some((elementLineSegment) =>
      doLineSegmentsIntersect(frameLineSegment, elementLineSegment),
    ),
  );

  return intersecting;
}

export const getElementsCompletelyInFrame = (
  elements: readonly ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
  elementsMap: ElementsMap,
) =>
  omitGroupsContainingFrameLikes(
    getElementsWithinSelection(elements, frame, elementsMap, false),
  ).filter(
    (element) =>
      (!isFrameLikeElement(element) && !element.frameId) ||
      element.frameId === frame.id,
  );

export const isElementContainingFrame = (
  element: ExcalidrawElement,
  frame: ExcalidrawFrameLikeElement,
  elementsMap: ElementsMap,
) => {
  return getElementsWithinSelection([frame], element, elementsMap).some(
    (e) => e.id === frame.id,
  );
};

export const getElementsIntersectingFrame = (
  elements: readonly ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
) => {
  const elementsMap = arrayToMap(elements);
  return elements.filter((element) =>
    isElementIntersectingFrame(element, frame, elementsMap),
  );
};

export const elementsAreInFrameBounds = (
  elements: readonly ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
  elementsMap: ElementsMap,
) => {
  const [frameX1, frameY1, frameX2, frameY2] = getElementAbsoluteCoords(
    frame,
    elementsMap,
  );

  const [elementX1, elementY1, elementX2, elementY2] =
    getCommonBounds(elements);

  return (
    frameX1 <= elementX1 &&
    frameY1 <= elementY1 &&
    frameX2 >= elementX2 &&
    frameY2 >= elementY2
  );
};

export const elementOverlapsWithFrame = (
  element: ExcalidrawElement,
  frame: ExcalidrawFrameLikeElement,
  elementsMap: ElementsMap,
) => {
  return (
    elementsAreInFrameBounds([element], frame, elementsMap) ||
    isElementIntersectingFrame(element, frame, elementsMap) ||
    isElementContainingFrame(element, frame, elementsMap)
  );
};

export const isCursorInFrame = (
  cursorCoords: {
    x: number;
    y: number;
  },
  frame: NonDeleted<ExcalidrawFrameLikeElement>,
  elementsMap: ElementsMap,
) => {
  const [fx1, fy1, fx2, fy2] = getElementAbsoluteCoords(frame, elementsMap);

  return isPointWithinBounds(
    pointFrom(fx1, fy1),
    pointFrom(cursorCoords.x, cursorCoords.y),
    pointFrom(fx2, fy2),
  );
};

export const groupsAreAtLeastIntersectingTheFrame = (
  elements: readonly NonDeletedExcalidrawElement[],
  groupIds: readonly string[],
  frame: ExcalidrawFrameLikeElement,
) => {
  const elementsMap = arrayToMap(elements);
  const elementsInGroup = groupIds.flatMap((groupId) =>
    getElementsInGroup(elements, groupId),
  );

  if (elementsInGroup.length === 0) {
    return true;
  }

  return !!elementsInGroup.find(
    (element) =>
      elementsAreInFrameBounds([element], frame, elementsMap) ||
      isElementIntersectingFrame(element, frame, elementsMap),
  );
};

export const groupsAreCompletelyOutOfFrame = (
  elements: readonly NonDeletedExcalidrawElement[],
  groupIds: readonly string[],
  frame: ExcalidrawFrameLikeElement,
) => {
  const elementsMap = arrayToMap(elements);
  const elementsInGroup = groupIds.flatMap((groupId) =>
    getElementsInGroup(elements, groupId),
  );

  if (elementsInGroup.length === 0) {
    return true;
  }

  return (
    elementsInGroup.find(
      (element) =>
        elementsAreInFrameBounds([element], frame, elementsMap) ||
        isElementIntersectingFrame(element, frame, elementsMap),
    ) === undefined
  );
};

// --------------------------- Frame Utils ------------------------------------

/**
 * Returns a map of frameId to frame elements. Includes empty frames.
 */
export const groupByFrameLikes = (elements: readonly ExcalidrawElement[]) => {
  const frameElementsMap = new Map<
    ExcalidrawElement["id"],
    ExcalidrawElement[]
  >();

  for (const element of elements) {
    const frameId = isFrameLikeElement(element) ? element.id : element.frameId;
    if (frameId && !frameElementsMap.has(frameId)) {
      frameElementsMap.set(frameId, getFrameChildren(elements, frameId));
    }
  }

  return frameElementsMap;
};

export const getFrameChildren = (
  allElements: ElementsMapOrArray,
  frameId: string,
) => {
  const frameChildren: ExcalidrawElement[] = [];
  for (const element of allElements.values()) {
    if (element.frameId === frameId) {
      frameChildren.push(element);
    }
  }
  return frameChildren;
};

export const getFrameLikeElements = (
  allElements: ExcalidrawElementsIncludingDeleted,
): ExcalidrawFrameLikeElement[] => {
  return allElements.filter((element): element is ExcalidrawFrameLikeElement =>
    isFrameLikeElement(element),
  );
};

/**
 * Returns ExcalidrawFrameElements and non-frame-children elements.
 *
 * Considers children as root elements if they point to a frame parent
 * non-existing in the elements set.
 *
 * Considers non-frame bound elements (container or arrow labels) as root.
 */
export const getRootElements = (
  allElements: ExcalidrawElementsIncludingDeleted,
) => {
  const frameElements = arrayToMap(getFrameLikeElements(allElements));
  return allElements.filter(
    (element) =>
      frameElements.has(element.id) ||
      !element.frameId ||
      !frameElements.has(element.frameId),
  );
};

export const getElementsInResizingFrame = (
  allElements: ExcalidrawElementsIncludingDeleted,
  frame: ExcalidrawFrameLikeElement,
  appState: AppState,
  elementsMap: ElementsMap,
): ExcalidrawElement[] => {
  const prevElementsInFrame = getFrameChildren(allElements, frame.id);
  const nextElementsInFrame = new Set<ExcalidrawElement>(prevElementsInFrame);

  const elementsCompletelyInFrame = new Set([
    ...getElementsCompletelyInFrame(allElements, frame, elementsMap),
    ...prevElementsInFrame.filter((element) =>
      isElementContainingFrame(element, frame, elementsMap),
    ),
  ]);

  const elementsNotCompletelyInFrame = prevElementsInFrame.filter(
    (element) => !elementsCompletelyInFrame.has(element),
  );

  // for elements that are completely in the frame
  // if they are part of some groups, then those groups are still
  // considered to belong to the frame
  const groupsToKeep = new Set<string>(
    Array.from(elementsCompletelyInFrame).flatMap(
      (element) => element.groupIds,
    ),
  );

  for (const element of elementsNotCompletelyInFrame) {
    if (!isElementIntersectingFrame(element, frame, elementsMap)) {
      if (element.groupIds.length === 0) {
        nextElementsInFrame.delete(element);
      }
    } else if (element.groupIds.length > 0) {
      // group element intersects with the frame, we should keep the groups
      // that this element is part of
      for (const id of element.groupIds) {
        groupsToKeep.add(id);
      }
    }
  }

  for (const element of elementsNotCompletelyInFrame) {
    if (element.groupIds.length > 0) {
      let shouldRemoveElement = true;

      for (const id of element.groupIds) {
        if (groupsToKeep.has(id)) {
          shouldRemoveElement = false;
        }
      }

      if (shouldRemoveElement) {
        nextElementsInFrame.delete(element);
      }
    }
  }

  const individualElementsCompletelyInFrame = Array.from(
    elementsCompletelyInFrame,
  ).filter((element) => element.groupIds.length === 0);

  for (const element of individualElementsCompletelyInFrame) {
    nextElementsInFrame.add(element);
  }

  const newGroupElementsCompletelyInFrame = Array.from(
    elementsCompletelyInFrame,
  ).filter((element) => element.groupIds.length > 0);

  const groupIds = selectGroupsFromGivenElements(
    newGroupElementsCompletelyInFrame,
    appState,
  );

  // new group elements
  for (const [id, isSelected] of Object.entries(groupIds)) {
    if (isSelected) {
      const elementsInGroup = getElementsInGroup(allElements, id);

      if (elementsAreInFrameBounds(elementsInGroup, frame, elementsMap)) {
        for (const element of elementsInGroup) {
          nextElementsInFrame.add(element);
        }
      }
    }
  }

  return [...nextElementsInFrame].filter((element) => {
    return !(isTextElement(element) && element.containerId);
  });
};

export const getElementsInNewFrame = (
  elements: ExcalidrawElementsIncludingDeleted,
  frame: ExcalidrawFrameLikeElement,
  elementsMap: ElementsMap,
) => {
  return omitPartialGroups(
    omitGroupsContainingFrameLikes(
      elements,
      getElementsCompletelyInFrame(elements, frame, elementsMap),
    ),
    frame,
    elementsMap,
  );
};

export const omitPartialGroups = (
  elements: ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
  allElementsMap: ElementsMap,
) => {
  const elementsToReturn = [];
  const checkedGroups = new Map<string, boolean>();

  for (const element of elements) {
    let shouldOmit = false;
    if (element.groupIds.length > 0) {
      // if some partial group should be omitted, then all elements in that group should be omitted
      if (element.groupIds.some((gid) => checkedGroups.get(gid))) {
        shouldOmit = true;
      } else {
        const allElementsInGroup = new Set(
          element.groupIds.flatMap((gid) =>
            getElementsInGroup(allElementsMap, gid),
          ),
        );

        shouldOmit = !elementsAreInFrameBounds(
          Array.from(allElementsInGroup),
          frame,
          allElementsMap,
        );
      }

      element.groupIds.forEach((gid) => {
        checkedGroups.set(gid, shouldOmit);
      });
    }

    if (!shouldOmit) {
      elementsToReturn.push(element);
    }
  }

  return elementsToReturn;
};

export const getContainingFrame = (
  element: ExcalidrawElement,
  elementsMap: ElementsMap,
) => {
  if (!element.frameId) {
    return null;
  }
  return (elementsMap.get(element.frameId) ||
    null) as null | ExcalidrawFrameLikeElement;
};

// --------------------------- Frame Operations -------------------------------

/** */
export const filterElementsEligibleAsFrameChildren = (
  elements: readonly ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
) => {
  const otherFrames = new Set<ExcalidrawFrameLikeElement["id"]>();
  const elementsMap = arrayToMap(elements);
  elements = omitGroupsContainingFrameLikes(elements);

  for (const element of elements) {
    if (isFrameLikeElement(element) && element.id !== frame.id) {
      otherFrames.add(element.id);
    }
  }

  const processedGroups = new Set<ExcalidrawElement["id"]>();

  const eligibleElements: ExcalidrawElement[] = [];

  for (const element of elements) {
    // don't add frames or their children
    if (
      isFrameLikeElement(element) ||
      (element.frameId && otherFrames.has(element.frameId))
    ) {
      continue;
    }

    if (element.groupIds.length) {
      const shallowestGroupId = element.groupIds.at(-1)!;
      if (!processedGroups.has(shallowestGroupId)) {
        processedGroups.add(shallowestGroupId);
        const groupElements = getElementsInGroup(elements, shallowestGroupId);
        if (
          groupElements.some((el) =>
            elementOverlapsWithFrame(el, frame, elementsMap),
          )
        ) {
          for (const child of groupElements) {
            eligibleElements.push(child);
          }
        }
      }
    } else {
      const overlaps = elementOverlapsWithFrame(element, frame, elementsMap);
      if (overlaps) {
        eligibleElements.push(element);
      }
    }
  }

  return eligibleElements;
};

/**
 * Retains (or repairs for target frame) the ordering invriant where children
 * elements come right before the parent frame:
 * [el, el, child, child, frame, el]
 *
 * @returns mutated allElements (same data structure)
 */
export const addElementsToFrame = <T extends ElementsMapOrArray>(
  allElements: T,
  elementsToAdd: NonDeletedExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
  appState: AppState,
): T => {
  const elementsMap = arrayToMap(allElements);
  const currTargetFrameChildrenMap = new Map<ExcalidrawElement["id"], true>();
  for (const element of allElements.values()) {
    if (element.frameId === frame.id) {
      currTargetFrameChildrenMap.set(element.id, true);
    }
  }

  const suppliedElementsToAddSet = new Set(elementsToAdd.map((el) => el.id));

  const finalElementsToAdd: ExcalidrawElement[] = [];

  const otherFrames = new Set<ExcalidrawFrameLikeElement["id"]>();

  for (const element of elementsToAdd) {
    if (isFrameLikeElement(element) && element.id !== frame.id) {
      otherFrames.add(element.id);
    }
  }

  // - add bound text elements if not already in the array
  // - filter out elements that are already in the frame
  for (const element of omitGroupsContainingFrameLikes(
    allElements,
    elementsToAdd,
  )) {
    // don't add frames or their children
    if (
      isFrameLikeElement(element) ||
      (element.frameId && otherFrames.has(element.frameId))
    ) {
      continue;
    }

    // if the element is already in another frame (which is also in elementsToAdd),
    // it means that frame and children are selected at the same time
    // => keep original frame membership, do not add to the target frame
    if (
      element.frameId &&
      appState.selectedElementIds[element.id] &&
      appState.selectedElementIds[element.frameId]
    ) {
      continue;
    }

    if (!currTargetFrameChildrenMap.has(element.id)) {
      finalElementsToAdd.push(element);
    }

    const boundTextElement = getBoundTextElement(element, elementsMap);
    if (
      boundTextElement &&
      !suppliedElementsToAddSet.has(boundTextElement.id) &&
      !currTargetFrameChildrenMap.has(boundTextElement.id)
    ) {
      finalElementsToAdd.push(boundTextElement);
    }
  }

  for (const element of finalElementsToAdd) {
    mutateElement(element, elementsMap, {
      frameId: frame.id,
    });
  }

  return allElements;
};

export const removeElementsFromFrame = (
  elementsToRemove: ReadonlySetLike<NonDeletedExcalidrawElement>,
  elementsMap: ElementsMap,
) => {
  const _elementsToRemove = new Map<
    ExcalidrawElement["id"],
    ExcalidrawElement
  >();

  const toRemoveElementsByFrame = new Map<
    ExcalidrawFrameLikeElement["id"],
    ExcalidrawElement[]
  >();

  for (const element of elementsToRemove) {
    if (element.frameId) {
      _elementsToRemove.set(element.id, element);

      const arr = toRemoveElementsByFrame.get(element.frameId) || [];
      arr.push(element);

      const boundTextElement = getBoundTextElement(element, elementsMap);
      if (boundTextElement) {
        _elementsToRemove.set(boundTextElement.id, boundTextElement);
        arr.push(boundTextElement);
      }

      toRemoveElementsByFrame.set(element.frameId, arr);
    }
  }

  for (const [, element] of _elementsToRemove) {
    mutateElement(element, elementsMap, {
      frameId: null,
    });
  }
};

export const removeAllElementsFromFrame = <T extends ExcalidrawElement>(
  allElements: readonly T[],
  frame: ExcalidrawFrameLikeElement,
) => {
  const elementsInFrame = getFrameChildren(allElements, frame.id);
  removeElementsFromFrame(elementsInFrame, arrayToMap(allElements));
  return allElements;
};

export const replaceAllElementsInFrame = <T extends ExcalidrawElement>(
  allElements: readonly T[],
  nextElementsInFrame: ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
  app: AppClassProperties,
): T[] => {
  return addElementsToFrame(
    removeAllElementsFromFrame(allElements, frame),
    nextElementsInFrame,
    frame,
    app.state,
  ).slice();
};

/** does not mutate elements, but returns new ones */
export const updateFrameMembershipOfSelectedElements = <
  T extends ElementsMapOrArray,
>(
  allElements: T,
  appState: AppState,
  app: AppClassProperties,
) => {
  const selectedElements = app.scene.getSelectedElements({
    selectedElementIds: appState.selectedElementIds,
    // supplying elements explicitly in case we're passed non-state elements
    elements: allElements,
  });
  const elementsToFilter = new Set<ExcalidrawElement>(selectedElements);

  if (appState.editingGroupId) {
    for (const element of selectedElements) {
      if (element.groupIds.length === 0) {
        elementsToFilter.add(element);
      } else {
        element.groupIds
          .flatMap((gid) => getElementsInGroup(allElements, gid))
          .forEach((element) => elementsToFilter.add(element));
      }
    }
  }

  const elementsToRemove = new Set<ExcalidrawElement>();

  const elementsMap = arrayToMap(allElements);

  elementsToFilter.forEach((element) => {
    if (
      element.frameId &&
      !isFrameLikeElement(element) &&
      !isElementInFrame(element, elementsMap, appState)
    ) {
      elementsToRemove.add(element);
    }
  });

  if (elementsToRemove.size > 0) {
    removeElementsFromFrame(elementsToRemove, elementsMap);
  }
  return allElements;
};

/**
 * filters out elements that are inside groups that contain a frame element
 * anywhere in the group tree
 */
export const omitGroupsContainingFrameLikes = (
  allElements: ElementsMapOrArray,
  /** subset of elements you want to filter. Optional perf optimization so we
   * don't have to filter all elements unnecessarily
   */
  selectedElements?: readonly ExcalidrawElement[],
) => {
  const uniqueGroupIds = new Set<string>();
  const elements = selectedElements || allElements;

  for (const el of elements.values()) {
    const topMostGroupId = el.groupIds[el.groupIds.length - 1];
    if (topMostGroupId) {
      uniqueGroupIds.add(topMostGroupId);
    }
  }

  const rejectedGroupIds = new Set<string>();
  for (const groupId of uniqueGroupIds) {
    if (
      getElementsInGroup(allElements, groupId).some((el) =>
        isFrameLikeElement(el),
      )
    ) {
      rejectedGroupIds.add(groupId);
    }
  }

  const ret: ExcalidrawElement[] = [];

  for (const element of elements.values()) {
    if (!rejectedGroupIds.has(element.groupIds[element.groupIds.length - 1])) {
      ret.push(element);
    }
  }

  return ret;
};

/**
 * depending on the appState, return target frame, which is the frame the given element
 * is going to be added to or remove from
 */
export const getTargetFrame = (
  element: ExcalidrawElement,
  elementsMap: ElementsMap,
  appState: StaticCanvasAppState,
) => {
  const _element = isTextElement(element)
    ? getContainerElement(element, elementsMap) || element
    : element;

  // if the element and its containing frame are both selected, then
  // the containing frame is the target frame
  if (
    _element.frameId &&
    appState.selectedElementIds[_element.id] &&
    appState.selectedElementIds[_element.frameId]
  ) {
    return getContainingFrame(_element, elementsMap);
  }

  return appState.selectedElementIds[_element.id] &&
    appState.selectedElementsAreBeingDragged
    ? appState.frameToHighlight
    : getContainingFrame(_element, elementsMap);
};

// TODO: this a huge bottleneck for large scenes, optimise
// given an element, return if the element is in some frame
export const isElementInFrame = (
  element: ExcalidrawElement,
  allElementsMap: ElementsMap,
  appState: StaticCanvasAppState,
  opts?: {
    targetFrame?: ExcalidrawFrameLikeElement;
    checkedGroups?: Map<string, boolean>;
  },
) => {
  const frame =
    opts?.targetFrame ?? getTargetFrame(element, allElementsMap, appState);

  if (!frame) {
    return false;
  }

  const _element = isTextElement(element)
    ? getContainerElement(element, allElementsMap) || element
    : element;

  const setGroupsInFrame = (isInFrame: boolean) => {
    if (opts?.checkedGroups) {
      _element.groupIds.forEach((groupId) => {
        opts.checkedGroups?.set(groupId, isInFrame);
      });
    }
  };

  if (
    // if the element is not selected, or it is selected but not being dragged,
    // frame membership won't update, so return true
    !appState.selectedElementIds[_element.id] ||
    !appState.selectedElementsAreBeingDragged ||
    // if both frame and element are selected, won't update membership, so return true
    (appState.selectedElementIds[_element.id] &&
      appState.selectedElementIds[frame.id])
  ) {
    return true;
  }

  if (_element.groupIds.length === 0) {
    return elementOverlapsWithFrame(_element, frame, allElementsMap);
  }

  for (const gid of _element.groupIds) {
    if (opts?.checkedGroups?.has(gid)) {
      return opts.checkedGroups.get(gid)!!;
    }
  }

  const allElementsInGroup = new Set(
    _element.groupIds
      .filter((gid) => {
        if (opts?.checkedGroups) {
          return !opts.checkedGroups.has(gid);
        }
        return true;
      })
      .flatMap((gid) => getElementsInGroup(allElementsMap, gid)),
  );

  if (appState.editingGroupId && appState.selectedElementsAreBeingDragged) {
    const selectedElements = new Set(
      getSelectedElements(allElementsMap, appState),
    );

    const editingGroupOverlapsFrame = appState.frameToHighlight !== null;

    if (editingGroupOverlapsFrame) {
      return true;
    }

    selectedElements.forEach((selectedElement) => {
      allElementsInGroup.delete(selectedElement);
    });
  }

  for (const elementInGroup of allElementsInGroup) {
    if (isFrameLikeElement(elementInGroup)) {
      setGroupsInFrame(false);
      return false;
    }
  }

  for (const elementInGroup of allElementsInGroup) {
    if (elementOverlapsWithFrame(elementInGroup, frame, allElementsMap)) {
      setGroupsInFrame(true);
      return true;
    }
  }

  return false;
};

export const shouldApplyFrameClip = (
  element: ExcalidrawElement,
  frame: ExcalidrawFrameLikeElement,
  appState: StaticCanvasAppState,
  elementsMap: ElementsMap,
  checkedGroups?: Map<string, boolean>,
) => {
  if (!appState.frameRendering || !appState.frameRendering.clip) {
    return false;
  }

  // for individual elements, only clip when the element is
  // a. overlapping with the frame, or
  // b. containing the frame, for example when an element is used as a background
  //    and is therefore bigger than the frame and completely contains the frame
  const shouldClipElementItself =
    isElementIntersectingFrame(element, frame, elementsMap) ||
    isElementContainingFrame(element, frame, elementsMap);

  if (shouldClipElementItself) {
    for (const groupId of element.groupIds) {
      checkedGroups?.set(groupId, true);
    }

    return true;
  }

  // if an element is outside the frame, but is part of a group that has some elements
  // "in" the frame, we should clip the element
  if (
    !shouldClipElementItself &&
    element.groupIds.length > 0 &&
    !elementsAreInFrameBounds([element], frame, elementsMap)
  ) {
    let shouldClip = false;

    // if no elements are being dragged, we can skip the geometry check
    // because we know if the element is in the given frame or not
    if (!appState.selectedElementsAreBeingDragged) {
      shouldClip = element.frameId === frame.id;
      for (const groupId of element.groupIds) {
        checkedGroups?.set(groupId, shouldClip);
      }
    } else {
      shouldClip = isElementInFrame(element, elementsMap, appState, {
        targetFrame: frame,
        checkedGroups,
      });
    }

    for (const groupId of element.groupIds) {
      checkedGroups?.set(groupId, shouldClip);
    }

    return shouldClip;
  }

  return false;
};

const DEFAULT_FRAME_NAME = "Frame";
const DEFAULT_AI_FRAME_NAME = "AI Frame";

export const getDefaultFrameName = (element: ExcalidrawFrameLikeElement) => {
  // TODO name frames "AI" only if specific to AI frames
  return isFrameElement(element) ? DEFAULT_FRAME_NAME : DEFAULT_AI_FRAME_NAME;
};

export const getFrameLikeTitle = (element: ExcalidrawFrameLikeElement) => {
  return element.name === null ? getDefaultFrameName(element) : element.name;
};

export const getElementsOverlappingFrame = (
  elements: readonly ExcalidrawElement[],
  frame: ExcalidrawFrameLikeElement,
) => {
  return (
    elementsOverlappingBBox({
      elements,
      bounds: frame,
      type: "overlap",
    })
      // removes elements who are overlapping, but are in a different frame,
      // and thus invisible in target frame
      .filter((el) => !el.frameId || el.frameId === frame.id)
  );
};

export const frameAndChildrenSelectedTogether = (
  selectedElements: readonly ExcalidrawElement[],
) => {
  const selectedElementsMap = arrayToMap(selectedElements);

  return (
    selectedElements.length > 1 &&
    selectedElements.some(
      (element) => element.frameId && selectedElementsMap.has(element.frameId),
    )
  );
};
