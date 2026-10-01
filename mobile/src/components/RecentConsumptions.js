import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, consumptionMeta } from "../config/appConfig";
import { formatTime } from "../domain/consumptions";

export function RecentConsumptions({
  items,
  pendingCount,
  syncing,
  online,
  onRemove,
  onSync,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <View>
          <Text style={styles.cardEyebrow}>CONTROLE DIÁRIO</Text>
          <Text style={styles.cardTitle}>{items.length} registros salvos</Text>
          <Text style={styles.cardDescription}>
            {pendingCount > 0
              ? `${pendingCount} aguardando sincronização`
              : "Tudo sincronizado"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir controle diário"
          style={styles.openButton}
          onPress={() => setVisible(true)}
        >
          <Text style={styles.openButtonText}>Ver registros</Text>
          <Text style={styles.openButtonArrow}>→</Text>
        </Pressable>
      </View>

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.cardEyebrow}>CONTROLE DIÁRIO</Text>
              <Text style={styles.modalTitle}>Histórico</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar controle diário"
              hitSlop={10}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <View style={styles.syncBar}>
            <View style={styles.syncSummaryRow}>
              <View
                style={[
                  styles.syncDot,
                  pendingCount > 0 && styles.pendingDot,
                ]}
              />
              <Text style={styles.syncSummary}>
                {pendingCount > 0
                  ? `${pendingCount} pendentes`
                  : "Tudo sincronizado"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onSync}
              disabled={syncing || !online}
              style={styles.syncButton}
            >
              <Text
                style={[
                  styles.syncButtonText,
                  (syncing || !online) && styles.disabled,
                ]}
              >
                {syncing
                  ? "Sincronizando..."
                  : online
                    ? "Sincronizar"
                    : "Sem conexão"}
              </Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item, index) => {
              const meta = consumptionMeta[item.type];
              return (
                <View key={item.clientId}>
                  <View style={styles.item}>
                    <View style={styles.itemInfo}>
                      <View
                        style={[
                          styles.itemIcon,
                          { backgroundColor: meta.accent },
                        ]}
                      >
                        <Text>{meta.icon}</Text>
                      </View>
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemTitle}>{meta.label}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemTime}>
                            {formatTime(item.occurredAt)}
                          </Text>
                          <View
                            style={[
                              styles.syncDot,
                              item.pendingSync && styles.pendingDot,
                            ]}
                          />
                          <Text
                            style={[
                              styles.syncState,
                              item.pendingSync && styles.pendingState,
                            ]}
                          >
                            {item.pendingSync ? "Pendente" : "Sincronizado"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.itemActions}>
                      <View style={styles.itemCount}>
                        <Text style={styles.countText}>x{item.quantity}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Excluir ${meta.label}`}
                        style={styles.deleteButton}
                        hitSlop={8}
                        onPress={() =>
                          Alert.alert(
                            "Excluir registro?",
                            `${meta.label} x${item.quantity} será removido.`,
                            [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "Excluir",
                                style: "destructive",
                                onPress: () => onRemove(item.clientId),
                              },
                            ],
                          )
                        }
                      >
                        <Text style={styles.deleteText}>×</Text>
                      </Pressable>
                    </View>
                  </View>
                  {index < items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              );
            })}
            {items.length === 0 && (
              <Text style={styles.empty}>
                Seu primeiro registro começa aqui.
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardEyebrow: {
    color: colors.yellow,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  cardTitle: { color: "white", fontSize: 21, fontWeight: "900", marginTop: 5 },
  cardDescription: { color: "#D8D7D2", fontSize: 12, marginTop: 4 },
  openButton: {
    backgroundColor: colors.yellow,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  openButtonText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  openButtonArrow: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  modal: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 22,
    paddingTop: 58,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 3,
  },
  closeText: { color: colors.ink, fontSize: 34, lineHeight: 34 },
  syncBar: {
    backgroundColor: "white",
    borderColor: "#E9E4DB",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  syncSummaryRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  syncSummary: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  syncButton: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  syncButtonText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  disabled: { color: colors.muted },
  list: {
    backgroundColor: "white",
    borderColor: "#E9E4DB",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  item: {
    minHeight: 72,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemInfo: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 11 },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  itemTime: { color: colors.muted, fontSize: 11 },
  syncDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.teal },
  pendingDot: { backgroundColor: colors.coral },
  syncState: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  pendingState: { color: colors.coral },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemCount: {
    minWidth: 42,
    height: 34,
    paddingHorizontal: 7,
    backgroundColor: colors.paper,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#FFF0EC",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { color: colors.coral, fontSize: 22, lineHeight: 24, fontWeight: "700" },
  separator: { height: 1, backgroundColor: "#EEEAE3", marginLeft: 51 },
  empty: { color: colors.muted, paddingVertical: 20 },
});
