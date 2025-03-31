import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/provider/ClerkAndConvexProvider";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen } from "expo-router";
import { useCallback, useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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


  return (
    <ClerkAndConvexProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF"}} onLayout={onLayoutRootView}>
            <InitialLayout/>
          </SafeAreaView>
        </SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> 
      </ClerkAndConvexProvider>
      
    
  );
}
