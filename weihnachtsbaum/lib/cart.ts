'use client';
import { useEffect, useState } from 'react';
import type { Selection } from './pricing.ts';

/** Auswahl des Kunden – liegt nur im Browser (localStorage), bis die Bestellung abgeschickt wird. */
export type Cart = {
  selection?: Selection;
  plz?: string;
  ort?: string;
  zoneId?: number;
  date?: string;
  slotId?: string;
};

const KEY = 'wb26-auswahl';

export function loadCart(): Cart {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Cart;
  } catch {
    return {};
  }
}

export function saveCart(cart: Cart): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    // privater Modus o. Ä. – dann eben ohne Zwischenspeichern
  }
}

export function clearCart(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

/** Lädt die Auswahl nach dem ersten Rendern. `ready` ist false, solange noch nichts gelesen wurde. */
export function useCart(): { cart: Cart; ready: boolean; update: (patch: Cart) => void } {
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setCart(loadCart());
    setReady(true);
  }, []);
  const update = (patch: Cart) => {
    setCart((prev) => {
      const next = { ...prev, ...patch };
      saveCart(next);
      return next;
    });
  };
  return { cart, ready, update };
}
