import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

type Props = { style?: StyleProp<ViewStyle> }

export default function BotaoAlternarIdioma({ style }: Props) {
  const { colors } = useTheme()
  const { lang, toggle } = useLanguage()
  const insets = useSafeAreaInsets()

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[styles.btn, { top: insets.top + 8, backgroundColor: colors.primary }, style]}
    >
      <Ionicons name="language" size={16} color={colors.bg} />
      <Text style={{ color: colors.bg, fontWeight: '800', marginLeft: 4 }}>
        {lang.toUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 56,
    width: 56,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
})
