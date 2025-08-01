import clsx from "clsx";

import { THEME } from "@testbank-inc/common";

import type { Theme } from "@excalidraw/element/types";

import {
  actionClearCanvas,
  actionLoadScene,
  actionSaveToActiveFile,
  actionShortcuts,
  actionToggleSearchMenu,
  actionToggleTheme,
  actionTogglePageSettings,
} from "../../actions";
import { getShortcutFromShortcutName } from "../../actions/shortcuts";
import { trackEvent } from "../../analytics";
import { useUIAppState } from "../../context/ui-appState";
import { useSetAtom } from "../../editor-jotai";
import { useI18n } from "../../i18n";
import { activeConfirmDialogAtom } from "../ActiveConfirmDialog";
import {
  useExcalidrawSetAppState,
  useExcalidrawActionManager,
  useExcalidrawElements,
  useAppProps,
} from "../App";
import { openConfirmModal } from "../OverwriteConfirm/OverwriteConfirmState";
import Trans from "../Trans";
import DropdownMenuItem from "../dropdownMenu/DropdownMenuItem";
import DropdownMenuItemContentRadio from "../dropdownMenu/DropdownMenuItemContentRadio";
import DropdownMenuItemLink from "../dropdownMenu/DropdownMenuItemLink";
import { GithubIcon, DiscordIcon, XBrandIcon } from "../icons";
import {
  boltIcon,
  DeviceDesktopIcon,
  ExportIcon,
  ExportImageIcon,
  HelpIcon,
  LoadIcon,
  MoonIcon,
  save,
  searchIcon,
  SunIcon,
  TrashIcon,
  usersIcon,
} from "../icons";

import "./DefaultItems.scss";

export const LoadScene = () => {
  const { t } = useI18n();
  const actionManager = useExcalidrawActionManager();
  const elements = useExcalidrawElements();

  if (!actionManager.isActionEnabled(actionLoadScene)) {
    return null;
  }

  const handleSelect = async () => {
    if (
      !elements.length ||
      (await openConfirmModal({
        title: t("overwriteConfirm.modal.loadFromFile.title"),
        actionLabel: t("overwriteConfirm.modal.loadFromFile.button"),
        color: "warning",
        description: (
          <Trans
            i18nKey="overwriteConfirm.modal.loadFromFile.description"
            bold={(text) => <strong>{text}</strong>}
            br={() => <br />}
          />
        ),
      }))
    ) {
      actionManager.executeAction(actionLoadScene);
    }
  };

  return (
    <DropdownMenuItem
      icon={LoadIcon}
      onSelect={handleSelect}
      data-testid="load-button"
      shortcut={getShortcutFromShortcutName("loadScene")}
      aria-label={t("buttons.load")}
    >
      {t("buttons.load")}
    </DropdownMenuItem>
  );
};
LoadScene.displayName = "LoadScene";

export const SaveToActiveFile = () => {
  const { t } = useI18n();
  const actionManager = useExcalidrawActionManager();

  if (!actionManager.isActionEnabled(actionSaveToActiveFile)) {
    return null;
  }

  return (
    <DropdownMenuItem
      shortcut={getShortcutFromShortcutName("saveScene")}
      data-testid="save-button"
      onSelect={() => actionManager.executeAction(actionSaveToActiveFile)}
      icon={save}
      aria-label={`${t("buttons.save")}`}
    >{`${t("buttons.save")}`}</DropdownMenuItem>
  );
};
SaveToActiveFile.displayName = "SaveToActiveFile";

export const SaveAsImage = () => {
  const setAppState = useExcalidrawSetAppState();
  const { t } = useI18n();
  return (
    <DropdownMenuItem
      icon={ExportImageIcon}
      data-testid="image-export-button"
      onSelect={() => setAppState({ openDialog: { name: "imageExport" } })}
      shortcut={getShortcutFromShortcutName("imageExport")}
      aria-label={t("buttons.exportImage")}
    >
      {t("buttons.exportImage")}
    </DropdownMenuItem>
  );
};
SaveAsImage.displayName = "SaveAsImage";

