import {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    Timestamp,
} from 'firebase/firestore'
import { Task, TaskDoc } from '../types/task'

export const taskConverter: FirestoreDataConverter<Task> = {
    toFirestore(task: Task): TaskDoc {
    return {
        title: task.title,
        description: task.description,
        category: task.category,
        completed: task.completed,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        deleted: task.deleted ?? false,
        createdAt: task.createdAt ? Timestamp.fromDate(task.createdAt) : null,
        updatedAt: task.updatedAt ? Timestamp.fromDate(task.updatedAt) : null,
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<TaskDoc>, options: SnapshotOptions): Task {
        const data = snapshot.data(options)!
        return {
        id: snapshot.id,
        title: data.title,
        description: data.description,
        category: data.category,
        completed: data.completed,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        deleted: data.deleted ?? false,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
        }
    },
}
