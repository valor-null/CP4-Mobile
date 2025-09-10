import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/app'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = { Login: undefined; Cadastro: undefined; Home: undefined }
type Nav = NativeStackNavigationProp<RootStackParamList>

export default function Cadastro() {
  const navigation = useNavigation<Nav>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    setError('')
    if (!name.trim()) { setError('Informe seu nome'); return }
    if (!email.trim()) { setError('Informe seu e-mail'); return }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('As senhas não conferem'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (cred.user) await updateProfile(cred.user, { displayName: name.trim() })
      navigation.navigate('Home')
    } catch {
      setError('Não foi possível criar a conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#825E65"
            value={name}
            onChangeText={setName}
          />
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
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="#825E65"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Cadastrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.ghostButton}>
            <Text style={styles.ghostText}>Já tenho conta</Text>
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
