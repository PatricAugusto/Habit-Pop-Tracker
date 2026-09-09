import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../config/appConfig";

const consumptionCards = [
  { type: "beer", label: "Cerveja", icon: "●", accent: colors.yellow, artLabel: "PAUSA GELADA" },
  { type: "cigarette", label: "Cigarro", icon: "▰", accent: colors.coral, artLabel: "MOMENTO" },
];

export function ConsumptionCarousel({ onAdd }) {
  const [quantities, setQuantities] = useState({ beer: 1, cigarette: 1 });

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
          <View key={card.type} style={styles.recordCard}>
            <View style={[styles.recordArt, { backgroundColor: card.accent }]}>
              <Text style={styles.recordIcon}>{card.icon}</Text>
              <Text style={styles.recordArtLabel}>{card.artLabel}</Text>
            </View>
            <Text style={styles.recordTitle}>{card.label}</Text>
            <Text style={styles.recordDescription}>Quantas unidades agora?</Text>
            <View style={styles.quantityRow}>
              <Text style={styles.quantityText}>{quantities[card.type]} unidade(s)</Text>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityLabel={`Diminuir ${card.label}`}
                  style={styles.stepButton}
                  onPress={() => updateQuantity(card.type, -1)}
                >
                  <Text style={styles.stepText}>−</Text>
                </Pressable>
                <Text style={styles.quantityNumber}>{quantities[card.type]}</Text>
                <Pressable
                  accessibilityLabel={`Aumentar ${card.label}`}
                  style={[styles.stepButton, styles.plus]}
                  onPress={() => updateQuantity(card.type, 1)}
                >
                  <Text style={styles.lightText}>+</Text>
                </Pressable>
              </View>
            </View>
            <Pressable style={styles.primaryButton} onPress={() => handleAdd(card.type)}>
              <Text style={styles.primaryText}>Adicionar {card.label}</Text>
            </Pressable>
          </View>
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
