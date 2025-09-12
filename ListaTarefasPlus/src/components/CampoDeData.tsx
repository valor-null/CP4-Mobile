import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useTheme } from '../context/ThemeContext'

type Props = {
  valor: Date | null
  onChange: (d: Date | null) => void
  estiloBotao?: ViewStyle
  estiloTexto?: TextStyle
  icone?: keyof typeof MaterialIcons.glyphMap
  rotulo?: string
}

export default function CampoDeData({ valor, onChange, estiloBotao, estiloTexto, icone = 'event', rotulo = 'Data' }: Props) {
  const { colors: P } = useTheme()

  function fmt(d?: Date | null) {
    if (!d) return rotulo
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
  }

  function openPickers() {
    const base = valor ?? new Date()
    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      is24Hour: true,
      onChange: (e: DateTimePickerEvent, selDate?: Date) => {
        if (e.type !== 'set' || !selDate) return
        const pickedDate = selDate
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          is24Hour: true,
          onChange: (e2: DateTimePickerEvent, selTime?: Date) => {
            if (e2.type !== 'set') {
              onChange(pickedDate)
              return
            }
            if (!selTime) return
            const final = new Date(pickedDate)
            final.setHours(selTime.getHours(), selTime.getMinutes(), 0, 0)
            onChange(final)
          },
        })
      },
    })
  }

  return (
    <TouchableOpacity onPress={openPickers} style={[styles.btn, { backgroundColor: P.primary }, estiloBotao]}>
      <MaterialIcons name={icone} size={18} color={P.bg} />
      <Text style={[styles.txt, { color: P.bg }, estiloTexto]} numberOfLines={1}>
        {fmt(valor)}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 12 },
  txt: { fontWeight: '700' },
})
