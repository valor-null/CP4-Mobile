import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function initNotifications() {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync()
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT
    })
  }
}

export async function scheduleTaskReminder(title: string, when: Date) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT
    })
  }
  const diffMs = Math.max(1000, when.getTime() - Date.now())
  const seconds = Math.ceil(diffMs / 1000)
  const trigger: Notifications.TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: false
  }
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body: '' },
    trigger
  })
  return id
}

export async function cancelScheduledReminder(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id)
  } catch {}
}

export async function notifyAuthSuccess(kind: 'login' | 'signup') {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT
    })
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: kind === 'signup' ? 'Cadastro realizado' : 'Login realizado',
      body: kind === 'signup' ? 'Sua conta foi criada com sucesso.' : 'Você entrou com sucesso.'
    },
    trigger: null
  })
}
