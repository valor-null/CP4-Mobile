import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native'
import { auth } from '../firebase/app'

type Task = { id: string; title: string; done: boolean; createdAt: number }

export default function Home() {
  const userLabel = useMemo(() => auth.currentUser?.displayName || auth.currentUser?.email || 'Você', [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [text, setText] = useState('')

  function addTask() {
    const t = text.trim()
    if (!t) return
    const newTask: Task = { id: String(Date.now()), title: t, done: false, createdAt: Date.now() }
    setTasks(prev => [newTask, ...prev])
    setText('')
  }

  function toggleTask(id: string) {
    setTasks(prev => prev.map(it => (it.id === id ? { ...it, done: !it.done } : it)))
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(it => it.id !== id))
  }

  function renderItem({ item }: { item: Task }) {
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => toggleTask(item.id)} style={[styles.check, item.done && styles.checkOn]}>
          {item.done ? <Text style={styles.checkMark}>✓</Text> : null}
        </TouchableOpacity>
        <Text style={[styles.itemText, item.done && styles.itemTextDone]} numberOfLines={2}>{item.title}</Text>
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

        <View style={styles.card}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Nova tarefa"
            placeholderTextColor="#825E65"
            style={styles.input}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity onPress={addTask} style={styles.button}>
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Minhas tarefas</Text>
          <Text style={styles.listCount}>{tasks.length}</Text>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={tasks.length === 0 ? styles.emptyWrap : undefined}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Sem tarefas por aqui</Text>
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E6E0C5' },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 16 },
  hello: { fontSize: 24, fontWeight: '800', color: '#3E3742' },
  subtitle: { fontSize: 14, color: '#825E65', marginTop: 4 },
  card: { backgroundColor: '#EBC4A9', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#E6E0C5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#3E3742', borderWidth: 1, borderColor: '#825E65' },
  button: { backgroundColor: '#825E65', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#E6E0C5', fontSize: 14, fontWeight: '700' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  listTitle: { color: '#3E3742', fontSize: 18, fontWeight: '700' },
  listCount: { color: '#CC8383', fontSize: 16, fontWeight: '700' },
  item: { backgroundColor: '#F2DCCB', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EBC4A9' },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#825E65', alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: '#E6E0C5' },
  checkOn: { backgroundColor: '#825E65', borderColor: '#825E65' },
  checkMark: { color: '#E6E0C5', fontSize: 18, fontWeight: '800' },
  itemText: { flex: 1, color: '#3E3742', fontSize: 16, fontWeight: '600' },
  itemTextDone: { textDecorationLine: 'line-through', color: '#825E65' },
  delete: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CC8383' },
  deleteText: { color: '#E6E0C5', fontSize: 18, fontWeight: '800', lineHeight: 18 },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#825E65', fontSize: 14 }
})
 