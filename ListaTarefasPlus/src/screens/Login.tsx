import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { useTheme } from '../context/ThemeContext'
import BotaoAlternarTema from '../components/BotaoAlternarTema'
import BotaoAlternarIdioma from '../components/BotaoAlternarIdioma'
import { useTranslation } from 'react-i18next'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { notifyAuthSuccess } from '../notifications/notify'

export default function Login() {
  const nav = useNavigation<any>()
  const { colors: P } = useTheme()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const s = makeStyles(P)

  async function entrar() {
    setErr(null)
    if (!email.trim() || !senha) return
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha)
      await notifyAuthSuccess('login')
      nav.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch {
      setErr(t('erroLoginGenerico'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.safe}>
      <BotaoAlternarTema />
      <BotaoAlternarIdioma />

      <Text style={s.title}>{t('bemVindo')}</Text>

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

      <TouchableOpacity onPress={entrar} style={[s.button, loading && { opacity: 0.7 }]}>
        <Feather name="log-in" size={18} color={P.bg} />
        <Text style={s.buttonTxt}>{loading ? t('entrando') : t('entrar')}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 10 }}>
        <GoogleSignInButton />
      </View>

      <TouchableOpacity onPress={() => nav.navigate('Cadastro')} style={s.linkRow}>
        <Feather name="user-plus" size={16} color={P.primary} />
        <Text style={s.link}>{t('criarConta')}</Text>
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
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 12 },
    link: { color: P.primary, fontWeight: '700' },
    err: { color: '#CC8383', textAlign: 'center', marginTop: -2, marginBottom: 6 }
  })
}
