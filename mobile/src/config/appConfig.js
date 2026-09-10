export const STORAGE_KEY = "@habit-pop-tracker/consumptions";
export const DELETED_STORAGE_KEY = "@habit-pop-tracker/deleted-consumptions";
export const API_URL = "http://192.168.1.10:3000";

export const CONSUMPTION_TYPES = ["beer", "cigarette", "water", "coffee"];

export const consumptionMeta = {
  beer: {
    label: "Cerveja",
    icon: "●",
    accent: "#FFD84D",
    artLabel: "PAUSA GELADA",
  },
  cigarette: {
    label: "Cigarro",
    icon: "▰",
    accent: "#F26A5B",
    artLabel: "MOMENTO",
  },
  water: {
    label: "Água",
    icon: "◒",
    accent: "#8ED8E8",
    artLabel: "PAUSA LEVE",
  },
  coffee: { label: "Café", icon: "◉", accent: "#C99568", artLabel: "ENERGIA" },
};

export const colors = {
  ink: "#20242A",
  paper: "#FFF8EE",
  yellow: "#FFD84D",
  coral: "#F26A5B",
  teal: "#4CB9A5",
  blue: "#5D75D6",
  muted: "#6B6F76",
};
