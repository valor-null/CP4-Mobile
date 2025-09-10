import { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import SeletorDeCategoria from '../components/SeletorDeCategoria'
import CampoDeData from '../components/CampoDeData'
import { auth, db } from '../firebase/firebaseConfig'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore'
import { signOut } from 'firebase/auth'

type Tarefa = {
  id: string
  title: string
  description: string
  category: string
  completed: boolean
  dueDate?: Date | null
  createdAt?: any
  updatedAt?: any
}

const P = { bg: '#E6E0C5', card: '#EBC4A9', text: '#3E3742', primary: '#825E65' }

const CATS = [
  { chave: 'all', rotulo: 'Todos' },
  { chave: 'trabalho', rotulo: 'Trabalho' },
  { chave: 'pessoal', rotulo: 'Pessoal' },
  { chave: 'estudos', rotulo: 'Estudos' },
  { chave: 'desejos', rotulo: 'Desejos' }
]

export default function Home() {
  const user = auth.currentUser
  const nome = user?.displayName || user?.email?.split('@')[0] || ''
  const [sel, setSel] = useState('all')
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [formCat, setFormCat] = useState('trabalho')
  const [venc, setVenc] = useState<Date | null>(null)
  const [itens, setItens] = useState<Tarefa[]>([])

  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'tasks')
    const q = query(ref, where('deleted', '!=', true), orderBy('deleted'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const rows: Tarefa[] = []
      snap.forEach(d => {
        const data = d.data() as any
        rows.push({
          id: d.id,
          title: data.title,
          description: data.description,
          category: data.category,
          completed: !!data.completed,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate ?? null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
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

  function Item({ item }: { item: Tarefa }) {
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
      <View style={styles.topbar}>
        <Text style={styles.title}>Lista de Tarefas</Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={styles.exit}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.ola}>Olá, {nome}</Text>
        <Text style={styles.sub}>Organize suas tarefas</Text>
      </View>

      <SeletorDeCategoria dados={CATS} valor={sel} onChange={c => setSel(c)} style={styles.gapBottom} />

      <View style={styles.form}>
        <TextInput placeholder="Título" value={titulo} onChangeText={setTitulo} style={styles.input} placeholderTextColor={P.text + '99'} />
        <TextInput placeholder="Descrição" value={desc} onChangeText={setDesc} style={styles.input} placeholderTextColor={P.text + '99'} />
        <CampoDeData valor={venc} onChange={setVenc} estiloBotao={styles.dateBtn} estiloTexto={styles.dateTxt} icone="event" rotulo="Data" />
        <SeletorDeCategoria dados={CATS.filter(c => c.chave !== 'all')} valor={formCat} onChange={setFormCat} style={styles.gapTop} />
        <TouchableOpacity onPress={addTask} style={styles.button}>
          <Text style={styles.buttonTxt}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Minhas tarefas</Text>
        <Text style={styles.listCount}>{filtrados.length}</Text>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={i => i.id}
        renderItem={Item}
        ListEmptyComponent={<Text style={styles.empty}>Sem tarefas por aqui</Text>}
        contentContainerStyle={filtrados.length === 0 ? styles.emptyWrap : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg, paddingHorizontal: 16, paddingTop: 10 },
  topbar: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', backgroundColor: '#3E3742', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  exit: { color: '#3E3742', fontWeight: '700' },
  header: { marginTop: 8, marginBottom: 10 },
  ola: { color: P.text, fontSize: 20, fontWeight: '800' },
  sub: { color: P.text + '99', marginTop: 2 },
  gapBottom: { paddingBottom: 8 },
  gapTop: { paddingTop: 8 },
  form: { backgroundColor: P.card, padding: 12, borderRadius: 14, gap: 8 },
  input: { backgroundColor: P.bg, borderRadius: 10, paddingHorizontal: 12, height: 44, color: P.text, borderWidth: 1, borderColor: P.card },
  dateBtn: { height: 44, borderRadius: 10, backgroundColor: P.primary, alignItems: 'center', justifyContent: 'center' },
  dateTxt: { color: P.bg, fontWeight: '700' },
  button: { height: 44, borderRadius: 10, backgroundColor: P.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonTxt: { color: P.bg, fontWeight: '700' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 4 },
  listTitle: { color: P.text, fontSize: 14, fontWeight: '800' },
  listCount: { color: '#CC8383', fontWeight: '700' },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  empty: { color: P.text + '66', textAlign: 'center' },
  card: { backgroundColor: '#F2D9CC', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  check: { width: 28, height: 28, borderRadius: 999, borderWidth: 2, borderColor: P.primary, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: P.primary, borderColor: P.primary },
  cardText: { flex: 1 },
  cardTitle: { color: P.text, fontWeight: '800' },
  cardTitleDone: { textDecorationLine: 'line-through', color: P.text + '99' },
  cardDesc: { color: P.text + '99', marginTop: 2 },
  cardDue: { color: '#9a6c73', marginTop: 2, fontSize: 12, fontWeight: '700' },
  del: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }
})
