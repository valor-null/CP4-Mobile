import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import BotaoAlternarTema from '../components/BotaoAlternarTema'

type Routes = { Login: undefined; Cadastro: undefined; Home: undefined; Quotes: undefined; Profile: undefined }

const client = new QueryClient()

async function translateToPt(text: string) {
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`)
    if (!r.ok) return text
    const j = await r.json()
    return (j?.responseData?.translatedText as string) || text
  } catch {
    return text
  }
}

async function getQuotePt() {
  const c1 = new AbortController()
  const t1 = setTimeout(() => c1.abort(), 8000)
  try {
    const r1 = await fetch('https://api.quotable.io/random?tags=inspirational', { signal: c1.signal })
    clearTimeout(t1)
    if (r1.ok) {
      const j = await r1.json()
      const content = await translateToPt(j.content as string)
      return { content, author: j.author as string }
    }
  } catch {}
  const c2 = new AbortController()
  const t2 = setTimeout(() => c2.abort(), 8000)
  try {
    const r2 = await fetch('https://zenquotes.io/api/random', { signal: c2.signal })
    clearTimeout(t2)
    if (r2.ok) {
      const j = (await r2.json()) as Array<{ q: string; a: string }>
      const x = j[0]
      const content = await translateToPt(x.q)
      return { content, author: x.a }
    }
  } catch {}
  const c3 = new AbortController()
  const t3 = setTimeout(() => c3.abort(), 8000)
  const r3 = await fetch('https://type.fit/api/quotes', { signal: c3.signal })
  clearTimeout(t3)
  if (r3.ok) {
    const arr = (await r3.json()) as Array<{ text: string; author?: string | null }>
    const pick = arr[Math.floor(Math.random() * arr.length)]
    const content = await translateToPt(pick.text)
    return { content, author: pick.author ?? 'Anônimo' }
  }
  throw new Error('fail')
}

function QuoteCard({ slot }: { slot: string }) {
  const { colors: P } = useTheme()
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['quote-pt', slot],
    queryFn: getQuotePt,
    retry: 2,
  })

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: P.card }]}>
        <ActivityIndicator size="small" color={P.primary} />
        <Text style={[styles.loading, { color: P.text + '99' }]}>Carregando...</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[styles.card, { backgroundColor: P.card }]}>
        <Text style={[styles.error, { color: P.primary }]}>Não foi possível carregar</Text>
        <TouchableOpacity onPress={() => refetch()} style={[styles.button, { backgroundColor: P.primary }]}>
          <Ionicons name="refresh" size={16} color={P.bg} />
          <Text style={[styles.buttonTxt, { color: P.bg }]}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.card, { backgroundColor: P.card }]}>
      <Ionicons name="chatbubbles" size={18} color={P.primary} />
      <Text style={[styles.quote, { color: P.text }]}>"{data?.content}"</Text>
      <Text style={[styles.author, { color: P.text + '99' }]}>— {data?.author}</Text>
      <TouchableOpacity onPress={() => refetch()} disabled={isFetching} style={[styles.button, { backgroundColor: P.primary, opacity: isFetching ? 0.7 : 1 }]}>
        <Ionicons name="refresh" size={16} color={P.bg} />
        <Text style={[styles.buttonTxt, { color: P.bg }]}>{isFetching ? 'Buscando...' : 'Nova frase'}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function Quotes() {
  const insets = useSafeAreaInsets()
  const { colors: P } = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<Routes>>()
  function onTabChange(k: 'tasks' | 'quotes' | 'profile') {
    if (k === 'tasks') navigation.navigate('Home')
    if (k === 'profile') navigation.navigate('Profile')
  }
  return (
    <QueryClientProvider client={client}>
      <View style={[styles.safe, { backgroundColor: P.bg, paddingTop: insets.top + 56, paddingBottom: 96 }]}>
        <BotaoAlternarTema />
        <Text style={[styles.title, { color: P.text }]}>Frases motivacionais</Text>
        <View style={styles.grid}>
          <QuoteCard slot="a" />
          <QuoteCard slot="b" />
        </View>
        <View style={styles.navbarFixed}>
          <Navbar value="quotes" onChange={onTabChange} />
        </View>
      </View>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  grid: { gap: 12 },
  card: { padding: 16, borderRadius: 14, gap: 10 },
  loading: { textAlign: 'center' },
  error: { fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  quote: { fontSize: 16, fontWeight: '700' },
  author: { marginTop: 4, fontStyle: 'italic' },
  button: { height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8 },
  buttonTxt: { fontWeight: '700' },
  navbarFixed: { position: 'absolute', left: 16, right: 16, bottom: 16 },
})