export const CommandPalette = (opts?: { className?: string }) => {
  const setAppState = useExcalidrawSetAppState();
  const { t } = useI18n();

  return (
    <DropdownMenuItem
      icon={boltIcon}
      data-testid="command-palette-button"
      onSelect={() => {
        trackEvent("command_palette", "open", "menu");
        setAppState({ openDialog: { name: "commandPalette" } });
      }}
      shortcut={getShortcutFromShortcutName("commandPalette")}
      aria-label={t("commandPalette.title")}
      className={opts?.className}
    >
      {t("commandPalette.title")}
    </DropdownMenuItem>
  );
};
CommandPalette.displayName = "CommandPalette";

export const SearchMenu = (opts?: { className?: string }) => {
  const { t } = useI18n();
  const actionManager = useExcalidrawActionManager();

  return (
    <DropdownMenuItem
      icon={searchIcon}
      data-testid="search-menu-button"
      onSelect={() => {
        actionManager.executeAction(actionToggleSearchMenu);
      }}
      shortcut={getShortcutFromShortcutName("searchMenu")}
      aria-label={t("search.title")}
      className={opts?.className}
    >
      {t("search.title")}
    </DropdownMenuItem>
  );
};
SearchMenu.displayName = "SearchMenu";

export const Help = () => {
  const { t } = useI18n();

  const actionManager = useExcalidrawActionManager();

  return (
    <DropdownMenuItem
      data-testid="help-menu-item"
      icon={HelpIcon}
      onSelect={() => actionManager.executeAction(actionShortcuts)}
      shortcut="?"
      aria-label={t("helpDialog.title")}
    >
      {t("helpDialog.title")}
    </DropdownMenuItem>
  );
};
Help.displayName = "Help";

export const PageSettings = () => {
  const { t } = useI18n();
  const actionManager = useExcalidrawActionManager();

  return (
    <DropdownMenuItem
      data-testid="page-settings-menu-item"
      icon={(
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="5" y="4" width="10" height="12" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
      )}
      onSelect={() => actionManager.executeAction(actionTogglePageSettings)}
      shortcut="Ctrl+P"
      aria-label={t("pageSettings.title")}
    >
      {t("pageSettings.title")}
    </DropdownMenuItem>
  );
};
PageSettings.displayName = "PageSettings";

export const ClearCanvas = () => {
  const { t } = useI18n();

  const setActiveConfirmDialog = useSetAtom(activeConfirmDialogAtom);
  const actionManager = useExcalidrawActionManager();

  if (!actionManager.isActionEnabled(actionClearCanvas)) {
    return null;
  }

  return (
    <DropdownMenuItem
      icon={TrashIcon}
      onSelect={() => setActiveConfirmDialog("clearCanvas")}
      data-testid="clear-canvas-button"
      aria-label={t("buttons.clearReset")}
    >
      {t("buttons.clearReset")}
    </DropdownMenuItem>
  );
};
ClearCanvas.displayName = "ClearCanvas";

