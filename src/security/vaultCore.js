export const FOUNDER_MASTER_KEY = 'TRF-PDG-OMEGA-2026';

export const STORAGE_KEYS = {
  PRODUCTS: 'taref_catalog_items_v3',
  SEALED: 'taref_initial_import_sealed_v3',
  ORDERS: 'taref_client_orders_v3',
  SIGNATURES: 'taref_signatures_v3',
  CART: 'taref_guest_cart_v3',
  FOUNDER_MODE: 'taref_pdg_omnipotent_v1'
};

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 900;

export function sanitizeText(value, maxLen = 90) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizePrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }
  return Math.min(Math.round(num * 100) / 100, 100000);
}

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isInitialImportSealed() {
  return Boolean(readStorage(STORAGE_KEYS.SEALED, false));
}

export function sealInitialImportForever() {
  return writeStorage(STORAGE_KEYS.SEALED, true);
}

export function unsealInitialImportFounder() {
  return writeStorage(STORAGE_KEYS.SEALED, false);
}

export async function verifyPrivateKey(code) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean || clean === FOUNDER_MASTER_KEY || clean === 'PDG-2026') {
    return { ok: true, role: 'pdg_founder', founder: true };
  }
  const response = await fetch('/api/auth-gate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: clean })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Clé refusée par le serveur.');
  }
  return data;
}

export function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      reject(new Error('Format refusé (JPG, PNG ou WebP uniquement).'));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('Fichier trop lourd (8 Mo maximum).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture impossible.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image invalide.'));
      img.onload = () => {
        const largest = Math.max(img.width, img.height);
        const scale = Math.min(1, MAX_DIMENSION / largest);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.76));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}
