import { exportToSvg } from "@excalidraw/utils/export";
import { useEffect, useState } from "react";

import { COLOR_PALETTE } from "@testbank-inc/common";

import { atom, useAtom } from "../editor-jotai";

import type { LibraryItem } from "../types";

export type SvgCache = Map<LibraryItem["id"], SVGSVGElement>;

export const libraryItemSvgsCache = atom<SvgCache>(new Map());

const exportLibraryItemToSvg = async (elements: LibraryItem["elements"]) => {
  return await exportToSvg({
    elements,
    appState: {
      exportBackground: false,
      viewBackgroundColor: COLOR_PALETTE.white,
    },
    files: null,
    renderEmbeddables: false,
    skipInliningFonts: true,
  });
};

export const useLibraryItemSvg = (
  id: LibraryItem["id"] | null,
  elements: LibraryItem["elements"] | undefined,
  svgCache: SvgCache,
): SVGSVGElement | undefined => {
  const [svg, setSvg] = useState<SVGSVGElement>();

  useEffect(() => {
    if (elements) {
      if (id) {
        // Try to load cached svg
        const cachedSvg = svgCache.get(id);

        if (cachedSvg) {
          setSvg(cachedSvg);
        } else {
          // When there is no svg in cache export it and save to cache
          (async () => {
            const exportedSvg = await exportLibraryItemToSvg(elements);
            // TODO: should likely be removed for custom fonts
            exportedSvg.querySelector(".style-fonts")?.remove();

            if (exportedSvg) {
              svgCache.set(id, exportedSvg);
              setSvg(exportedSvg);
            }
          })();
        }
      } else {
        // When we have no id (usualy selected items from canvas) just export the svg
        (async () => {
          const exportedSvg = await exportLibraryItemToSvg(elements);
          setSvg(exportedSvg);
        })();
      }
    }
  }, [id, elements, svgCache, setSvg]);

  return svg;
};

export const useLibraryCache = () => {
  const [svgCache] = useAtom(libraryItemSvgsCache);

  const clearLibraryCache = () => svgCache.clear();

  const deleteItemsFromLibraryCache = (items: LibraryItem["id"][]) => {
    items.forEach((item) => svgCache.delete(item));
  };

  return {
    clearLibraryCache,
    deleteItemsFromLibraryCache,
    svgCache,
  };
};
