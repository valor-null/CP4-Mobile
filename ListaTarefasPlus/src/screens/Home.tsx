import { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import FiltrosDeCategoria from '../components/FiltrosDeCategoria'
import CampoDeData from '../components/CampoDeData'
import { auth, db } from '../firebase/firebaseConfig'
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import BotaoAlternarTema from '../components/BotaoAlternarTema'
import BotaoAlternarIdioma from '../components/BotaoAlternarIdioma'
import { Task } from '../types/task'
import Navbar from '../components/Navbar'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import { useTranslation } from 'react-i18next'
import TaskModal from '../components/TaskModal'
import { initNotifications, scheduleTaskReminder, cancelScheduledReminder } from '../notifications/notify'
import { onAuthStateChanged } from 'firebase/auth'

export default function Home() {
  const { t } = useTranslation()
  const { colors: P } = useTheme()
  const insets = useSafeAreaInsets()
  const styles = useMemo(() => makeStyles(P, insets.top), [P, insets.top])
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    initNotifications()
  }, [])

  const [authReady, setAuthReady] = useState(false)
  const [uid, setUid] = useState<string | null>(null)
  const [nomeBase, setNomeBase] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUid(u?.uid ?? null)
      setNomeBase(u?.displayName || u?.email?.split('@')[0] || '')
      setAuthReady(true)
    })
    return unsub
  }, [])

  const [sel, setSel] = useState('all')
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [formCat, setFormCat] = useState('trabalho')
  const [venc, setVenc] = useState<Date | null>(null)
  const [itens, setItens] = useState<Task[]>([])

  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [taskSelected, setTaskSelected] = useState<Task | null>(null)

  const CATS = useMemo(() => ([
    { chave: 'all', rotulo: t('categoria.all') },
    { chave: 'trabalho', rotulo: t('categoria.trabalho') },
    { chave: 'pessoal', rotulo: t('categoria.pessoal') },
    { chave: 'estudos', rotulo: t('categoria.estudos') },
    { chave: 'desejos', rotulo: t('categoria.desejos') }
  ]), [t])

  useEffect(() => {
    if (!uid) { setItens([]); return }
    const ref = collection(db, 'users', uid, 'tasks')
    const q = query(ref)
    const unsub = onSnapshot(q, snap => {
      const rows: Task[] = []
      snap.forEach(d => {
        const data = d.data() as any
        rows.push({
          id: d.id,
          title: data.title,
          description: data.description,
          category: data.category,
          completed: !!data.completed,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate ?? null,
          deleted: data.deleted ?? false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ?? null,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ?? null
        })
      })
      const alive = rows.filter(r => r.deleted !== true)
      alive.sort((a, b) => {
        const ca = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
        const cb = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
        return cb - ca
      })
      setItens(alive)
    })
    return unsub
  }, [uid])

  const filtrados = useMemo(() => {
    if (sel === 'all') return itens
    return itens.filter(tk => tk.category === sel)
  }, [itens, sel])

  async function addTask() {
    if (!uid) return
    if (!titulo.trim()) return
    const ref = collection(db, 'users', uid, 'tasks')
    const payload: any = {
      title: titulo.trim(),
      description: desc.trim(),
      category: formCat,
      completed: false,
      deleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    if (venc) payload.dueDate = Timestamp.fromDate(venc)
    const created = await addDoc(ref, payload)
    if (venc) {
      const nid = await scheduleTaskReminder(titulo.trim(), venc)
      await updateDoc(created, { notifId: nid })
    }
    setTitulo('')
    setDesc('')
    setVenc(null)
    setFormCat('trabalho')
  }

  async function toggleDone(id: string, done: boolean) {
    if (!uid) return
    const ref = doc(db, 'users', uid, 'tasks', id)
    await updateDoc(ref, { completed: !done, updatedAt: serverTimestamp() })
    if (!done) {
      const snap = await getDoc(ref)
      const nid = (snap.data() as any)?.notifId
      if (nid) {
        await cancelScheduledReminder(nid)
        await updateDoc(ref, { notifId: null })
      }
    }
  }

  async function remover(id: string) {
    if (!uid) return
    const ref = doc(db, 'users', uid, 'tasks', id)
    const snap = await getDoc(ref)
    const nid = (snap.data() as any)?.notifId
    if (nid) await cancelScheduledReminder(nid)
    await deleteDoc(ref)
  }

  function fmt(d?: Date | null) {
    if (!d) return ''
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`
  }

  function openTaskModal(task: Task) {
    setTaskSelected(task)
    setTaskModalVisible(true)
  }

  function closeTaskModal() {
    setTaskModalVisible(false)
    setTaskSelected(null)
  }

  async function onSaveTaskModal(taskId: string, updates: Partial<Task>) {
    if (!uid) return
    const ref = doc(db, 'users', uid, 'tasks', taskId)
    const snap = await getDoc(ref)
    const prev = snap.data() as any
    const patch: any = {
      title: updates.title,
      description: updates.description ?? '',
      completed: typeof updates.completed === 'boolean' ? updates.completed : prev?.completed,
      updatedAt: serverTimestamp()
    }
    if (updates.category !== undefined) {
      patch.category = updates.category
    }
    if (updates.dueDate !== undefined) {
      patch.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null
      if (prev?.notifId) {
        await cancelScheduledReminder(prev.notifId)
        patch.notifId = null
      }
      if (updates.dueDate) {
        const tTitle = updates.title !== undefined ? String(updates.title) : String(prev?.title || '')
        const nid = await scheduleTaskReminder(tTitle, updates.dueDate)
        patch.notifId = nid
      }
    }
    await updateDoc(ref, patch)
    closeTaskModal()
  }

  async function onDeleteTaskModal(taskId: string) {
    await remover(taskId)
    closeTaskModal()
  }

  function Item({ item }: { item: Task }) {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => openTaskModal(item)}>
        <TouchableOpacity onPress={() => toggleDone(item.id, item.completed)} style={[styles.check, item.completed && styles.checkOn]}>
          <MaterialIcons name={item.completed ? 'check' : 'radio-button-unchecked'} size={18} color={item.completed ? P.bg : P.primary} />
        </TouchableOpacity>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, item.completed && styles.cardTitleDone]} numberOfLines={1}>{item.title}</Text>
          {!!item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
          {!!item.dueDate && (
            <Text style={styles.cardDue}>
              {t('vence', { quando: fmt(item.dueDate || null) })}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => remover(item.id)} style={styles.del}>
          <MaterialIcons name="close" size={18} color={P.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  function onTabChange(k: 'tasks' | 'quotes' | 'profile') {
    if (k === 'quotes') navigation.navigate('Quotes')
    if (k === 'profile') navigation.navigate('Profile')
  }

  if (!authReady) return null

  return (
    <View style={styles.safe}>
      <BotaoAlternarIdioma />
      <BotaoAlternarTema />

      <View style={styles.header}>
        <Text style={styles.ola}>{t('ola', { nome: nomeBase })}</Text>
        <Text style={styles.sub}>{t('organizeSuasTarefas')}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder={t('titulo')}
          value={titulo}
          onChangeText={setTitulo}
          style={styles.input}
          placeholderTextColor={P.text + '99'}
        />
        <TextInput
          placeholder={t('descricao')}
          value={desc}
          onChangeText={setDesc}
          style={styles.input}
          placeholderTextColor={P.text + '99'}
        />
        <CampoDeData
          valor={venc}
          onChange={setVenc}
          estiloBotao={styles.dateBtn}
          estiloTexto={styles.dateTxt}
          icone="event"
          rotulo={t('data')}
        />
        <FiltrosDeCategoria
          dados={CATS.filter(c => c.chave !== 'all')}
          valor={formCat}
          onChange={setFormCat}
          style={styles.formChips}
        />
        <TouchableOpacity onPress={addTask} style={styles.button}>
          <Text style={styles.buttonTxt}>{t('adicionar')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{t('minhasTarefas')}</Text>
        <Text style={styles.listCount}>{filtrados.length}</Text>
      </View>

      <FiltrosDeCategoria
        dados={CATS}
        valor={sel}
        onChange={c => setSel(c)}
        style={styles.listChips}
      />

      <FlatList
        data={filtrados}
        keyExtractor={i => i.id}
        renderItem={Item}
        ListEmptyComponent={<Text style={styles.empty}>{t('semTarefasPorAqui')}</Text>}
        contentContainerStyle={filtrados.length === 0 ? styles.emptyWrap : undefined}
      />

      <View style={styles.navbarFixed}>
        <Navbar value="tasks" onChange={onTabChange} />
      </View>

      <TaskModal
        visible={taskModalVisible}
        task={taskSelected}
        onClose={closeTaskModal}
        onSave={onSaveTaskModal}
        onDelete={onDeleteTaskModal}
      />
    </View>
  )
}

function makeStyles(P: { bg: string; card: string; text: string; primary: string }, topInset: number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg, paddingHorizontal: 16, paddingTop: topInset + 56, paddingBottom: 96 },
    header: { marginBottom: 12 },
    ola: { color: P.text, fontSize: 20, fontWeight: '800' },
    sub: { color: P.text + '99', marginTop: 2 },
    form: { backgroundColor: P.card, padding: 12, borderRadius: 14, gap: 8, marginTop: 4, marginBottom: 12 },
    input: { backgroundColor: P.bg, borderRadius: 10, paddingHorizontal: 12, height: 44, color: P.text, borderWidth: 1, borderColor: P.card },
    dateBtn: { height: 44, borderRadius: 10, backgroundColor: P.primary, alignItems: 'center', justifyContent: 'center' },
    dateTxt: { color: P.bg, fontWeight: '700' },
    formChips: { paddingTop: 6 },
    button: { height: 44, borderRadius: 10, backgroundColor: P.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    buttonTxt: { color: P.bg, fontWeight: '700' },
    listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 6 },
    listTitle: { color: P.text, fontSize: 14, fontWeight: '800' },
    listCount: { color: '#CC8383', fontWeight: '700' },
    listChips: { paddingBottom: 8 },
    emptyWrap: { flexGrow: 1, justifyContent: 'center' },
    empty: { color: P.text + '66', textAlign: 'center' },
    card: { backgroundColor: P.card, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    check: { width: 28, height: 28, borderRadius: 999, borderWidth: 2, borderColor: P.primary, alignItems: 'center', justifyContent: 'center' },
    checkOn: { backgroundColor: P.primary, borderColor: P.primary },
    cardText: { flex: 1 },
    cardTitle: { color: P.text, fontWeight: '800' },
    cardTitleDone: { textDecorationLine: 'line-through', color: P.text + '99' },
    cardDesc: { color: P.text + '99', marginTop: 2 },
    cardDue: { color: '#B38A92', marginTop: 2, fontSize: 12, fontWeight: '700' },
    del: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    navbarFixed: { position: 'absolute', left: 16, right: 16, bottom: 16 }
  })
}
