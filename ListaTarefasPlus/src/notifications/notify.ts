import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function initNotifications() {
  if (!Device.isDevice) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("general", {
      name: "Geral",
      importance: Notifications.AndroidImportance.DEFAULT,
      bypassDnd: false,
      sound: null,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    });
  }
}

export async function sendWelcomeNotification() {
  await Notifications.scheduleNotificationAsync({
    content: { title: "Cadastro realizado com sucesso", body: "Seja bem-vindo(a) ao app!" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }
  });
}

export async function sendLoginNotification() {
  await Notifications.scheduleNotificationAsync({
    content: { title: "Login realizado", body: "Bom te ver por aqui!" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }
  });
}
