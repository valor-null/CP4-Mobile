import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCHj89vd85966IQzmCJ7I4UjQ4151UEx8c',
  authDomain: 'lista-tarefas-plus.firebaseapp.com',
  projectId: 'lista-tarefas-plus',
  storageBucket: 'lista-tarefas-plus.firebasestorage.app',
  messagingSenderId: '708965482098',
  appId: '1:708965482098:web:e454ea8cf8ce1f6681cceb'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app