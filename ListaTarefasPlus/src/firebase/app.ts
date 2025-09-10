import { initializeApp, getApp, getApps } from 'firebase/app'
import { initializeAuth, getAuth } from 'firebase/auth'
import { getReactNativePersistence } from 'firebase/auth/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCydDGRWRmXH19jSA_dAlad5XQGKLOtMso',
  authDomain: 'listartarefasplus.firebaseapp.com',
  projectId: 'listartarefasplus',
  storageBucket: 'listartarefasplus.appspot.com',
  messagingSenderId: '103265643462',
  appId: '1:103265643462:web:07442c710158a9c9dfa0c7'
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getApps().length ? getAuth(app) : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })

export { app, auth }
export default app
