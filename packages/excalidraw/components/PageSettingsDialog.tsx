import React from "react";
import { Dialog } from "./Dialog";
import { PageSettings } from "./PageSettings";
import { t } from "../i18n";

interface PageSettingsDialogProps {
  appState: any;
  onUpdateAppState: (updates: any) => void;
  onClose: () => void;
}

export const PageSettingsDialog: React.FC<PageSettingsDialogProps> = ({
  appState,
  onUpdateAppState,
  onClose,
}) => {
  return (
    <Dialog
      onCloseRequest={onClose}
      title={t("pageSettings.title")}
      className="page-settings-dialog"
    >
      <PageSettings
        appState={appState}
        onUpdateAppState={onUpdateAppState}
        onClose={onClose}
      />
    </Dialog>
  );
};