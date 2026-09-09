import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { createConsumption, getPendingItems, getTodayItems, getTotals } from "../domain/consumptions";
import {
  loadConsumptions,
  loadDeletedClientIds,
  saveConsumptions,
  saveDeletedClientIds,
} from "../services/consumptionStorage";
import { deleteConsumption, syncConsumptions } from "../services/syncConsumptions";

export function useConsumptions() {
  const [items, setItems] = useState([]);
  const [deletedClientIds, setDeletedClientIds] = useState([]);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const persistItems = useCallback(async (nextItems) => {
    setItems(nextItems);
    await saveConsumptions(nextItems);
  }, []);

  useEffect(() => {
    Promise.all([loadConsumptions(), loadDeletedClientIds()]).then(
      ([storedItems, storedDeletedClientIds]) => {
        setItems(storedItems);
        setDeletedClientIds(storedDeletedClientIds);
      },
    );
    return NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));
  }, []);

  const pendingItems = useMemo(() => getPendingItems(items), [items]);
  const pendingCount = pendingItems.length + deletedClientIds.length;
  const todayItems = useMemo(() => getTodayItems(items), [items]);
  const totals = useMemo(() => getTotals(todayItems), [todayItems]);

  const addConsumption = useCallback(async (type, quantity) => {
    await persistItems([createConsumption(type, quantity), ...items]);
  }, [items, persistItems]);

  const removeConsumption = useCallback(async (clientId) => {
    const item = items.find((current) => current.clientId === clientId);
    if (!item) return;

    const nextItems = items.filter((current) => current.clientId !== clientId);
    const nextDeletedClientIds = item.pendingSync
      ? deletedClientIds
      : [...new Set([...deletedClientIds, clientId])];

    await persistItems(nextItems);
    setDeletedClientIds(nextDeletedClientIds);
    await saveDeletedClientIds(nextDeletedClientIds);
  }, [deletedClientIds, items, persistItems]);

  const syncItems = useCallback(async () => {
    if (!online || (pendingItems.length === 0 && deletedClientIds.length === 0)) return;

    setSyncing(true);
    try {
      await syncConsumptions(pendingItems);
      for (const clientId of deletedClientIds) {
        await deleteConsumption(clientId);
      }
      await persistItems(items.map((item) => ({ ...item, pendingSync: false })));
      setDeletedClientIds([]);
      await saveDeletedClientIds([]);
    } catch {
      Alert.alert(
        "Ainda sem conexão",
        "Seus registros continuam salvos neste aparelho.",
      );
    } finally {
      setSyncing(false);
    }
  }, [deletedClientIds, items, online, pendingItems, persistItems]);

  useEffect(() => {
    if (online) syncItems();
  }, [online, syncItems]);

  return {
    items,
    online,
    syncing,
    pendingItems,
    pendingCount,
    todayItems,
    totals,
    addConsumption,
    removeConsumption,
    syncItems,
  };
}
