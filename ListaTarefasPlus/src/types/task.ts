import { Timestamp } from 'firebase/firestore'

export type Categoria = 'trabalho' | 'pessoal' | 'estudos' | 'desejos'
export type FiltroCategoria = 'all' | Categoria

export interface Task {
    id: string
    title: string
    description: string
    category: Categoria
    completed: boolean
    dueDate: Date | null
    deleted?: boolean
    createdAt: Date | null
    updatedAt: Date | null
}

export interface TaskDoc {
    title: string
    description: string
    category: Categoria
    completed: boolean
    dueDate: Timestamp | null
    deleted?: boolean
    createdAt: Timestamp | null
    updatedAt: Timestamp | null
}
