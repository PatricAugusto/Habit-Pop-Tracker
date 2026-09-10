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
              <Text style={styles.modalTitle}>Seus registros</Text>
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
            <Text style={styles.syncSummary}>
              {pendingCount > 0
                ? `${pendingCount} pendentes`
                : "Tudo sincronizado"}
            </Text>
            <Pressable onPress={onSync} disabled={syncing || !online}>
              <Text
                style={[
                  styles.pending,
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
                      <View>
                        <Text style={styles.itemTitle}>{meta.label}</Text>
                        <Text style={styles.itemTime}>
                          {formatTime(item.occurredAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.itemCount}>
                      <Text style={styles.countText}>x{item.quantity}</Text>
                      <Text
                        style={[
                          styles.syncState,
                          {
                            color: item.pendingSync
                              ? colors.coral
                              : colors.teal,
                          },
                        ]}
                      >
                        {item.pendingSync ? "PENDENTE" : "SYNC"}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Excluir ${meta.label}`}
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
                        <Text style={styles.deleteText}>Excluir</Text>
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
    fontSize: 29,
    fontWeight: "900",
    marginTop: 3,
  },
  closeText: { color: colors.ink, fontSize: 34, lineHeight: 34 },
  syncBar: {
    backgroundColor: "white",
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 15,
    padding: 13,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  syncSummary: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  pending: { color: colors.blue, fontSize: 13, fontWeight: "800" },
  disabled: { color: colors.muted },
  list: {
    backgroundColor: "white",
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  item: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  itemTime: { color: colors.muted, fontSize: 12, marginTop: 2 },
  itemCount: { alignItems: "flex-end", gap: 3 },
  countText: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  syncState: { fontSize: 10, fontWeight: "800" },
  deleteText: { color: colors.coral, fontSize: 11, fontWeight: "800" },
  separator: { height: 1, backgroundColor: "#E9E4DB" },
  empty: { color: colors.muted, paddingVertical: 18 },
});
