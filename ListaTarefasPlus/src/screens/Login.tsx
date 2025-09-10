import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/app'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = { Login: undefined; Cadastro: undefined; Home: undefined }
type Nav = NativeStackNavigationProp<RootStackParamList>

export default function Login() {
  const navigation = useNavigation<Nav>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigation.navigate('Home')
    } catch {
      setError('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista Tarefas Plus</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#825E65"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#825E65"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} disabled={loading} onPress={handleLogin}>
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={styles.ghostButton}>
            <Text style={styles.ghostText}>Ir para Cadastro</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E6E0C5' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#3E3742' },
  subtitle: { fontSize: 14, color: '#825E65', marginTop: 4 },
  card: { backgroundColor: '#EBC4A9', padding: 20, borderRadius: 16, gap: 12 },
  input: { backgroundColor: '#E6E0C5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#3E3742', borderWidth: 1, borderColor: '#825E65' },
  button: { backgroundColor: '#825E65', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#E6E0C5', fontSize: 16, fontWeight: '700' },
  ghostButton: { paddingVertical: 10, alignItems: 'center' },
  ghostText: { color: '#CC8383', fontSize: 14, fontWeight: '600' },
  error: { color: '#CC3838', textAlign: 'center', marginTop: 2 }
})
