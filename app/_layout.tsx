import InitialLayout from "@/components/InitialLayout";
import { checkForUpdates } from "@/lib/updates";
import ClerkAndConvexProvider from "@/provider/ClerkAndConvexProvider";
import ToastProvider from "@/provider/ToastProvider";
import * as Sentry from "@sentry/react-native";
import * as Application from "expo-application";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen } from "expo-router";
import { useCallback, useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__ && Platform.OS !== "web",
  tracesSampleRate: 0.2,
  release: Application.nativeApplicationVersion ?? "1.0.0",
  dist: Application.nativeBuildVersion ?? "1",
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  //update navigation bar on android devices
  useEffect(() => {
    if(Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");

    }
  }, [])

  // Check for OTA updates on app startup
  useEffect(() => {
    checkForUpdates();
  }, []);


  return (
    <ClerkAndConvexProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000000"}} onLayout={onLayoutRootView}>
              <InitialLayout/>
            </SafeAreaView>
          </ToastProvider>
        </SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" /> 
      </ClerkAndConvexProvider>
      
    
  );
}

export default Sentry.wrap(RootLayout);
