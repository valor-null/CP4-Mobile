import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'
import BotaoAlternarTema from '../components/BotaoAlternarTema'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth } from '../firebase/firebaseConfig'
import { updateProfile, sendPasswordResetEmail, signOut, deleteUser } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { RootStackParamList } from '../types/navigation'

export default function Profile() {
  const insets = useSafeAreaInsets()
  const { colors: P } = useTheme()
  const styles = useMemo(() => makeStyles(P, insets.top), [P, insets.top])
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const user = auth.currentUser
  const [nome, setNome] = useState(user?.displayName ?? '')
  const [foto, setFoto] = useState<string | null>(null)
  const email = user?.email ?? ''
  const [savingNome, setSavingNome] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('avatarUri').then(uri => {
      if (uri) setFoto(uri)
      else if (user?.photoURL) setFoto(user.photoURL)
    })
  }, [user?.photoURL])

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria nas configurações do dispositivo.')
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
    await AsyncStorage.setItem('avatarUri', uri)
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à câmera nas configurações do dispositivo.')
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
    await AsyncStorage.setItem('avatarUri', uri)
  }

  function escolherFoto() {
    Alert.alert('Selecionar imagem', 'Escolha uma opção', [
      { text: 'Galeria', onPress: pickFromGallery },
      { text: 'Câmera', onPress: pickFromCamera },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  async function salvarNome() {
    if (!user) return
    setSavingNome(true)
    try {
      await updateProfile(user, { displayName: nome.trim() })
      Alert.alert('Pronto', 'Nome atualizado')
    } finally {
      setSavingNome(false)
    }
  }

  async function redefinirSenha() {
    if (!email) return
    setResetting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert('E-mail enviado', 'Verifique sua caixa de entrada para redefinir a senha.')
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
      Alert.alert('Excluir conta', 'Tem certeza que deseja excluir sua conta?', [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
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
      <BotaoAlternarTema />
      <Text style={styles.title}>Meu perfil</Text>

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
          <Text style={styles.label}>Nome</Text>
          <TextInput value={nome} onChangeText={setNome} style={[styles.input, { backgroundColor: P.bg, color: P.text, borderColor: P.card }]} placeholderTextColor={P.text + '99'} />
          <TouchableOpacity onPress={salvarNome} style={[styles.btn, { backgroundColor: P.primary }]} disabled={savingNome}>
            <Text style={[styles.btnTxt, { color: P.bg }]}>{savingNome ? 'Salvando...' : 'Salvar nome'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <View style={[styles.input, { backgroundColor: P.bg, borderColor: P.card, justifyContent: 'center' }]}>
            <Text style={{ color: P.text }}>{email}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={redefinirSenha} style={[styles.btn, { backgroundColor: P.primary }]} disabled={resetting}>
          <Text style={[styles.btnTxt, { color: P.bg }]}>{resetting ? 'Enviando...' : 'Redefinir senha'}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity onPress={sair} style={[styles.btnOutline, { borderColor: P.primary }]} disabled={signingOut}>
            <Text style={[styles.btnOutlineTxt, { color: P.primary }]}>{signingOut ? 'Saindo...' : 'Sair'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={excluirConta} style={styles.btnDanger} disabled={deleting}>
            <Text style={styles.btnDangerTxt}>{deleting ? 'Excluindo...' : 'Excluir conta'}</Text>
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
