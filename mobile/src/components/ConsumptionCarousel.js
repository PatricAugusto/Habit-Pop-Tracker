import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, CONSUMPTION_TYPES, consumptionMeta } from "../config/appConfig";

const consumptionCards = CONSUMPTION_TYPES.map((type) => ({ type, ...consumptionMeta[type] }));

export function ConsumptionCard({ card, quantity, onDecrease, onIncrease, onAdd, fullWidth = false }) {
  return (
    <View style={[styles.recordCard, fullWidth && styles.fullWidthCard]}>
      <View style={[styles.recordArt, { backgroundColor: card.accent }]}>
        <Text style={styles.recordIcon}>{card.icon}</Text>
        <Text style={styles.recordArtLabel}>{card.artLabel}</Text>
      </View>
      <Text style={styles.recordTitle}>{card.label}</Text>
      <Text style={styles.recordDescription}>Quantas unidades agora?</Text>
      <View style={styles.quantityRow}>
        <Text style={styles.quantityText}>{quantity} unidade(s)</Text>
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
  registerHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  swipeHint: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  carousel: { marginHorizontal: -22 },
  carouselContent: { gap: 14, paddingHorizontal: 22 },
  recordCard: { width: 290, backgroundColor: "white", borderColor: colors.ink, borderWidth: 2, borderRadius: 24, padding: 16, gap: 15 },
  fullWidthCard: { width: "100%" },
  recordArt: { height: 116, borderRadius: 16, padding: 14, justifyContent: "space-between" },
  recordIcon: { color: colors.ink, fontSize: 58, lineHeight: 62 },
  recordArtLabel: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  recordTitle: { color: colors.ink, fontSize: 25, fontWeight: "900" },
  recordDescription: { color: colors.muted, fontSize: 13, marginTop: -8 },
  quantityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quantityText: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.paper, borderColor: colors.ink, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  plus: { backgroundColor: colors.coral, borderWidth: 0 },
  stepText: { color: colors.ink, fontSize: 23 },
  quantityNumber: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  lightText: { color: "white" },
  primaryButton: { backgroundColor: colors.ink, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "white", fontSize: 16, fontWeight: "900" },
});
