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
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        done: task.done,
        deleted: task.deleted ?? false,
        createdAt: Timestamp.fromDate(task.createdAt),
        updatedAt: task.updatedAt ? Timestamp.fromDate(task.updatedAt) : null,
        }
    },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<TaskDoc>,
    options: SnapshotOptions
    ): Task {
        const data = snapshot.data(options)!
        return {
        id: snapshot.id,
        title: data.title,
        description: data.description,
        category: data.category,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        done: data.done,
        deleted: data.deleted ?? false,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
        }
    },
}
