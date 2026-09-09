import { API_URL } from "../config/appConfig";

export async function syncConsumptions(items) {
  const response = await fetch(`${API_URL}/api/v1/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumptions: items }),
  });

  if (!response.ok) {
    throw new Error("sync failed");
  }

  return response.json();
}

export async function deleteConsumption(clientId) {
  const response = await fetch(
    `${API_URL}/api/v1/consumptions/${encodeURIComponent(clientId)}`,
    { method: "DELETE" },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error("delete failed");
  }
}
