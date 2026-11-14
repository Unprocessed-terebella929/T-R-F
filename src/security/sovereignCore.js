export const SECURITY_LIMITS = {
  MAX_INPUT_LENGTH: 180,
  MAX_ITEM_PRICE: 10000,
  MAX_ITEM_QTY: 20,
  ADMIN_UNLOCK_CLICKS: 3,
  MAX_AUTH_ATTEMPTS: 5,
  ORDER_ID_MIN: 1000,
  ORDER_ID_RANGE: 9000,
  ADMIN_KEY_DIGEST: 'SIG-282B19F6',
  CART_STORAGE_KEY: 'taref_guest_cart_v3'
};

export function sanitizeInput(raw) {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw
    .replace(/[<>'"`\\;]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, SECURITY_LIMITS.MAX_INPUT_LENGTH);
}

function isValidCartItem(item) {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const hasStrings =
    typeof item.id === 'string' && typeof item.name === 'string';
  const hasPrice =
    typeof item.price === 'number' &&
    item.price > 0 &&
    item.price < SECURITY_LIMITS.MAX_ITEM_PRICE;
  const hasQty =
    typeof item.qty === 'number' &&
    item.qty >= 1 &&
    item.qty <= SECURITY_LIMITS.MAX_ITEM_QTY;
  return hasStrings && hasPrice && hasQty;
}

function validateOrderSchema(items) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(isValidCartItem);
}

export function generateIntegrityToken(seedText) {
  let hash = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `SIG-${hex}`;
}

export function verifyAccessDigest(candidate) {
  const clean = typeof candidate === 'string' ? candidate.trim() : '';
  if (!clean) {
    return false;
  }
  const digest = generateIntegrityToken(`AUTH-${clean}-TAREF`);
  return digest === SECURITY_LIMITS.ADMIN_KEY_DIGEST;
}

export function loadGuestCart(onError) {
  try {
    const raw = localStorage.getItem(SECURITY_LIMITS.CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return validateOrderSchema(JSON.parse(raw));
  } catch (error) {
    localStorage.removeItem(SECURITY_LIMITS.CART_STORAGE_KEY);
    if (onError && error) {
      onError('Panier réinitialisé par sécurité.');
    }
    return [];
  }
}

export function saveGuestCart(cart, onError) {
  try {
    localStorage.setItem(
      SECURITY_LIMITS.CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    if (onError && error) {
      onError('Stockage local restreint.');
    }
  }
}
