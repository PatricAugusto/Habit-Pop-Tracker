import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  colors,
  CONSUMPTION_TYPES,
  consumptionMeta,
} from "../config/appConfig";
import { ConsumptionCard } from "./ConsumptionCarousel";
import { DailySummary } from "./DailySummary";
import { RecentConsumptions } from "./RecentConsumptions";

const consumptionCards = CONSUMPTION_TYPES.map((type) => ({
  type,
  ...consumptionMeta[type],
}));

export function RecordPager({ recordCount, totals, onAdd, recentProps }) {
  const { width, height } = useWindowDimensions();
  const pagerHeight = Math.min(680, Math.max(500, height * 0.7));
  const [quantities, setQuantities] = useState(
    Object.fromEntries(CONSUMPTION_TYPES.map((type) => [type, 1])),
  );

  function updateQuantity(type, change) {
    setQuantities((current) => ({
      ...current,
      [type]: Math.max(1, current[type] + change),
    }));
  }

  async function handleAdd(type) {
    await onAdd(type, quantities[type]);
    setQuantities((current) => ({ ...current, [type]: 1 }));
  }

  return (
    <View>
      <View style={styles.pagerHeader}>
        <Text style={styles.sectionTitle}>Seu controle</Text>
        <Text style={styles.swipeHint}>deslize para o lado →</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        style={[styles.pager, { width, height: pagerHeight }]}
        contentContainerStyle={styles.pagerContent}
      >
        <View style={[styles.page, { width, height: pagerHeight }]}>
          <View style={styles.pageInner}>
            <DailySummary recordCount={recordCount} totals={totals} large />
          </View>
        </View>
        {consumptionCards.map((card) => (
          <View
            key={card.type}
            style={[styles.page, { width, height: pagerHeight }]}
          >
            <View style={styles.pageInner}>
              <ConsumptionCard
                card={card}
                quantity={quantities[card.type]}
                onDecrease={() => updateQuantity(card.type, -1)}
                onIncrease={() => updateQuantity(card.type, 1)}
                onAdd={() => handleAdd(card.type)}
                fullWidth
              />
            </View>
          </View>
        ))}
        <View style={[styles.page, { width, height: pagerHeight }]}>
          <View style={styles.pageInner}>
            <RecentConsumptions {...recentProps} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pagerHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  swipeHint: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  pager: { marginHorizontal: -22 },
  pagerContent: { alignItems: "stretch" },
  page: { paddingHorizontal: 22 },
  pageInner: { flex: 1, paddingVertical: 12 },
});
