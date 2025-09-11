import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'

type Props = {
  valor: Date | null
  onChange: (d: Date | null) => void
  estiloBotao?: ViewStyle
  estiloTexto?: TextStyle
  icone?: string
  rotulo?: string
}

const P = { bg: '#E6E0C5', primary: '#825E65' }

export default function CampoDeData({ valor, onChange, estiloBotao, estiloTexto, icone = 'event', rotulo = 'Data' }: Props) {
  function abrir() {
    const base = valor ?? new Date()
    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      is24Hour: true,
      onChange: (_, selectedDate) => {
        if (selectedDate) onChange(selectedDate)
      },
    })
  }

  function fmt(d?: Date | null) {
    if (!d) return rotulo
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  return (
    <TouchableOpacity style={[styles.btn, estiloBotao]} onPress={abrir} activeOpacity={0.8}>
      <MaterialIcons name={icone as any} size={16} color={P.bg} />
      <Text style={[styles.txt, estiloTexto]}>{fmt(valor)}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { height: 44, borderRadius: 10, backgroundColor: P.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  txt: { color: P.bg, fontWeight: '700' },
})
