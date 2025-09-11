import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'

const P = { bg: '#E6E0C5', card: '#EBC4A9', text: '#3E3742', primary: '#825E65' }

export default function Cadastro() {
  const nav = useNavigation<any>()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function criar() {
    setErr(null)
    if (!nome.trim()) { setErr('Informe seu nome'); return }
    if (!email.trim() || !senha) { setErr('Informe e-mail e senha'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha)
      await updateProfile(cred.user, { displayName: nome.trim() })
      await cred.user.reload()
    } catch (e: any) {
      setErr('Não foi possível criar a conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.safe}>
      <Text style={styles.title}>Criar conta</Text>

      <View style={styles.inputWrap}>
        <Feather name="user" size={18} color={P.primary} />
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          placeholderTextColor={P.text + '99'}
        />
      </View>

      <View style={styles.inputWrap}>
        <Feather name="mail" size={18} color={P.primary} />
        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={P.text + '99'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputWrap}>
        <MaterialCommunityIcons name="lock-outline" size={18} color={P.primary} />
        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
          placeholderTextColor={P.text + '99'}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.iconBtn}>
          <Feather name={show ? 'eye' : 'eye-off'} size={18} color={P.primary} />
        </TouchableOpacity>
      </View>

      {!!err && <Text style={styles.err}>{err}</Text>}

      <TouchableOpacity onPress={criar} style={[styles.button, loading && { opacity: 0.7 }]}>
        <Feather name="user-check" size={18} color={P.bg} />
        <Text style={styles.buttonTxt}>{loading ? 'Criando...' : 'Cadastrar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => (nav.canGoBack() ? nav.goBack() : nav.navigate('Login'))} style={styles.linkRow}>
        <Feather name="log-in" size={16} color={P.primary} />
        <Text style={styles.link}>Já tenho conta</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg, padding: 16, justifyContent: 'center', gap: 12 },
  title: { color: P.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  inputWrap: { height: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: P.bg, borderRadius: 10, borderWidth: 1, borderColor: P.card, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, color: P.text },
  iconBtn: { padding: 4 },
  button: { height: 48, borderRadius: 10, backgroundColor: P.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 4 },
  buttonTxt: { color: P.bg, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 8 },
  link: { color: P.primary, fontWeight: '700' },
  err: { color: '#CC8383', textAlign: 'center', marginTop: -4 }
})
