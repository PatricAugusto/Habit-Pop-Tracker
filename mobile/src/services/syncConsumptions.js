import { API_URL } from "../config/appConfig";

const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncConsumptions(items) {
  const response = await fetchWithTimeout(`${API_URL}/api/v1/sync`, {
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
  const response = await fetchWithTimeout(
    `${API_URL}/api/v1/consumptions/${encodeURIComponent(clientId)}`,
    { method: "DELETE" },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error("delete failed");
  }
}
