import { StyleSheet, Text, View } from "react-native";
import { colors } from "../config/appConfig";

export function AppHeader({ online }) {
  return (
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
        <Text style={styles.statusText}>{online ? "ONLINE" : "OFFLINE"}</Text>
        <Text style={styles.statusSub}>
          {online ? "sincronizado" : "salvo local"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
