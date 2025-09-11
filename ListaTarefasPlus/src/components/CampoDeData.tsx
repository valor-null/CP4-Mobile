import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'

type Props = {
  valor: Date | null
  onChange: (d: Date | null) => void
  estiloBotao?: StyleProp<ViewStyle>
  estiloTexto?: StyleProp<TextStyle>
  icone?: string
  rotulo?: string
}

const P = { bg: '#E6E0C5', primary: '#825E65' }

export default function CampoDeData({
  valor,
  onChange,
  estiloBotao,
  estiloTexto,
  icone = 'event',
  rotulo = 'Data',
}: Props) {
  function abrir() {
    const base = valor ?? new Date()
    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      is24Hour: true,
      onChange: (e: any, selectedDate?: Date) => {
        if (!selectedDate || e.type !== 'set') return
        const d = new Date(selectedDate)
        const horas = valor ? valor.getHours() : 0
        const minutos = valor ? valor.getMinutes() : 0
        d.setHours(horas, minutos, 0, 0)
        DateTimePickerAndroid.open({
          value: d,
          mode: 'time',
          is24Hour: true,
          onChange: (e2: any, selectedTime?: Date) => {
            if (selectedTime && e2.type === 'set') {
              const h = selectedTime.getHours()
              const m = selectedTime.getMinutes()
              const final = new Date(d)
              final.setHours(h, m, 0, 0)
              onChange(final)
            } else {
              onChange(d)
            }
          },
        })
      },
    })
  }

  function fmt(d?: Date | null) {
    if (!d) return rotulo
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`
  }

  return (
    <TouchableOpacity style={[styles.btn, estiloBotao]} onPress={abrir} activeOpacity={0.8}>
      <MaterialIcons name={icone as any} size={16} color={P.bg} />
      <Text style={[styles.txt, estiloTexto]}>{fmt(valor)}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: P.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  txt: { color: P.bg, fontWeight: '700' },
})
