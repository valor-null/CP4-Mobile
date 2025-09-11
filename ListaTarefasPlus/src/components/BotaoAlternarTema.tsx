import { TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'

export default function BotaoAlternarTema({ style }: { style?: any }) {
const { mode, toggle, colors } = useTheme()
const insets = useSafeAreaInsets()
    return (
    <TouchableOpacity
        onPress={toggle}
        style={[styles.btn, { top: insets.top + 8, backgroundColor: colors.primary }, style]}
    >
        <Ionicons name={mode === 'dark' ? 'sunny' : 'moon'} size={18} color={colors.bg} />
    </TouchableOpacity>
)
}

const styles = StyleSheet.create({
btn: {
    position: 'absolute',
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20
}
})