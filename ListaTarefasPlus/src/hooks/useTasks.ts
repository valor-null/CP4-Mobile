import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  Timestamp,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseConfig'
import { taskConverter } from '../firebase/converters'
import { Task } from '../types/task'

export function useTasks() {
  const [items, setItems] = useState<Task[]>([])
  const uid = auth.currentUser?.uid ?? null

  useEffect(() => {
    if (!uid) return
    const ref = collection(db, 'users', uid, 'tasks').withConverter(taskConverter)
    const q = query(ref, where('deleted', '!=', true), orderBy('deleted'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => setItems(snap.docs.map(d => d.data())))
    return unsub
  }, [uid])

  const add = useCallback(
    async (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!uid) return
      const col = collection(db, 'users', uid, 'tasks').withConverter(taskConverter)
      const newRef = doc(col)
      const data: Task = {
        id: newRef.id,
        title: t.title,
        description: t.description,
        category: t.category,
        completed: t.completed,
        dueDate: t.dueDate,
        deleted: t.deleted ?? false,
        createdAt: new Date(),
        updatedAt: null,
      }
      await setDoc(newRef, data)
    },
    [uid]
  )

  const patch = useCallback(
    async (id: string, partial: Partial<Task>) => {
      if (!uid) return
      const ref = doc(db, 'users', uid, 'tasks', id)
      const payload: Record<string, unknown> = { ...partial, updatedAt: serverTimestamp() }
      if (partial.dueDate !== undefined) {
        payload.dueDate = partial.dueDate ? Timestamp.fromDate(partial.dueDate) : null
      }
      await updateDoc(ref, payload)
    },
    [uid]
  )

  const softDelete = useCallback(
    async (id: string) => {
      if (!uid) return
      await updateDoc(doc(db, 'users', uid, 'tasks', id), { deleted: true, updatedAt: serverTimestamp() })
    },
    [uid]
  )

  const hardDelete = useCallback(
    async (id: string) => {
      if (!uid) return
      await deleteDoc(doc(db, 'users', uid, 'tasks', id))
    },
    [uid]
  )

  return { items, add, patch, softDelete, hardDelete }
}
