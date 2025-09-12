import { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { onAuthStateChanged, User } from 'firebase/auth'
import Login from '../screens/Login'
import Cadastro from '../screens/Cadastro'
import Home from '../screens/Home'
import Quotes from '../screens/Quotes'
import Profile from '../screens/Profile'
import { auth } from '../firebase/firebaseConfig'
import { useTheme } from '../context/ThemeContext'

type Routes = {
  Login: undefined
  Cadastro: undefined
  Home: undefined
  Quotes: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<Routes>()

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { colors } = useTheme()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const isAuth = !!user

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isAuth ? 'Home' : 'Login'}>
      {!isAuth && (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
        </>
      )}
      {isAuth && (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Quotes" component={Quotes} />
          <Stack.Screen name="Profile" component={Profile} />
        </>
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
