import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { createConsumption, getPendingItems, getTodayItems, getTotals } from "../domain/consumptions";
import { loadConsumptions, saveConsumptions } from "../services/consumptionStorage";
import { syncConsumptions } from "../services/syncConsumptions";

export function useConsumptions() {
  const [items, setItems] = useState([]);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const persistItems = useCallback(async (nextItems) => {
    setItems(nextItems);
    await saveConsumptions(nextItems);
  }, []);

  useEffect(() => {
    loadConsumptions().then(setItems);
    return NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));
  }, []);

  const pendingItems = useMemo(() => getPendingItems(items), [items]);
  const todayItems = useMemo(() => getTodayItems(items), [items]);
  const totals = useMemo(() => getTotals(todayItems), [todayItems]);

  const addConsumption = useCallback(async (type, quantity) => {
    await persistItems([createConsumption(type, quantity), ...items]);
  }, [items, persistItems]);

  const syncItems = useCallback(async () => {
    if (!online || pendingItems.length === 0) return;

    setSyncing(true);
    try {
      await syncConsumptions(pendingItems);
      await persistItems(items.map((item) => ({ ...item, pendingSync: false })));
    } catch {
      Alert.alert(
        "Ainda sem conexão",
        "Seus registros continuam salvos neste aparelho.",
      );
    } finally {
      setSyncing(false);
    }
  }, [items, online, pendingItems, persistItems]);

  useEffect(() => {
    if (online) syncItems();
  }, [online, syncItems]);

  return {
    items,
    online,
    syncing,
    pendingItems,
    todayItems,
    totals,
    addConsumption,
    syncItems,
  };
}
