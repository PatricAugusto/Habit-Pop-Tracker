import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  colors,
  CONSUMPTION_TYPES,
  consumptionMeta,
} from "../config/appConfig";
import { CardArtwork } from "./CardArtwork";

const consumptionCards = CONSUMPTION_TYPES.map((type) => ({
  type,
  ...consumptionMeta[type],
}));

export function ConsumptionCard({
  card,
  quantity,
  onDecrease,
  onIncrease,
  onAdd,
  fullWidth = false,
}) {
  return (
    <View style={[styles.recordCard, fullWidth && styles.fullWidthCard]}>
      <View style={[styles.recordArt, { backgroundColor: card.accent }]}>
        <View style={styles.artwork}>
          <CardArtwork type={card.type} accent={card.accent} />
        </View>
        <Text style={styles.recordArtLabel}>{card.artLabel}</Text>
      </View>
      <View style={styles.recordBody}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.recordKicker}>REGISTRAR AGORA</Text>
            <Text style={styles.recordTitle}>{card.label}</Text>
          </View>
          <View style={[styles.typeDot, { backgroundColor: card.accent }]} />
        </View>
        <Text style={styles.recordDescription}>
          Marque a quantidade deste momento.
        </Text>
        <View style={styles.quantityPanel}>
          <View>
            <Text style={styles.quantityLabel}>QUANTIDADE</Text>
            <Text style={styles.quantityText}>
              {quantity} {quantity === 1 ? "unidade" : "unidades"}
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              accessibilityLabel={`Diminuir ${card.label}`}
              style={styles.stepButton}
              onPress={onDecrease}
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Text style={styles.quantityNumber}>{quantity}</Text>
            <Pressable
              accessibilityLabel={`Aumentar ${card.label}`}
              style={[styles.stepButton, styles.plus]}
              onPress={onIncrease}
            >
              <Text style={styles.lightText}>+</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.primaryButton} onPress={onAdd}>
          <Text style={styles.primaryText}>Adicionar {card.label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ConsumptionCarousel({ onAdd }) {
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
    <>
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
        {consumptionCards.map((card) => (
          <ConsumptionCard
            key={card.type}
            card={card}
            quantity={quantities[card.type]}
            onDecrease={() => updateQuantity(card.type, -1)}
            onIncrease={() => updateQuantity(card.type, 1)}
            onAdd={() => handleAdd(card.type)}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  registerHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  swipeHint: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  carousel: { marginHorizontal: -22 },
  carouselContent: { gap: 14, paddingHorizontal: 22 },
  recordCard: {
    width: 290,
    backgroundColor: "white",
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 28,
    padding: 14,
    gap: 14,
  },
  fullWidthCard: { width: "100%", flex: 1 },
  recordArt: {
    height: 240,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
  },
  artwork: { flex: 1, marginHorizontal: -8, marginTop: -4 },
  recordArtLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  recordBody: { flex: 1, paddingHorizontal: 4, paddingBottom: 2 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordKicker: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  recordTitle: { color: colors.ink, fontSize: 32, fontWeight: "900", marginTop: 2 },
  typeDot: { width: 13, height: 13, borderRadius: 7, marginRight: 4 },
  recordDescription: { color: colors.muted, fontSize: 13, marginTop: 3 },
  quantityPanel: {
    backgroundColor: colors.paper,
    borderRadius: 17,
    padding: 12,
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  quantityText: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 3 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 9 },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    borderColor: colors.ink,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: { backgroundColor: colors.coral, borderWidth: 0 },
  stepText: { color: colors.ink, fontSize: 23 },
  quantityNumber: { color: colors.ink, fontSize: 21, fontWeight: "900", minWidth: 18, textAlign: "center" },
  lightText: { color: "white" },
  primaryButton: {
    backgroundColor: colors.ink,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "900" },
});
