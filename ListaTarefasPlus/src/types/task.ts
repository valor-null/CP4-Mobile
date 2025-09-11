import { Timestamp } from 'firebase/firestore'

export type Categoria = 'trabalho' | 'pessoal' | 'estudos' | 'desejos'
export type FiltroCategoria = 'all' | Categoria

export interface Task {
    id: string
    title: string
    description: string
    category: Categoria
    dueDate: Date | null
    done: boolean
    deleted?: boolean
    createdAt: Date
    updatedAt?: Date | null
}

export interface TaskDoc {
    title: string
    description: string
    category: Categoria
    dueDate: Timestamp | null
    done: boolean
    deleted?: boolean
    createdAt: Timestamp
    updatedAt?: Timestamp | null
}
