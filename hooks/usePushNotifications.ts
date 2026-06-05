import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { isSignedIn } = useAuth();
  const registerPushToken = useMutation(api.pushTokens.registerPushToken);
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!isSignedIn || hasRegistered.current) return;

    async function registerForPushNotifications() {
      try {
        // Check current permissions
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permissions if not already granted
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          return;
        }

        // Get Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
        });
        const token = tokenData.data;

        const platform = Platform.OS === "ios" ? "ios" : "android";

        // Register token with backend
        await registerPushToken({ token, platform });
        hasRegistered.current = true;
      } catch (error) {
        // Silently fail — push notifications are non-critical
        console.warn("Failed to register push notifications:", error);
      }
    }

    registerForPushNotifications();
  }, [isSignedIn, registerPushToken]);
}
