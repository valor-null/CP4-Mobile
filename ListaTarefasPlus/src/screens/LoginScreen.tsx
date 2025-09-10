import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/app'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      Alert.alert('Sucesso', 'Login realizado com sucesso')
    } catch (e: any) {
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
          <Text style={styles.subtitle}>Entre para continuar</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#8A8A8E"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#8A8A8E"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111827' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#D1D5DB', marginTop: 4 },
  card: { backgroundColor: '#1F2937', padding: 20, borderRadius: 16, gap: 12 },
  input: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#374151' },
  button: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  error: { color: '#F87171', textAlign: 'center', marginTop: 4 }
})
