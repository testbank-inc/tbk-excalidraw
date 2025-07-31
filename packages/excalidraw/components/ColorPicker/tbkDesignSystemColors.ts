const BASE_COLOR = {
  white: "#ffffff",
  black: "#000000",
};

const PRIMARY_GRADIENT = {
  primary50: "#e9f1ff",
  primary100: "#bad5ff",
  primary200: "#99c0ff",
  primary300: "#6ba4ff",
  primary400: "#4e92ff",
  primary500: "#2277ff",
  primary600: "#1f6ce8",
  primary700: "#1854b3",
  primary800: "#13418c",
  primary900: "#0e326b",
}; //

const SLATE_GRADIENT = {
  slate10: "#f9fafb",
  slate30: "#f4f6fb",
  slate50: "#f0f3f9",
  slate100: "#e9eff6",
  slate200: "#d7dfe9",
  slate300: "#afbaca",
  slate400: "#8897ae",
  slate500: "#5e718d",
  slate600: "#455468",
  slate700: "#3d4a5c",
  slate800: "#2d3643",
  slate900: "#1c222b",
};

const GRAY_GRADIENT = {
  gray50: "#fafafa",
  gray100: "#f5f5f5",
  gray200: "#eeeeee",
  gray300: "#e0e0e0",
  gray400: "#bdbdbd",
  gray500: "#9e9e9e",
  gray600: "#757575",
  gray700: "#616161",
  gray800: "#424242",
  gray900: "#212121",
};

const ALERT_COLOR = {
  informative: "#4593fc",
  success: "#05c072",
  caution: "#ffcd4b",
  error: "#ef5350",
};

const INFORMATIVE_GRADIENT = {
  informative50: "#ecf4ff",
  informative100: "#c5defe",
  informative200: "#a9cdfe",
  informative300: "#82b7fd",
  informative400: "#6aa9fd",
  informative500: "#4593fc",
  informative600: "#3f86e5",
  informative700: "#3168b3",
  informative800: "#26518b",
  informative900: "#1d3e6a",
};

const SUCCESS_GRADIENT = {
  success50: "#e6f9f1",
  success100: "#b2ebd3",
  success200: "#8ce2be",
  success300: "#58d5a1",
  success400: "#37cd8e",
  success500: "#05c072",
  success600: "#05af68",
  success700: "#048851",
  success800: "#036a3f",
  success900: "#025130",
};

const CAUTION_GRADIENT = {
  caution50: "#fffaed",
  caution100: "#fff0c7",
  caution200: "#ffe8ac",
  caution300: "#ffde86",
  caution400: "#ffd76f",
  caution500: "#ffcd4b",
  caution600: "#e8bb44",
  caution700: "#b59235",
  caution800: "#8c7129",
  caution900: "#6b5620",
};

const ERROR_GRADIENT = {
  error50: "#fdeeee",
  error100: "#facac9",
  error200: "#f8b0af",
  error300: "#f48c8a",
  error400: "#f27573",
  error500: "#ef5350",
  error600: "#d94c49",
  error700: "#aa3b39",
  error800: "#832e2c",
  error900: "#642322",
};

// system v2 에서 모두 정의될 예정
const COBALT_GRADIENT = {
  cobalt25: "#F2F9FF",
};

export const COLOR = {
  primary: PRIMARY_GRADIENT["primary500"],
  ...PRIMARY_GRADIENT,
  ...SLATE_GRADIENT,
  ...GRAY_GRADIENT,
  ...ALERT_COLOR,
  ...COBALT_GRADIENT, //v2
  ...BASE_COLOR,
  ...ERROR_GRADIENT,
  ...INFORMATIVE_GRADIENT,
};

export const ALERT_GRADIENTS = {
  ...ALERT_COLOR,
  ...INFORMATIVE_GRADIENT,
  ...SUCCESS_GRADIENT,
  ...CAUTION_GRADIENT,
  ...ERROR_GRADIENT,
  ...COBALT_GRADIENT, //v2
};
