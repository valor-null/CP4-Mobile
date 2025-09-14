import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'
import BotaoAlternarTema from '../components/BotaoAlternarTema'
import BotaoAlternarIdioma from '../components/BotaoAlternarIdioma'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth, storage, db } from '../firebase/firebaseConfig'
import { updateProfile, sendPasswordResetEmail, signOut, deleteUser } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { RootStackParamList } from '../types/navigation'
import { useTranslation } from 'react-i18next'

export default function Profile() {
  const insets = useSafeAreaInsets()
  const { colors: P } = useTheme()
  const styles = useMemo(() => makeStyles(P, insets.top), [P, insets.top])
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { t } = useTranslation()

  const user = auth.currentUser
  const [nome, setNome] = useState(user?.displayName ?? '')
  const [foto, setFoto] = useState<string | null>(null)
  const email = user?.email ?? ''
  const [savingNome, setSavingNome] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const key = user?.uid ? `avatarUri:${user.uid}` : null
      const uri = key ? await AsyncStorage.getItem(key) : null
      if (uri) setFoto(uri)
      else if (user?.photoURL) setFoto(user.photoURL)
      else setFoto(null)
    }
    load()
  }, [user?.uid, user?.photoURL])

  async function uploadAndSetAvatar(localUri: string) {
    const u = auth.currentUser
    if (!u) return
    const resp = await fetch(localUri)
    const blob = await resp.blob()
    const fileRef = ref(storage, `users/${u.uid}/profile.jpg`)
    await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' })
    const url = await getDownloadURL(fileRef)
    await updateProfile(u, { photoURL: url })
    await setDoc(doc(db, 'users', u.uid), { photoURL: url, updatedAt: Date.now() }, { merge: true })
    setFoto(url)
    await AsyncStorage.setItem(`avatarUri:${u.uid}`, url)
    await u.reload()
    return url
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(t('permissaoNecessaria'), t('permitaAcessoGaleria'))
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    })
    if (res.canceled) return
    const uri = res.assets?.[0]?.uri
    if (!uri) return
    setFoto(uri)
    if (user?.uid) await AsyncStorage.setItem(`avatarUri:${user.uid}`, uri)
    await uploadAndSetAvatar(uri)
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(t('permissaoNecessaria'), t('permitaAcessoCamera'))
      return
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    })
    if (res.canceled) return
    const uri = res.assets?.[0]?.uri
    if (!uri) return
    setFoto(uri)
    if (user?.uid) await AsyncStorage.setItem(`avatarUri:${user.uid}`, uri)
    await uploadAndSetAvatar(uri)
  }

  function escolherFoto() {
    Alert.alert(t('selecionarImagem'), t('escolhaUmaOpcao'), [
      { text: t('galeria'), onPress: pickFromGallery },
      { text: t('camera'), onPress: pickFromCamera },
      { text: t('cancelar'), style: 'cancel' },
    ])
  }

  async function salvarNome() {
    if (!user) return
    setSavingNome(true)
    try {
      await updateProfile(user, { displayName: nome.trim() })
      Alert.alert(t('pronto'), t('nomeAtualizado'))
    } finally {
      setSavingNome(false)
    }
  }

  async function redefinirSenha() {
    if (!email) return
    setResetting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert(t('emailEnviado'), t('verifiqueCaixaEntrada'))
    } finally {
      setResetting(false)
    }
  }

  async function sair() {
    setSigningOut(true)
    try {
      await signOut(auth)
    } finally {
      setSigningOut(false)
    }
  }

  async function excluirConta() {
    const ok = await new Promise<boolean>(resolve => {
      Alert.alert(t('excluirConta'), t('confirmarExclusaoConta'), [
        { text: t('cancelar'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('excluirConta'), style: 'destructive', onPress: () => resolve(true) },
      ])
    })
    if (!ok) return
    if (!auth.currentUser) return
    setDeleting(true)
    try {
      await deleteUser(auth.currentUser)
    } finally {
      setDeleting(false)
    }
  }

  function onTabChange(k: 'tasks' | 'quotes' | 'profile') {
    if (k === 'tasks') navigation.navigate('Home')
    if (k === 'quotes') navigation.navigate('Quotes')
  }

  return (
    <View style={styles.safe}>
      <BotaoAlternarIdioma />
      <BotaoAlternarTema />
      <Text style={styles.title}>{t('meuPerfil')}</Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={escolherFoto} activeOpacity={0.9} style={styles.avatarBtn}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person-circle" size={132} color={P.primary} />
          )}
          <View style={[styles.camBadge, { backgroundColor: P.primary }]}>
            <Ionicons name="camera" size={16} color={P.bg} />
          </View>
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={styles.label}>{t('nome')}</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            style={[styles.input, { backgroundColor: P.bg, color: P.text, borderColor: P.card }]}
            placeholderTextColor={P.text + '99'}
          />
          <TouchableOpacity onPress={salvarNome} style={[styles.btn, { backgroundColor: P.primary }]} disabled={savingNome}>
            <Text style={[styles.btnTxt, { color: P.bg }]}>{savingNome ? t('salvando') : t('salvarNome')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('emailLabel')}</Text>
          <View style={[styles.input, { backgroundColor: P.bg, borderColor: P.card, justifyContent: 'center' }]}>
            <Text style={{ color: P.text }}>{email}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={redefinirSenha} style={[styles.btn, { backgroundColor: P.primary }]} disabled={resetting}>
          <Text style={[styles.btnTxt, { color: P.bg }]}>{resetting ? t('enviando') : t('redefinirSenha')}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity onPress={sair} style={[styles.btnOutline, { borderColor: P.primary }]} disabled={signingOut}>
            <Text style={[styles.btnOutlineTxt, { color: P.primary }]}>{signingOut ? t('saindo') : t('sair')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={excluirConta} style={styles.btnDanger} disabled={deleting}>
            <Text style={styles.btnDangerTxt}>{deleting ? t('excluindo') : t('excluirConta')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navbarFixed}>
        <Navbar value="profile" onChange={onTabChange} />
      </View>
    </View>
  )
}

function makeStyles(P: { bg: string; card: string; text: string; primary: string }, topInset: number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg, paddingHorizontal: 16, paddingTop: topInset + 56, paddingBottom: 96 },
    title: { color: P.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
    card: { backgroundColor: P.card, borderRadius: 14, padding: 16, gap: 12 },
    avatarBtn: { alignSelf: 'center' },
    avatarImg: { width: 132, height: 132, borderRadius: 999 },
    camBadge: { position: 'absolute', right: 2, bottom: 2, width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    field: { gap: 6 },
    label: { color: P.text, fontWeight: '700' },
    input: { height: 44, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1 },
    btn: { height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnTxt: { fontWeight: '700' },
    row: { flexDirection: 'row', gap: 8 },
    btnOutline: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: P.bg },
    btnOutlineTxt: { fontWeight: '700' },
    btnDanger: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B85C5C' },
    btnDangerTxt: { color: P.bg, fontWeight: '700' },
    navbarFixed: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  })
}
