export function makeClientId() {
  return `mobile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createConsumption(type, quantity) {
  return {
    clientId: makeClientId(),
    type,
    quantity,
    occurredAt: new Date().toISOString(),
    pendingSync: true,
  };
}

export function getTodayItems(items, today = new Date()) {
  return items.filter(
    (item) => new Date(item.occurredAt).toDateString() === today.toDateString(),
  );
}

export function getTotals(items) {
  return items.reduce(
    (result, item) => ({
      ...result,
      [item.type]: result[item.type] + item.quantity,
    }),
    { beer: 0, cigarette: 0 },
  );
}

export function getPendingItems(items) {
  return items.filter((item) => item.pendingSync);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
