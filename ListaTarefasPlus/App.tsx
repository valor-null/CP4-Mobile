import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'

function Root() {
  const { mode } = useTheme()
  return (
    <NavigationContainer theme={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </ThemeProvider>
  )
}
