import AsyncStorage from "@react-native-async-storage/async-storage";
import { DELETED_STORAGE_KEY, STORAGE_KEY } from "../config/appConfig";

export async function loadConsumptions() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveConsumptions(items) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function loadDeletedClientIds() {
  const stored = await AsyncStorage.getItem(DELETED_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveDeletedClientIds(clientIds) {
  await AsyncStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(clientIds));
}
