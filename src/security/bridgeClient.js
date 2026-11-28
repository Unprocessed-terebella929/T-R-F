const BRIDGE_URL = '/api/store-bridge';
const SYNC_TIMEOUT_MS = 5000;

export async function pullPublishedState() {
  try {
    const resp = await fetch(BRIDGE_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(SYNC_TIMEOUT_MS)
    });
    if (!resp.ok) {
      return null;
    }
    const data = await resp.json();
    if (!data?.synced || !data?.payload) {
      return null;
    }
    return data.payload;
  } catch {
    return null;
  }
}

export async function pushClientEvent(type, item) {
  try {
    await fetch(`${BRIDGE_URL}?action=client-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'client-event', type, item }),
      signal: AbortSignal.timeout(SYNC_TIMEOUT_MS)
    });
  } catch {
    // Mode local autonome : les données restent dans localStorage
  }
}
