import React, { useState } from "react";
import { KEYS } from "@excalidraw/common";
import { trackEvent } from "../analytics";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { CheckboxItem } from "./CheckboxItem";
import { t } from "../i18n";

import "./PageSettings.scss";

type PageSettingsProps = {
  appState: any;
  onUpdateAppState: (updates: any) => void;
  onClose: () => void;
};

const PAGE_PRESETS = [
  { name: "A4 Portrait", width: 794, height: 1123 },
  { name: "A4 Landscape", width: 1123, height: 794 },
  { name: "Letter Portrait", width: 816, height: 1056 },
  { name: "Letter Landscape", width: 1056, height: 816 },
  { name: "Square", width: 800, height: 800 },
  { name: "Custom", width: 0, height: 0 },
];

export const PageSettings = ({
  appState,
  onUpdateAppState,
  onClose,
}: PageSettingsProps) => {
  const [tempSettings, setTempSettings] = useState({
    enabled: appState.canvasPageSettings.enabled,
    width: appState.canvasPageSettings.width,
    height: appState.canvasPageSettings.height,
    backgroundColor: appState.canvasPageSettings.backgroundColor,
    showBorder: appState.canvasPageSettings.showBorder,
  });

  const handlePresetChange = (preset: typeof PAGE_PRESETS[0]) => {
    if (preset.name === "Custom") {
      return;
    }
    setTempSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height,
    }));
  };

  const handleSave = () => {
    onUpdateAppState({
      canvasPageSettings: tempSettings,
    });
    
    trackEvent("page_settings", "save", JSON.stringify({
      enabled: tempSettings.enabled,
      width: tempSettings.width,
      height: tempSettings.height,
    }));
    
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="page-settings">
      <div className="page-settings__content">
      
      <div className="page-settings__section">
        <CheckboxItem
          checked={tempSettings.enabled}
          onChange={(checked) => setTempSettings(prev => ({ ...prev, enabled: checked }))}
        >
          {t("pageSettings.enableBoundedCanvas")}
        </CheckboxItem>
      </div>

      {tempSettings.enabled && (
        <>
          <div className="page-settings__section">
            <label className="page-settings__label">
              {t("pageSettings.presets")}
            </label>
            <div className="page-settings__presets">
              {PAGE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className="page-settings__preset-btn"
                  onClick={() => handlePresetChange(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="page-settings__section">
            <div className="page-settings__size-inputs">
              <div className="page-settings__input-group">
                <label className="page-settings__label">
                  {t("pageSettings.width")}
                </label>
                <TextField
                  value={tempSettings.width.toString()}
                  onChange={(value) => {
                    const width = parseInt(value) || 0;
                    setTempSettings(prev => ({ ...prev, width }));
                  }}
                  placeholder="794"
                />
              </div>
              <div className="page-settings__input-group">
                <label className="page-settings__label">
                  {t("pageSettings.height")}
                </label>
                <TextField
                  value={tempSettings.height.toString()}
                  onChange={(value) => {
                    const height = parseInt(value) || 0;
                    setTempSettings(prev => ({ ...prev, height }));
                  }}
                  placeholder="1123"
                />
              </div>
            </div>
          </div>

          <div className="page-settings__section">
            <label className="page-settings__label">
              {t("pageSettings.backgroundColor")}
            </label>
            <input
              type="color"
              value={tempSettings.backgroundColor}
              onChange={(e) => setTempSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="page-settings__color-input"
            />
          </div>

          <div className="page-settings__section">
            <CheckboxItem
              checked={tempSettings.showBorder}
              onChange={(checked) => setTempSettings(prev => ({ ...prev, showBorder: checked }))}
            >
              {t("pageSettings.showBorder")}
            </CheckboxItem>
          </div>
        </>
      )}

      <div className="page-settings__buttons">
        <Button
          onSelect={handleCancel}
        >
          {t("buttons.cancel")}
        </Button>
        <Button
          onSelect={handleSave}
        >
          {t("buttons.save")}
        </Button>
      </div>
      </div>
    </div>
  );
};