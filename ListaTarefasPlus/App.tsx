import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import "./src/services/i18n";
import { LanguageProvider } from "./src/context/LanguageContext";
import { initNotifications } from "./src/notifications/notify";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function Root() {
  const { mode } = useTheme();
  return (
    <NavigationContainer theme={mode === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    initNotifications();
  }, []);
  return (
    <LanguageProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <Root />
        </SafeAreaProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
