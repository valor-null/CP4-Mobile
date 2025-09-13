import { initializeApp } from 'firebase/app'
import { initializeAuth } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeFirestore, setLogLevel, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const { getReactNativePersistence } = require('firebase/auth') as any

const firebaseConfig = {
    apiKey: 'AIzaSyCydDGRWRmXH19jSA_dAlad5XQGKLOtMso',
    authDomain: 'listartarefasplus.firebaseapp.com',
    projectId: 'listartarefasplus',
    storageBucket: 'listartarefasplus.appspot.com',
    messagingSenderId: '103265643462',
    appId: '1:103265643462:web:07442c710158a9c9dfa0c7'
}

const app = initializeApp(firebaseConfig)
const db = initializeFirestore(app, { experimentalForceLongPolling: true })
setLogLevel('error')

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

const storage = getStorage(app)

export { auth, db, storage, collection, addDoc, getDocs, doc, updateDoc, deleteDoc }
