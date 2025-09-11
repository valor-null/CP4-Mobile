import { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import FiltrosDeCategoria from '../components/FiltrosDeCategoria'
import CampoDeData from '../components/CampoDeData'
import { auth, db } from '../firebase/firebaseConfig'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import BotaoAlternarTema from '../components/BotaoAlternarTema'
import { Task } from '../types/task'
import Navbar from '../components/Navbar'

type Tab = 'tasks' | 'quotes' | 'profile'

const CATS = [
  { chave: 'all', rotulo: 'Todos' },
  { chave: 'trabalho', rotulo: 'Trabalho' },
  { chave: 'pessoal', rotulo: 'Pessoal' },
  { chave: 'estudos', rotulo: 'Estudos' },
  { chave: 'desejos', rotulo: 'Desejos' }
]

export default function Home() {
  const { colors: P } = useTheme()
  const insets = useSafeAreaInsets()
  const styles = useMemo(() => makeStyles(P, insets.top), [P, insets.top])

  const user = auth.currentUser
  const nome = user?.displayName || user?.email?.split('@')[0] || ''
  const [tab, setTab] = useState<Tab>('tasks')
  const [sel, setSel] = useState('all')
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [formCat, setFormCat] = useState('trabalho')
  const [venc, setVenc] = useState<Date | null>(null)
  const [itens, setItens] = useState<Task[]>([])

  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'tasks')
    const q = query(ref, where('deleted', '!=', true), orderBy('deleted'), orderBy('createdAt', 'desc'))
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
      setItens(rows)
    })
    return unsub
  }, [user?.uid])

  const filtrados = useMemo(() => {
    if (sel === 'all') return itens
    return itens.filter(t => t.category === sel)
  }, [itens, sel])

  async function addTask() {
    if (!user) return
    if (!titulo.trim()) return
    const ref = collection(db, 'users', user.uid, 'tasks')
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
    await addDoc(ref, payload)
    setTitulo('')
    setDesc('')
    setVenc(null)
    setFormCat('trabalho')
  }

  async function toggleDone(id: string, done: boolean) {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { completed: !done, updatedAt: serverTimestamp() })
  }

  async function remover(id: string) {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id))
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

  function Item({ item }: { item: Task }) {
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleDone(item.id, item.completed)} style={[styles.check, item.completed && styles.checkOn]}>
          <MaterialIcons name={item.completed ? 'check' : 'radio-button-unchecked'} size={18} color={item.completed ? P.bg : P.primary} />
        </TouchableOpacity>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, item.completed && styles.cardTitleDone]} numberOfLines={1}>{item.title}</Text>
          {!!item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
          {!!item.dueDate && <Text style={styles.cardDue}>Vence: {fmt(item.dueDate || null)}</Text>}
        </View>
        <TouchableOpacity onPress={() => remover(item.id)} style={styles.del}>
          <MaterialIcons name="close" size={18} color={P.primary} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.safe}>
      <BotaoAlternarTema />

      {tab === 'tasks' && (
        <>
          <View style={styles.header}>
            <Text style={styles.ola}>Olá, {nome}</Text>
            <Text style={styles.sub}>Organize suas tarefas</Text>
          </View>

          <View style={styles.form}>
            <TextInput placeholder="Título" value={titulo} onChangeText={setTitulo} style={styles.input} placeholderTextColor={P.text + '99'} />
            <TextInput placeholder="Descrição" value={desc} onChangeText={setDesc} style={styles.input} placeholderTextColor={P.text + '99'} />
            <CampoDeData valor={venc} onChange={setVenc} estiloBotao={styles.dateBtn} estiloTexto={styles.dateTxt} icone="event" rotulo="Data" />
            <FiltrosDeCategoria dados={CATS.filter(c => c.chave !== 'all')} valor={formCat} onChange={setFormCat} style={styles.formChips} />
            <TouchableOpacity onPress={addTask} style={styles.button}>
              <Text style={styles.buttonTxt}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Minhas tarefas</Text>
            <Text style={styles.listCount}>{filtrados.length}</Text>
          </View>

          <FiltrosDeCategoria dados={CATS} valor={sel} onChange={c => setSel(c)} style={styles.listChips} />

          <FlatList
            data={filtrados}
            keyExtractor={i => i.id}
            renderItem={Item}
            ListEmptyComponent={<Text style={styles.empty}>Sem tarefas por aqui</Text>}
            contentContainerStyle={filtrados.length === 0 ? styles.emptyWrap : undefined}
          />
        </>
      )}

      {tab === 'quotes' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Frases motivacionais</Text>
          <Text style={styles.placeholderSub}>Em breve</Text>
        </View>
      )}

      {tab === 'profile' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Meu perfil</Text>
          <Text style={styles.placeholderSub}>Em breve</Text>
        </View>
      )}

      <View style={styles.navbar}>
        <Navbar value={tab} onChange={setTab} />
      </View>
    </View>
  )
}

function makeStyles(P: { bg: string; card: string; text: string; primary: string }, topInset: number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg, paddingHorizontal: 16, paddingTop: topInset + 56 },
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
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    placeholderTitle: { color: P.text, fontSize: 18, fontWeight: '800' },
    placeholderSub: { color: P.text + '99', marginTop: 4 },
    navbar: { marginTop: 8 }
  })
}
