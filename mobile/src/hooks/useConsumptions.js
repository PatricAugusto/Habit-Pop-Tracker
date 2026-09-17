import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  createConsumption,
  getPendingItems,
  getTodayItems,
  getTotals,
} from "../domain/consumptions";
import {
  loadConsumptions,
  loadDeletedClientIds,
  saveConsumptions,
  saveDeletedClientIds,
} from "../services/consumptionStorage";
import {
  deleteConsumption,
  syncConsumptions,
} from "../services/syncConsumptions";

export function useConsumptions() {
  const [items, setItems] = useState([]);
  const [deletedClientIds, setDeletedClientIds] = useState([]);
  const [online, setOnline] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const persistItems = useCallback(async (nextItems) => {
    setItems(nextItems);
    await saveConsumptions(nextItems);
  }, []);

  useEffect(() => {
    let mounted = true;

    Promise.all([loadConsumptions(), loadDeletedClientIds()]).then(
      ([storedItems, storedDeletedClientIds]) => {
        if (!mounted) return;
        setItems(storedItems);
        setDeletedClientIds(storedDeletedClientIds);
        setHydrated(true);
      },
    );

    NetInfo.fetch().then((state) => {
      if (mounted) setOnline(Boolean(state.isConnected));
    });
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (mounted) setOnline(Boolean(state.isConnected));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const pendingItems = useMemo(() => getPendingItems(items), [items]);
  const pendingCount = pendingItems.length + deletedClientIds.length;
  const todayItems = useMemo(() => getTodayItems(items), [items]);
  const totals = useMemo(() => getTotals(todayItems), [todayItems]);

  const addConsumption = useCallback(
    async (type, quantity) => {
      await persistItems([createConsumption(type, quantity), ...items]);
    },
    [items, persistItems],
  );

  const removeConsumption = useCallback(
    async (clientId) => {
      const item = items.find((current) => current.clientId === clientId);
      if (!item) return;

      const nextItems = items.filter(
        (current) => current.clientId !== clientId,
      );
      const nextDeletedClientIds = item.pendingSync
        ? deletedClientIds
        : [...new Set([...deletedClientIds, clientId])];

      await persistItems(nextItems);
      setDeletedClientIds(nextDeletedClientIds);
      await saveDeletedClientIds(nextDeletedClientIds);
    },
    [deletedClientIds, items, persistItems],
  );

  const syncItems = useCallback(async () => {
    if (
      syncingRef.current ||
      !hydrated ||
      !online ||
      (pendingItems.length === 0 && deletedClientIds.length === 0)
    )
      return;

    syncingRef.current = true;
    setSyncing(true);
    const itemsToSync = pendingItems;
    const deletedIdsToSync = deletedClientIds;
    try {
      await syncConsumptions(itemsToSync);
      for (const clientId of deletedIdsToSync) {
        await deleteConsumption(clientId);
      }
      const syncedIds = new Set(itemsToSync.map((item) => item.clientId));
      const nextItems = items.map((item) =>
        syncedIds.has(item.clientId) ? { ...item, pendingSync: false } : item,
      );
      await persistItems(nextItems);
      const remainingDeletedClientIds = deletedClientIds.filter(
        (clientId) => !deletedIdsToSync.includes(clientId),
      );
      setDeletedClientIds(remainingDeletedClientIds);
      await saveDeletedClientIds(remainingDeletedClientIds);
    } catch {
      Alert.alert(
        "Ainda sem conexão",
        "Seus registros continuam salvos neste aparelho.",
      );
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [deletedClientIds, hydrated, items, online, pendingItems, persistItems]);

  useEffect(() => {
    if (online && hydrated && !syncing) syncItems();
  }, [hydrated, online, syncing, syncItems]);

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
