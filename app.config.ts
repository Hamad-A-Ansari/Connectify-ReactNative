import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getAppName = () => {
  if (IS_DEV) return "ReactNative-Project (Dev)";
  if (IS_PREVIEW) return "ReactNative-Project (Preview)";
  return "ReactNative-Project";
};

const getBundleId = () => {
  if (IS_DEV) return "com.anonymous.ReactNativeProject.dev";
  if (IS_PREVIEW) return "com.anonymous.ReactNativeProject.preview";
  return "com.anonymous.ReactNativeProject";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "ReactNative-Project",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
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
  ],
  updates: {
    url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID}`,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
  experiments: {
    typedRoutes: true,
  },
});
