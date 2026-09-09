import { StyleSheet, Text, View } from "react-native";
import { colors, consumptionMeta } from "../config/appConfig";

export function DailySummary({ recordCount, totals }) {
  return (
    <View style={styles.summary}>
      <View>
        <Text style={styles.summaryLabel}>HOJE</Text>
        <Text style={styles.summaryCount}>{recordCount} registros</Text>
      </View>
      <View style={styles.totals}>
        <Text>{totals.beer} {consumptionMeta.beer.label.toLowerCase()}</Text>
        <Text>{totals.cigarette} {consumptionMeta.cigarette.label.toLowerCase()}</Text>
        <Text>{totals.water} {consumptionMeta.water.label.toLowerCase()}</Text>
        <Text>{totals.coffee} {consumptionMeta.coffee.label.toLowerCase()}</Text>
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
  summaryLabel: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  summaryCount: { color: colors.ink, fontSize: 29, fontWeight: "900" },
  totals: { alignItems: "flex-end", gap: 3 },
});