export const ToggleTheme = (
  props:
    | {
        allowSystemTheme: true;
        theme: Theme | "system";
        onSelect: (theme: Theme | "system") => void;
      }
    | {
        allowSystemTheme?: false;
        onSelect?: (theme: Theme) => void;
      },
) => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const actionManager = useExcalidrawActionManager();
  const shortcut = getShortcutFromShortcutName("toggleTheme");

  if (!actionManager.isActionEnabled(actionToggleTheme)) {
    return null;
  }

  if (props?.allowSystemTheme) {
    return (
      <DropdownMenuItemContentRadio
        name="theme"
        value={props.theme}
        onChange={(value: Theme | "system") => props.onSelect(value)}
        choices={[
          {
            value: THEME.LIGHT,
            label: SunIcon,
            ariaLabel: `${t("buttons.lightMode")} - ${shortcut}`,
          },
          {
            value: THEME.DARK,
            label: MoonIcon,
            ariaLabel: `${t("buttons.darkMode")} - ${shortcut}`,
          },
          {
            value: "system",
            label: DeviceDesktopIcon,
            ariaLabel: t("buttons.systemMode"),
          },
        ]}
      >
        {t("labels.theme")}
      </DropdownMenuItemContentRadio>
    );
  }

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        // do not close the menu when changing theme
        event.preventDefault();

        if (props?.onSelect) {
          props.onSelect(
            appState.theme === THEME.DARK ? THEME.LIGHT : THEME.DARK,
          );
        } else {
          return actionManager.executeAction(actionToggleTheme);
        }
      }}
      icon={appState.theme === THEME.DARK ? SunIcon : MoonIcon}
      data-testid="toggle-dark-mode"
      shortcut={shortcut}
      aria-label={
        appState.theme === THEME.DARK
          ? t("buttons.lightMode")
          : t("buttons.darkMode")
      }
    >
      {appState.theme === THEME.DARK
        ? t("buttons.lightMode")
        : t("buttons.darkMode")}
    </DropdownMenuItem>
  );
};
ToggleTheme.displayName = "ToggleTheme";

export const ChangeCanvasBackground = () => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const actionManager = useExcalidrawActionManager();
  const appProps = useAppProps();

  if (
    appState.viewModeEnabled ||
    !appProps.UIOptions.canvasActions.changeViewBackgroundColor
  ) {
    return null;
  }
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div
        data-testid="canvas-background-label"
        style={{ fontSize: ".75rem", marginBottom: ".5rem" }}
      >
        {t("labels.canvasBackground")}
      </div>
      <div style={{ padding: "0 0.625rem" }}>
        {actionManager.renderAction("changeViewBackgroundColor")}
      </div>
    </div>
  );
};
ChangeCanvasBackground.displayName = "ChangeCanvasBackground";

export const Export = () => {
  const { t } = useI18n();
  const setAppState = useExcalidrawSetAppState();
  return (
    <DropdownMenuItem
      icon={ExportIcon}
      onSelect={() => {
        setAppState({ openDialog: { name: "jsonExport" } });
      }}
      data-testid="json-export-button"
      aria-label={t("buttons.export")}
    >
      {t("buttons.export")}
    </DropdownMenuItem>
  );
};
Export.displayName = "Export";

export const Socials = () => {
  const { t } = useI18n();

  return (
    <>
      <DropdownMenuItemLink
        icon={GithubIcon}
        href="https://github.com/excalidraw/excalidraw"
        aria-label="GitHub"
      >
        GitHub
      </DropdownMenuItemLink>
      <DropdownMenuItemLink
        icon={XBrandIcon}
        href="https://x.com/excalidraw"
        aria-label="X"
      >
        {t("labels.followUs")}
      </DropdownMenuItemLink>
      <DropdownMenuItemLink
        icon={DiscordIcon}
        href="https://discord.gg/UexuTaE"
        aria-label="Discord"
      >
        {t("labels.discordChat")}
      </DropdownMenuItemLink>
    </>
  );
};
Socials.displayName = "Socials";

export const LiveCollaborationTrigger = ({
  onSelect,
  isCollaborating,
}: {
  onSelect: () => void;
  isCollaborating: boolean;
}) => {
  const { t } = useI18n();
  return (
    <DropdownMenuItem
      data-testid="collab-button"
      icon={usersIcon}
      className={clsx({
        "active-collab": isCollaborating,
      })}
      onSelect={onSelect}
    >
      {t("labels.liveCollaboration")}
    </DropdownMenuItem>
  );
};

LiveCollaborationTrigger.displayName = "LiveCollaborationTrigger";
