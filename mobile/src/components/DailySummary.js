import { StyleSheet, Text, View } from "react-native";
import { colors, consumptionMeta } from "../config/appConfig";

export function DailySummary({ recordCount, totals, large = false }) {
  return (
    <View style={[styles.summary, large && styles.largeSummary]}>
      <View>
        <Text style={styles.summaryLabel}>HOJE</Text>
        <Text style={[styles.summaryCount, large && styles.largeSummaryCount]}>
          {recordCount} registros
        </Text>
      </View>
      <View style={styles.totals}>
        <Text>
          {totals.beer} {consumptionMeta.beer.label.toLowerCase()}
        </Text>
        <Text>
          {totals.cigarette} {consumptionMeta.cigarette.label.toLowerCase()}
        </Text>
        <Text>
          {totals.water} {consumptionMeta.water.label.toLowerCase()}
        </Text>
        <Text>
          {totals.coffee} {consumptionMeta.coffee.label.toLowerCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  largeSummary: {
    flex: 1,
    borderRadius: 28,
    padding: 24,
    alignItems: "flex-start",
  },
  summaryLabel: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  summaryCount: { color: colors.ink, fontSize: 29, fontWeight: "900" },
  largeSummaryCount: { fontSize: 42, marginTop: 6 },
  totals: { alignItems: "flex-end", gap: 3 },
});
