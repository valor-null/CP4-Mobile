import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'

type Opcao = { chave: string; rotulo: string }

type Props = {
  dados: Opcao[]
  valor: string
  onChange: (chave: string) => void
  style?: ViewStyle
}

const P = { bg: '#E6E0C5', card: '#EBC4A9', text: '#3E3742', primary: '#825E65' }

export default function SeletorDeCategoria({ dados, valor, onChange, style }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.linha, style]}>
      {dados.map(op => {
        const ativo = valor === op.chave
        return (
          <TouchableOpacity
            key={op.chave}
            onPress={() => onChange(op.chave)}
            style={[styles.chip, ativo && styles.chipAtivo]}
          >
            <Text style={[styles.txt, ativo && styles.txtAtivo]}>{op.rotulo}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  linha: { gap: 8, paddingVertical: 4 },
  chip: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: P.bg,
    borderWidth: 1,
    borderColor: P.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipAtivo: { backgroundColor: P.primary, borderColor: P.primary },
  txt: { color: P.primary, fontSize: 12, fontWeight: '700' },
  txtAtivo: { color: P.bg }
})
