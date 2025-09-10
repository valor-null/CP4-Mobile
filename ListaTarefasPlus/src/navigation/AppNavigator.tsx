import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import Login from '../screens/Login'
import Cadastro from '../screens/Cadastro'
import Home from '../screens/Home'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'

export type RootStackParamList = {
  Login: undefined
  Cadastro: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const isAuth = !!user

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuth ? 'auth' : 'guest'}
        initialRouteName={isAuth ? 'Home' : 'Cadastro'}
        screenOptions={{
          headerStyle: { backgroundColor: '#3E3742' },
          headerTintColor: '#E6E0C5',
          contentStyle: { backgroundColor: '#E6E0C5' }
        }}
      >
        {!isAuth && (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={({ navigation }) => ({
                title: 'Login',
                headerRight: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                    <Text style={styles.link}>Cadastro</Text>
                  </TouchableOpacity>
                )
              })}
            />
            <Stack.Screen
              name="Cadastro"
              component={Cadastro}
              options={({ navigation }) => ({
                title: 'Cadastro',
                headerRight: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Login</Text>
                  </TouchableOpacity>
                )
              })}
            />
          </>
        )}

        {isAuth && (
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              title: 'Lista de Tarefas',
              headerRight: () => (
                <TouchableOpacity onPress={() => signOut(auth)}>
                  <Text style={styles.link}>Sair</Text>
                </TouchableOpacity>
              )
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  link: { color: '#CC8383', fontSize: 16, fontWeight: '600' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E0C5' }
})
