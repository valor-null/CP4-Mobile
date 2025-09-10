import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Login from '../screens/Login'
import Cadastro from '../screens/Cadastro'

export type RootStackParamList = {
  Login: undefined
  Cadastro: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
    </View>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Cadastro"
        screenOptions={{
          headerStyle: { backgroundColor: '#3E3742' },
          headerTintColor: '#E6E0C5',
          contentStyle: { backgroundColor: '#E6E0C5' }
        }}
      >
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
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Lista de Tarefas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E0C5' },
  title: { fontSize: 28, color: '#3E3742', fontWeight: '700' },
  link: { color: '#CC8383', fontSize: 16, fontWeight: '600' }
})
