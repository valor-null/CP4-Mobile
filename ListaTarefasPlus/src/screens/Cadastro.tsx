import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { useTheme } from '../context/ThemeContext'
import BotaoAlternarTema from '../components/BotaoAlternarTema'
import BotaoAlternarIdioma from '../components/BotaoAlternarIdioma'
import { useTranslation } from 'react-i18next'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useNavigation } from '@react-navigation/native'
import { notifyAuthSuccess } from '../notifications/notify'

export default function Cadastro() {
  const { colors: P } = useTheme()
  const { t } = useTranslation()
  const nav = useNavigation<any>()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const s = makeStyles(P)

  async function registrar() {
    setErr(null)
    if (!nome.trim() || !email.trim() || !senha) {
      setErr(t('preenchaNomeEmailSenha'))
      return
    }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha)
      await updateProfile(cred.user, { displayName: nome.trim() })
      await notifyAuthSuccess('signup')
      nav.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch {
      setErr(t('erroCadastroGenerico'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.safe}>
      <BotaoAlternarIdioma />
      <BotaoAlternarTema />

      <Text style={s.title}>{t('criarConta')}</Text>

      <View style={s.inputWrap}>
        <Feather name="user" size={18} color={P.primary} />
        <TextInput
          placeholder={t('nome')}
          value={nome}
          onChangeText={setNome}
          style={s.input}
          placeholderTextColor={P.text + '99'}
        />
      </View>

      <View style={s.inputWrap}>
        <Feather name="mail" size={18} color={P.primary} />
        <TextInput
          placeholder={t('email')}
          value={email}
          onChangeText={setEmail}
          style={s.input}
          placeholderTextColor={P.text + '99'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={s.inputWrap}>
        <MaterialCommunityIcons name="lock-outline" size={18} color={P.primary} />
        <TextInput
          placeholder={t('senha')}
          value={senha}
          onChangeText={setSenha}
          style={s.input}
          placeholderTextColor={P.text + '99'}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(v => !v)} style={s.iconBtn}>
          <Feather name={show ? 'eye' : 'eye-off'} size={18} color={P.primary} />
        </TouchableOpacity>
      </View>

      {!!err && <Text style={s.err}>{err}</Text>}

      <TouchableOpacity onPress={registrar} style={[s.button, loading && { opacity: 0.7 }]}>
        <Feather name="user-check" size={18} color={P.bg} />
        <Text style={s.buttonTxt}>{loading ? t('cadastrando') : t('cadastrar')}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 10 }}>
        <GoogleSignInButton />
      </View>

      <TouchableOpacity onPress={() => nav.navigate('Login')} style={s.linkRow}>
        <Feather name="log-in" size={16} color={P.primary} />
        <Text style={s.link}>Já possui uma conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  )
}

function makeStyles(P: { bg: string; card: string; text: string; primary: string }) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg, paddingHorizontal: 16, paddingBottom: 16, justifyContent: 'center' },
    title: { color: P.text, fontSize: 22, fontWeight: '800', marginBottom: 12, marginTop: 48 },
    inputWrap: { height: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: P.bg, borderRadius: 10, borderWidth: 1, borderColor: P.card, paddingHorizontal: 12, gap: 8, marginBottom: 10 },
    input: { flex: 1, color: P.text },
    iconBtn: { padding: 4 },
    button: { height: 48, borderRadius: 10, backgroundColor: P.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 4 },
    buttonTxt: { color: P.bg, fontWeight: '700' },
    err: { color: '#CC8383', textAlign: 'center', marginTop: -2, marginBottom: 6 },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 12 },
    link: { color: P.primary, fontWeight: '700' }
  })
}
