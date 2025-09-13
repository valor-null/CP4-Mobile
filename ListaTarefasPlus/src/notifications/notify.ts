import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function initNotifications() {
  if (!Device.isDevice) return;
  const perm = await Notifications.getPermissionsAsync();
  if (perm.status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      bypassDnd: false,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      enableVibrate: true,
      enableLights: true,
      showBadge: false
    });
  }
}

export async function scheduleTaskReminder(title: string, when: Date) {
  const trigger: any = { date: when };
  const id = await Notifications.scheduleNotificationAsync({
    content: { title: "Lembrete de tarefa", body: title },
    trigger
  });
  return id;
}

export async function cancelScheduledReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function sendWelcomeNotification() {
  const trigger: any = { seconds: 1 };
  await Notifications.scheduleNotificationAsync({
    content: { title: "Cadastro realizado", body: "Seja bem-vindo(a)!" },
    trigger
  });
}

export async function sendLoginNotification() {
  const trigger: any = { seconds: 1 };
  await Notifications.scheduleNotificationAsync({
    content: { title: "Login realizado", body: "Bom te ver por aqui!" },
    trigger
  });
}
