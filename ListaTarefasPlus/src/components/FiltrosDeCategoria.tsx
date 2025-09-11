import { View, ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'

type Opcao = { chave: string; rotulo: string }

type Props = {
  dados: Opcao[]
  valor: string
  onChange: (chave: string) => void
  style?: ViewStyle
}

const P = { bg: '#E6E0C5', card: '#EBC4A9', text: '#3E3742', primary: '#825E65' }

const CHIP_HEIGHT = 28
const WRAP_PADDING_V = 4
const WRAPPER_HEIGHT = CHIP_HEIGHT + WRAP_PADDING_V * 2

export default function FiltrosDeCategoria({ dados, valor, onChange, style }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linha}>
        {dados.map(op => {
          const ativo = valor === op.chave
          return (
            <TouchableOpacity
              key={op.chave}
              onPress={() => onChange(op.chave)}
              activeOpacity={0.8}
              style={[styles.chip, ativo && styles.chipAtivo]}
            >
              <Text style={[styles.txt, ativo && styles.txtAtivo]}>{op.rotulo}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: WRAPPER_HEIGHT,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  linha: {
    gap: 8,
    paddingVertical: WRAP_PADDING_V,
    alignItems: 'center',
  },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 12,
    borderRadius: CHIP_HEIGHT / 2,
    backgroundColor: P.bg,
    borderWidth: 1,
    borderColor: P.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: P.primary,
    borderColor: P.primary,
  },
  txt: {
    fontSize: 12,
    fontWeight: '700',
    color: P.primary,
  },
  txtAtivo: {
    color: P.bg,
  },
})
