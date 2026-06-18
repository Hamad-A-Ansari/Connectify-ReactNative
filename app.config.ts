import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getAppName = () => {
  if (IS_DEV) return "Connectify (Dev)";
  if (IS_PREVIEW) return "Connectify (Preview)";
  return "Connectify";
};

const getBundleId = () => {
  if (IS_DEV) return "com.hamadansari.connectify.dev";
  if (IS_PREVIEW) return "com.hamadansari.connectify.preview";
  return "com.hamadansari.connectify";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "connectify",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "connectify",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getBundleId(),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: getBundleId(),
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
    "expo-asset",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: process.env.SENTRY_PROJECT ?? "connectify-mobile",
        organization: process.env.SENTRY_ORG ?? "hamad-ansari",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#ffffff",
      },
    ],
  ],
  updates: {
    url: "https://u.expo.dev/1bec40f5-78b1-4b83-9198-9fd8cf6dfc68",
  },
  runtimeVersion: "1.0.0",
  extra: {
    eas: {
      projectId: "1bec40f5-78b1-4b83-9198-9fd8cf6dfc68",
    },
  },
  experiments: {
    typedRoutes: true,
  },
});
