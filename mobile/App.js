import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STORAGE_KEY = "@habit-pop-tracker/consumptions";
const API_URL = "http://192.168.1.10:3000";
const colors = {
  ink: "#20242A",
  paper: "#FFF8EE",
  yellow: "#FFD84D",
  coral: "#F26A5B",
  teal: "#4CB9A5",
  blue: "#5D75D6",
  muted: "#6B6F76",
};

function makeClientId() {
  return `mobile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function App() {
  const [quantities, setQuantities] = useState({ beer: 1, cigarette: 1 });
  const [items, setItems] = useState([]);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(
      (stored) => stored && setItems(JSON.parse(stored)),
    );
    const unsubscribe = NetInfo.addEventListener((state) =>
      setOnline(Boolean(state.isConnected)),
    );
    return unsubscribe;
  }, []);

  const todayItems = useMemo(
    () =>
      items.filter(
        (item) =>
          new Date(item.occurredAt).toDateString() ===
          new Date().toDateString(),
      ),
    [items],
  );
  const totals = useMemo(
    () =>
      todayItems.reduce(
        (result, item) => ({
          ...result,
          [item.type]: result[item.type] + item.quantity,
        }),
        { beer: 0, cigarette: 0 },
      ),
    [todayItems],
  );

  async function saveItems(nextItems) {
    setItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  async function addConsumption(itemType) {
    await saveItems([
      {
        clientId: makeClientId(),
        type: itemType,
        quantity: quantities[itemType],
        occurredAt: new Date().toISOString(),
        pendingSync: true,
      },
      ...items,
    ]);
    setQuantities((current) => ({ ...current, [itemType]: 1 }));
  }

  async function syncItems() {
    const pending = items.filter((item) => item.pendingSync);
    if (!online || pending.length === 0) return;
    setSyncing(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumptions: pending }),
      });
      if (!response.ok) throw new Error("sync failed");
      await saveItems(items.map((item) => ({ ...item, pendingSync: false })));
    } catch {
      Alert.alert(
        "Ainda sem conexão",
        "Seus registros continuam salvos neste aparelho.",
      );
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (online) syncItems();
  }, [online]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HABIT POP</Text>
            <Text style={styles.title}>Seu ritmo, do seu jeito.</Text>
          </View>
          <View
            style={[
              styles.status,
              { backgroundColor: online ? colors.teal : colors.coral },
            ]}
          >
            <Text style={styles.statusText}>
              {online ? "ONLINE" : "OFFLINE"}
            </Text>
            <Text style={styles.statusSub}>
              {online ? "sincronizado" : "salvo local"}
            </Text>
          </View>
        </View>
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>HOJE</Text>
            <Text style={styles.summaryCount}>
              {todayItems.length} registros
            </Text>
          </View>
          <View style={styles.totals}>
            <Text>{totals.beer} cervejas</Text>
            <Text>{totals.cigarette} cigarros</Text>
          </View>
        </View>
        <View style={styles.registerHeader}>
          <Text style={styles.sectionTitle}>Registrar agora</Text>
          <Text style={styles.swipeHint}>deslize para o lado →</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          style={styles.carousel}
          decelerationRate="fast"
          snapToInterval={304}
        >
          {["beer", "cigarette"].map((itemType) => {
            const label = itemType === "beer" ? "Cerveja" : "Cigarro";
            const icon = itemType === "beer" ? "●" : "▰";
            const accent = itemType === "beer" ? colors.yellow : colors.coral;

            return (
              <View key={itemType} style={styles.recordCard}>
                <View style={[styles.recordArt, { backgroundColor: accent }]}>
                  <Text style={styles.recordIcon}>{icon}</Text>
                  <Text style={styles.recordArtLabel}>
                    {itemType === "beer" ? "PAUSA GELADA" : "MOMENTO"}
                  </Text>
                </View>
                <Text style={styles.recordTitle}>{label}</Text>
                <Text style={styles.recordDescription}>
                  Quantas unidades agora?
                </Text>
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityText}>
                    {quantities[itemType]} unidade(s)
                  </Text>
                  <View style={styles.stepper}>
                    <Pressable
                      accessibilityLabel={`Diminuir ${label}`}
                      style={styles.stepButton}
                      onPress={() =>
                        setQuantities((current) => ({
                          ...current,
                          [itemType]: Math.max(1, current[itemType] - 1),
                        }))
                      }
                    >
                      <Text style={styles.stepText}>−</Text>
                    </Pressable>
                    <Text style={styles.quantityNumber}>
                      {quantities[itemType]}
                    </Text>
                    <Pressable
                      accessibilityLabel={`Aumentar ${label}`}
                      style={[styles.stepButton, styles.plus]}
                      onPress={() =>
                        setQuantities((current) => ({
                          ...current,
                          [itemType]: current[itemType] + 1,
                        }))
                      }
                    >
                      <Text style={styles.lightText}>+</Text>
                    </Pressable>
                  </View>
                </View>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => addConsumption(itemType)}
                >
                  <Text style={styles.primaryText}>Adicionar {label}</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Últimos registros</Text>
          <Pressable onPress={syncItems} disabled={syncing || !online}>
            <Text style={styles.pending}>
              {syncing
                ? "Sincronizando..."
                : `${items.filter((item) => item.pendingSync).length} pendentes`}
            </Text>
          </Pressable>
        </View>
        <View style={styles.list}>
          {items.slice(0, 5).map((item, index) => (
            <View key={item.clientId}>
              <View style={styles.item}>
                <View style={styles.itemInfo}>
                  <View
                    style={[
                      styles.itemIcon,
                      {
                        backgroundColor:
                          item.type === "beer" ? colors.yellow : colors.coral,
                      },
                    ]}
                  >
                    <Text>{item.type === "beer" ? "●" : "▰"}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>
                      {item.type === "beer" ? "Cerveja" : "Cigarro"}
                    </Text>
                    <Text style={styles.itemTime}>
                      {formatTime(item.occurredAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemCount}>
                  <Text style={styles.countText}>x{item.quantity}</Text>
                  <Text
                    style={{
                      color: item.pendingSync ? colors.coral : colors.teal,
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    {item.pendingSync ? "PENDENTE" : "SYNC"}
                  </Text>
                </View>
              </View>
              {index < Math.min(items.length, 5) - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
          {items.length === 0 && (
            <Text style={styles.empty}>Seu primeiro registro começa aqui.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 22, paddingBottom: 36, gap: 22 },
  header: {
    paddingTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: { color: colors.ink, fontSize: 32, fontWeight: "900", maxWidth: 230 },
  status: { padding: 10, borderRadius: 14, alignItems: "center" },
  statusText: { color: "white", fontSize: 12, fontWeight: "800" },
  statusSub: { color: "white", fontSize: 10 },
  summary: {
    backgroundColor: colors.yellow,
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  summaryLabel: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  summaryCount: { color: colors.ink, fontSize: 29, fontWeight: "900" },
  totals: { alignItems: "flex-end", gap: 3 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  registerHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  swipeHint: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  carousel: { marginHorizontal: -22 },
  carouselContent: { gap: 14, paddingHorizontal: 22 },
  recordCard: {
    width: 290,
    backgroundColor: "white",
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 24,
    padding: 16,
    gap: 15,
  },
  recordArt: {
    height: 116,
    borderRadius: 16,
    padding: 14,
    justifyContent: "space-between",
  },
  recordIcon: { color: colors.ink, fontSize: 58, lineHeight: 62 },
  recordArtLabel: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  recordTitle: { color: colors.ink, fontSize: 25, fontWeight: "900" },
  recordDescription: { color: colors.muted, fontSize: 13, marginTop: -8 },
  lightText: { color: "white" },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityLabel: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  quantityText: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: { backgroundColor: colors.coral, borderWidth: 0 },
  stepText: { color: colors.ink, fontSize: 23 },
  quantityNumber: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  primaryButton: {
    backgroundColor: colors.ink,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "900" },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pending: { color: colors.blue, fontSize: 13, fontWeight: "800" },
  list: {
    backgroundColor: "white",
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
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
  separator: { height: 1, backgroundColor: "#E9E4DB" },
  empty: { color: colors.muted, paddingVertical: 18 },
});
