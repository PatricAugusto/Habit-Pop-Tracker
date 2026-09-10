import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { AppHeader } from "./src/components/AppHeader";
import { RecordPager } from "./src/components/RecordPager";
import { colors } from "./src/config/appConfig";
import { useConsumptions } from "./src/hooks/useConsumptions";

export default function App() {
  const {
    items,
    online,
    syncing,
    pendingCount,
    todayItems,
    totals,
    addConsumption,
    removeConsumption,
    syncItems,
  } = useConsumptions();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader online={online} />
        <RecordPager
          recordCount={todayItems.length}
          totals={totals}
          onAdd={addConsumption}
          recentProps={{
            items,
            pendingCount,
            syncing,
            online,
            onRemove: removeConsumption,
            onSync: syncItems,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 22, paddingBottom: 36, gap: 22 },
});
