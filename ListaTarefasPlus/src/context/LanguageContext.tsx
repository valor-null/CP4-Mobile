import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from '../services/i18n'

type Lang = 'pt' | 'en'
type Ctx = { lang: Lang; set: (l: Lang) => void; toggle: () => void }

const LanguageContext = createContext<Ctx | null>(null)
const STORAGE_KEY = '@lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('pt')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'pt' || v === 'en') {
        setLang(v)
        i18n.changeLanguage(v)
      }
    })
  }, [])

  const set = (l: Lang) => {
    setLang(l)
    i18n.changeLanguage(l)
  }

  const toggle = () => set(lang === 'pt' ? 'en' : 'pt')

  const value = useMemo(() => ({ lang, set, toggle }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider ausente')
  return context
}
