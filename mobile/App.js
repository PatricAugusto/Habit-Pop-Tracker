import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { AppHeader } from "./src/components/AppHeader";
import { ConsumptionCarousel } from "./src/components/ConsumptionCarousel";
import { DailySummary } from "./src/components/DailySummary";
import { RecentConsumptions } from "./src/components/RecentConsumptions";
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
        <DailySummary recordCount={todayItems.length} totals={totals} />
        <ConsumptionCarousel onAdd={addConsumption} />
        <RecentConsumptions
          items={items}
          pendingCount={pendingCount}
          syncing={syncing}
          online={online}
          onRemove={removeConsumption}
          onSync={syncItems}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 22, paddingBottom: 36, gap: 22 },
});
