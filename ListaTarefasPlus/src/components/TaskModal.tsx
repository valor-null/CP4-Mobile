import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, Switch, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Task } from "../types/task";
import CampoDeData from "./CampoDeData";
import { useTranslation } from "react-i18next";

type Props = {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void> | void;
  onDelete: (taskId: string) => Promise<void> | void;
};

export default function TaskModal({ visible, task, onClose, onSave, onDelete }: Props) {
  const { colors: P } = useTheme();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const [due, setDue] = useState<Date | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setCompleted(!!task.completed);
      setDue(task.dueDate || null);
    }
  }, [task]);

  function handleSave() {
    if (!task) return;
    onSave(task.id, { title, description, completed, dueDate: due });
    onClose();
  }

  function handleDelete() {
    if (!task) return;
    onDelete(task.id);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: P.card, borderColor: P.text + "22" }]}>
          <Text style={[styles.title, { color: P.text }]}>{t("modal.editarTarefa")}</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: P.text + "99" }]}>{t("modal.titulo")}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t("modal.placeholderTitulo")}
              placeholderTextColor={P.text + "66"}
              style={[styles.input, { color: P.text, borderColor: P.text + "22", backgroundColor: P.bg }]}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: P.text + "99" }]}>{t("modal.descricao")}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t("modal.placeholderDescricao")}
              placeholderTextColor={P.text + "66"}
              multiline
              style={[styles.textarea, { color: P.text, borderColor: P.text + "22", backgroundColor: P.bg }]}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: P.text + "99" }]}>{t("modal.data")}</Text>
            <CampoDeData valor={due} onChange={setDue} estiloBotao={styles.dateBtn} estiloTexto={styles.dateTxt} icone="event" rotulo={t("modal.selecionar")} />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: P.text + "99" }]}>{t("modal.concluida")}</Text>
            <Switch value={completed} onValueChange={setCompleted} />
          </View>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.button, { borderColor: P.text + "22", backgroundColor: "transparent" }]}>
              <Text style={[styles.buttonText, { color: P.text }]}>{t("modal.cancelar")}</Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={[styles.button, { borderColor: P.primary, backgroundColor: "transparent" }]}>
              <Text style={[styles.buttonText, { color: P.primary }]}>{t("modal.excluir")}</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.button, { borderColor: P.primary, backgroundColor: P.primary }]}>
              <Text style={[styles.buttonText, { color: P.bg }]}>{t("modal.salvar")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" },
  card: { width: "100%", borderRadius: 14, padding: 16, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 16 },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 80, fontSize: 16, textAlignVertical: "top" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 8 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  button: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  dateBtn: { height: 44, borderRadius: 10 },
  dateTxt: { fontWeight: "700" }
});
