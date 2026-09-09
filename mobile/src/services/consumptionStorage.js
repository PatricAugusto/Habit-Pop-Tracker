import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "../config/appConfig";

export async function loadConsumptions() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveConsumptions(items) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
