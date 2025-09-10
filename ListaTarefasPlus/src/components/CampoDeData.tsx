import { useState } from 'react'
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Props = {
  valor: Date | null
  onChange: (d: Date) => void
}

const P = { bg: '#E6E0C5', card: '#EBC4A9', text: '#3E3742', primary: '#825E65' }

export default function CampoDeData({ valor, onChange }: Props) {
  const [iosAberto, setIosAberto] = useState(false)
  const [tmpIOS, setTmpIOS] = useState<Date>(valor ?? new Date())

  function abrirAndroid() {
    const base = valor ?? new Date()
    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      onChange: (_e, d) => {
        if (!d) return
        const parcial = new Date(d)
        parcial.setHours(base.getHours(), base.getMinutes(), 0, 0)
        DateTimePickerAndroid.open({
          value: parcial,
          mode: 'time',
          onChange: (_e2, t) => {
            if (!t) return
            const final = new Date(parcial)
            final.setHours(t.getHours(), t.getMinutes(), 0, 0)
            onChange(final)
          }
        })
      }
    })
  }

  function abrir() {
    if (Platform.OS === 'android') abrirAndroid()
    else {
      setTmpIOS(valor ?? new Date())
      setIosAberto(true)
    }
  }

  const label =
    valor ? new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Data'

  return (
    <View>
      <TouchableOpacity onPress={abrir} style={styles.botao}>
        <MaterialCommunityIcons name="calendar-clock" size={16} color={P.bg} />
        <Text style={styles.txtBotao}>{label}</Text>
      </TouchableOpacity>

      {iosAberto && Platform.OS === 'ios' && (
        <View style={styles.modalIOS}>
          <DateTimePicker
            value={tmpIOS}
            mode="datetime"
            display="spinner"
            onChange={(_e, d) => d && setTmpIOS(d)}
          />
          <View style={styles.linhaAcoes}>
            <TouchableOpacity onPress={() => setIosAberto(false)} style={styles.acao}>
              <Text style={styles.txtAcao}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onChange(tmpIOS)
                setIosAberto(false)
              }}
              style={[styles.acao, styles.acaoPrim]}
            >
              <Text style={[styles.txtAcao, styles.txtAcaoPrim]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: P.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  txtBotao: { color: P.bg, fontSize: 14, fontWeight: '700' },
  modalIOS: {
    marginTop: 10,
    backgroundColor: P.card,
    borderRadius: 12,
    padding: 12
  },
  linhaAcoes: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  acao: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: P.bg
  },
  acaoPrim: { backgroundColor: P.primary },
  txtAcao: { color: P.text, fontWeight: '700' },
  txtAcaoPrim: { color: P.bg }
})
