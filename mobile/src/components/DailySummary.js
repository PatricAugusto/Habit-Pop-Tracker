import { StyleSheet, Text, View } from "react-native";
import { colors, consumptionMeta } from "../config/appConfig";

export function DailySummary({ recordCount, totals, large = false }) {
  return (
    <View style={[styles.summary, large && styles.largeSummary]}>
      <View style={styles.summaryTop}>
        <View>
          <Text style={styles.summaryLabel}>HOJE</Text>
          <Text
            style={[styles.summaryCount, large && styles.largeSummaryCount]}
          >
            {recordCount}
          </Text>
          <Text style={styles.summaryCountLabel}>registros marcados</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EM MOVIMENTO</Text>
        </View>
      </View>
      <View style={styles.dashLine} />
      <Text style={styles.sectionLabel}>SEUS RASTROS DE HOJE</Text>
      <View style={styles.fragments}>
        <SummaryFragment
          label={consumptionMeta.water.label}
          value={totals.water}
          icon={consumptionMeta.water.icon}
          accent={consumptionMeta.water.accent}
          style={styles.fragmentWater}
        />
        <SummaryFragment
          label={consumptionMeta.coffee.label}
          value={totals.coffee}
          icon={consumptionMeta.coffee.icon}
          accent={consumptionMeta.coffee.accent}
          style={styles.fragmentCoffee}
        />
        <SummaryFragment
          label={consumptionMeta.beer.label}
          value={totals.beer}
          icon={consumptionMeta.beer.icon}
          accent={consumptionMeta.beer.accent}
          style={styles.fragmentBeer}
        />
        <SummaryFragment
          label={consumptionMeta.cigarette.label}
          value={totals.cigarette}
          icon={consumptionMeta.cigarette.icon}
          accent={consumptionMeta.cigarette.accent}
          style={styles.fragmentCigarette}
        />
      </View>
      <View style={styles.summaryFooter}>
        <Text style={styles.footerMark}>/</Text>
        <Text style={styles.footerText}>cada escolha conta uma história</Text>
      </View>
    </View>
  );
}

function SummaryFragment({ label, value, icon, accent, style }) {
  return (
    <View style={[styles.fragment, { borderColor: accent }, style]}>
      <View style={[styles.fragmentIcon, { backgroundColor: accent }]}>
        <Text style={styles.fragmentIconText}>{icon}</Text>
      </View>
      <View style={styles.fragmentCopy}>
        <Text style={styles.fragmentValue}>{value}</Text>
        <Text style={styles.fragmentLabel}>{label.toUpperCase()}</Text>
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
  summaryTop: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  summaryCount: { color: colors.ink, fontSize: 29, fontWeight: "900" },
  largeSummaryCount: { fontSize: 66, lineHeight: 70, marginTop: 3 },
  summaryCountLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginTop: -2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 248, 238, 0.62)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.coral,
    marginRight: 6,
  },
  liveText: { color: colors.ink, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  dashLine: {
    width: "100%",
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(32, 36, 42, 0.28)",
    marginTop: 20,
  },
  sectionLabel: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 18,
  },
  fragments: {
    flex: 1,
    width: "100%",
    minHeight: 220,
    position: "relative",
    marginTop: 7,
  },
  fragment: {
    position: "absolute",
    width: "56%",
    minHeight: 62,
    backgroundColor: "rgba(255, 248, 238, 0.82)",
    borderWidth: 2,
    borderRadius: 18,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  fragmentWater: { top: 6, left: 0, transform: [{ rotate: "-3deg" }] },
  fragmentCoffee: { top: 62, right: 0, transform: [{ rotate: "3deg" }] },
  fragmentBeer: { top: 122, left: 18, transform: [{ rotate: "2deg" }] },
  fragmentCigarette: { top: 178, right: 7, transform: [{ rotate: "-3deg" }] },
  fragmentIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fragmentIconText: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  fragmentCopy: { flex: 1 },
  fragmentValue: { color: colors.ink, fontSize: 24, lineHeight: 25, fontWeight: "900" },
  fragmentLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  summaryFooter: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  footerMark: { color: colors.coral, fontSize: 26, fontWeight: "900", marginRight: 8 },
  footerText: { color: colors.ink, fontSize: 11, fontWeight: "800" },
});
