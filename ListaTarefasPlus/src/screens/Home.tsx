import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { auth } from '../firebase/app'
import app from '../firebase/app'
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'

type CategoryKey = 'all' | 'work' | 'personal' | 'study' | 'wishlist' | 'others'
type Task = { id: string; title: string; description: string; completed: boolean; dueDate: string; createdAt?: any; updatedAt?: any; category: Exclude<CategoryKey, 'all'> }

const db = getFirestore(app)
const PALETTE = { bg: '#E6E0C5', card: '#EBC4A9', card2: '#F2DCCB', text: '#3E3742', primary: '#825E65', accent: '#CC8383' }
const CATEGORIES: { key: CategoryKey; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'all', label: 'Todas', icon: 'apps' },
  { key: 'work', label: 'Trabalho', icon: 'briefcase-outline' },
  { key: 'personal', label: 'Pessoal', icon: 'account-heart-outline' },
  { key: 'study', label: 'Estudos', icon: 'school-outline' },
  { key: 'wishlist', label: 'Desejos', icon: 'star-outline' },
  { key: 'others', label: 'Outros', icon: 'dots-horizontal' }
]

export default function Home() {
  const uid = auth.currentUser?.uid
  const userLabel = useMemo(() => auth.currentUser?.displayName || auth.currentUser?.email || 'Você', [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [activeCat, setActiveCat] = useState<CategoryKey>('all')

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'users', uid, 'tasks'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const data: Task[] = snap.docs.map(d => {
        const v = d.data() as any
        return { id: d.id, title: String(v.title || ''), description: String(v.description || ''), completed: Boolean(v.completed), dueDate: String(v.dueDate || ''), createdAt: v.createdAt, updatedAt: v.updatedAt, category: (v.category || 'others') as Task['category'] }
      })
      setTasks(data)
    })
    return () => unsub()
  }, [uid])

  async function addTask() {
    if (!uid) return
    const t = title.trim()
    const desc = description.trim()
    const dd = dueDate.trim()
    if (!t || !dd) return
    const selected = activeCat === 'all' ? 'others' : activeCat
    await addDoc(collection(db, 'users', uid, 'tasks'), { title: t, description: desc, completed: false, dueDate: dd, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), category: selected })
    setTitle('')
    setDescription('')
    setDueDate('')
  }

  async function toggleTask(item: Task) {
    if (!uid) return
    await updateDoc(doc(db, 'users', uid, 'tasks', item.id), { completed: !item.completed, updatedAt: serverTimestamp() })
  }

  async function removeTask(id: string) {
    if (!uid) return
    await deleteDoc(doc(db, 'users', uid, 'tasks', id))
  }

  const filtered = activeCat === 'all' ? tasks : tasks.filter(t => t.category === activeCat)

  function renderItem({ item }: { item: Task }) {
    const cat = CATEGORIES.find(c => c.key === item.category)
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => toggleTask(item)} style={[styles.check, item.completed && styles.checkOn]}>
          {item.completed ? <Text style={styles.checkMark}>✓</Text> : null}
        </TouchableOpacity>
        <View style={styles.itemMain}>
          <View style={styles.itemHead}>
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons name={(cat?.icon || 'dots-horizontal') as any} size={18} color={PALETTE.primary} />
            </View>
            <Text style={[styles.itemTitle, item.completed && styles.itemTextDone]} numberOfLines={1}>{item.title}</Text>
          </View>
          {!!item.description && <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>}
          {!!item.dueDate && <Text style={styles.itemDue}>Vence: {item.dueDate}</Text>}
        </View>
        <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.delete}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.hello}>Olá, {userLabel}</Text>
          <Text style={styles.subtitle}>Organize suas tarefas</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.key
            return (
              <TouchableOpacity key={cat.key} onPress={() => setActiveCat(cat.key)} style={[styles.catChip, active && styles.catChipActive]}>
                <MaterialCommunityIcons name={cat.icon as any} size={16} color={active ? PALETTE.bg : PALETTE.primary} />
                <Text style={[styles.catText, active && styles.catTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <View style={styles.card}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Título" placeholderTextColor={PALETTE.primary} style={styles.input} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Descrição" placeholderTextColor={PALETTE.primary} style={styles.input} />
          <TextInput value={dueDate} onChangeText={setDueDate} placeholder="Data (ISO ex: 2025-09-10T14:00:00Z)" placeholderTextColor={PALETTE.primary} style={styles.input} />
          <TouchableOpacity onPress={addTask} style={styles.button}><Text style={styles.buttonText}>Adicionar</Text></TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Minhas tarefas</Text>
          <Text style={styles.listCount}>{filtered.length}</Text>
        </View>

        <FlatList data={filtered} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={filtered.length === 0 ? styles.emptyWrap : undefined} ListEmptyComponent={<Text style={styles.emptyText}>Sem tarefas por aqui</Text>} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PALETTE.bg },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 12 },
  hello: { fontSize: 24, fontWeight: '800', color: PALETTE.text },
  subtitle: { fontSize: 14, color: PALETTE.primary, marginTop: 4 },
  catRow: { gap: 8, paddingVertical: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: PALETTE.card, borderWidth: 1, borderColor: PALETTE.primary },
  catChipActive: { backgroundColor: PALETTE.primary, borderColor: PALETTE.primary },
  catText: { color: PALETTE.primary, fontWeight: '700' },
  catTextActive: { color: PALETTE.bg },
  card: { backgroundColor: PALETTE.card, borderRadius: 16, padding: 14, gap: 10, marginBottom: 12 },
  input: { backgroundColor: PALETTE.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: PALETTE.text, borderWidth: 1, borderColor: PALETTE.primary },
  button: { backgroundColor: PALETTE.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: PALETTE.bg, fontSize: 14, fontWeight: '700' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  listTitle: { color: PALETTE.text, fontSize: 18, fontWeight: '700' },
  listCount: { color: PALETTE.accent, fontSize: 16, fontWeight: '700' },
  item: { backgroundColor: PALETTE.card2, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: PALETTE.card },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: PALETTE.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: PALETTE.bg },
  checkOn: { backgroundColor: PALETTE.primary, borderColor: PALETTE.primary },
  checkMark: { color: PALETTE.bg, fontSize: 18, fontWeight: '800' },
  itemMain: { flex: 1, gap: 4 },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemIconWrap: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg, borderWidth: 1, borderColor: PALETTE.card },
  itemTitle: { flex: 1, color: PALETTE.text, fontSize: 16, fontWeight: '700' },
  itemDesc: { color: PALETTE.primary, fontSize: 13 },
  itemDue: { color: PALETTE.accent, fontSize: 12, fontWeight: '700' },
  itemTextDone: { textDecorationLine: 'line-through', color: PALETTE.primary },
  delete: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.accent, marginLeft: 8 },
  deleteText: { color: PALETTE.bg, fontSize: 18, fontWeight: '800', lineHeight: 18 },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: PALETTE.primary, fontSize: 14 }
})
