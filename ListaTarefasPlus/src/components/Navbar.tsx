import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

type TabKey = "tasks" | "quotes" | "profile";

type Props = {
  value: TabKey;
  onChange: (k: TabKey) => void;
  style?: StyleProp<ViewStyle>;
};

export default function Navbar({ value, onChange, style }: Props) {
  const { colors: P } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 6 }, style]}>
      <View style={[styles.bar, { backgroundColor: P.card }]}>
        <TouchableOpacity
          onPress={() => onChange("tasks")}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ selected: value === "tasks" }}
          style={[
            styles.btn,
            {
              borderColor: value === "tasks" ? P.primary : P.card,
              backgroundColor: value === "tasks" ? P.primary : P.bg,
            },
          ]}
        >
          <Ionicons
            name={value === "tasks" ? "list" : "list-outline"}
            size={18}
            color={value === "tasks" ? P.bg : P.primary}
          />
          <Text
            style={[
              styles.lbl,
              { color: value === "tasks" ? P.bg : P.primary },
            ]}
          >
            {t("nav.tarefas")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChange("quotes")}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ selected: value === "quotes" }}
          style={[
            styles.btn,
            {
              borderColor: value === "quotes" ? P.primary : P.card,
              backgroundColor: value === "quotes" ? P.primary : P.bg,
            },
          ]}
        >
          <Ionicons
            name={value === "quotes" ? "chatbubbles" : "chatbubbles-outline"}
            size={18}
            color={value === "quotes" ? P.bg : P.primary}
          />
          <Text
            style={[
              styles.lbl,
              { color: value === "quotes" ? P.bg : P.primary },
            ]}
          >
            {t("nav.frases")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChange("profile")}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ selected: value === "profile" }}
          style={[
            styles.btn,
            {
              borderColor: value === "profile" ? P.primary : P.card,
              backgroundColor: value === "profile" ? P.primary : P.bg,
            },
          ]}
        >
          <Ionicons
            name={
              value === "profile" ? "person-circle" : "person-circle-outline"
            }
            size={20}
            color={value === "profile" ? P.bg : P.primary}
          />
          <Text
            style={[
              styles.lbl,
              { color: value === "profile" ? P.bg : P.primary },
            ]}
          >
            {t("nav.perfil")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  bar: {
    flexDirection: "row",
    gap: 8,
    padding: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  lbl: { fontSize: 12, fontWeight: "800" },
});
