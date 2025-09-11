import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Mode = 'light' | 'dark'
type Colors = { bg: string; card: string; text: string; primary: string }
type Ctx = { mode: Mode; colors: Colors; toggle: () => void; set: (m: Mode) => void }

const LIGHT: Colors = { bg: '#E6E0C5', card: '#EBC4A9', text: '#3E3742', primary: '#825E65' }
const DARK: Colors = { bg: '#1B171B', card: '#251F24', text: '#F2EADF', primary: '#A57A83' }

const ThemeContext = createContext<Ctx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light')

  useEffect(() => {
    AsyncStorage.getItem('@theme').then(v => {
      if (v === 'dark' || v === 'light') setMode(v as Mode)
    })
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('@theme', mode).catch(() => {})
  }, [mode])

  const colors = mode === 'light' ? LIGHT : DARK
  const toggle = () => setMode(m => (m === 'light' ? 'dark' : 'light'))
  const value = useMemo(() => ({ mode, colors, toggle, set: setMode }), [mode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeProvider ausente')
  return ctx
}