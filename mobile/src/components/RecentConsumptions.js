import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../config/appConfig";
import { formatTime } from "../domain/consumptions";

export function RecentConsumptions({ items, pendingCount, syncing, online, onSync }) {
  return (
    <>
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Últimos registros</Text>
        <Pressable onPress={onSync} disabled={syncing || !online}>
          <Text style={styles.pending}>{syncing ? "Sincronizando..." : `${pendingCount} pendentes`}</Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {items.slice(0, 5).map((item, index) => (
          <View key={item.clientId}>
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <View style={[styles.itemIcon, { backgroundColor: item.type === "beer" ? colors.yellow : colors.coral }]}>
                  <Text>{item.type === "beer" ? "●" : "▰"}</Text>
                </View>
                <View>
                  <Text style={styles.itemTitle}>{item.type === "beer" ? "Cerveja" : "Cigarro"}</Text>
                  <Text style={styles.itemTime}>{formatTime(item.occurredAt)}</Text>
                </View>
              </View>
              <View style={styles.itemCount}>
                <Text style={styles.countText}>x{item.quantity}</Text>
                <Text style={[styles.syncState, { color: item.pendingSync ? colors.coral : colors.teal }]}>
                  {item.pendingSync ? "PENDENTE" : "SYNC"}
                </Text>
              </View>
            </View>
            {index < Math.min(items.length, 5) - 1 && <View style={styles.separator} />}
          </View>
        ))}
        {items.length === 0 && <Text style={styles.empty}>Seu primeiro registro começa aqui.</Text>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pending: { color: colors.blue, fontSize: 13, fontWeight: "800" },
  list: { backgroundColor: "white", borderColor: colors.ink, borderWidth: 2, borderRadius: 20, paddingHorizontal: 16 },
  item: { paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  itemTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  itemTime: { color: colors.muted, fontSize: 12, marginTop: 2 },
  itemCount: { alignItems: "flex-end", gap: 3 },
  countText: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  syncState: { fontSize: 10, fontWeight: "800" },
  separator: { height: 1, backgroundColor: "#E9E4DB" },
  empty: { color: colors.muted, paddingVertical: 18 },
});
