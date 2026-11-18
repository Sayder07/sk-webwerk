import { shopConfig, type Extra, type TreeShape, type TreeSize, type Zone } from '../config/shop.config.ts';

export type Selection = { treeId: string; shapeId: string; extras: string[] };

export type LineItem = { kind: 'tree' | 'extra' | 'delivery'; id: string; label: string; amount: number };

export function findTree(id: string): TreeSize | undefined {
  return shopConfig.trees.find((t) => t.id === id);
}
export function findShape(id: string): TreeShape | undefined {
  return shopConfig.shapes.find((s) => s.id === id);
}
export function findExtra(id: string): Extra | undefined {
  return shopConfig.extras.find((e) => e.id === id);
}
export function findZone(id: number): Zone | undefined {
  return shopConfig.zones.find((z) => z.id === id);
}

/** Prüft eine Auswahl und entfernt Unbekanntes/Doppeltes. Gibt null zurück, wenn Baum oder Form fehlen. */
export function normalizeSelection(input: unknown): Selection | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const tree = typeof raw.treeId === 'string' ? findTree(raw.treeId) : undefined;
  const shape = typeof raw.shapeId === 'string' ? findShape(raw.shapeId) : undefined;
  if (!tree || !shape) return null;
  const wanted = Array.isArray(raw.extras) ? raw.extras.filter((e): e is string => typeof e === 'string') : [];
  // Reihenfolge wie in der Konfiguration, jedes Extra höchstens einmal
  const extras = shopConfig.extras.filter((e) => wanted.includes(e.id)).map((e) => e.id);
  return { treeId: tree.id, shapeId: shape.id, extras };
}

/** Positionen und Summe. Lieferkosten kommen nur dazu, wenn eine Zone übergeben wird. */
export function priceSelection(selection: Selection, zoneId?: number | null): { items: LineItem[]; subtotal: number; deliveryFee: number; total: number } {
  const tree = findTree(selection.treeId);
  const shape = findShape(selection.shapeId);
  if (!tree || !shape) throw new Error('Unbekannter Baum oder unbekannte Form');

  const items: LineItem[] = [
    { kind: 'tree', id: tree.id, label: `Nordmanntanne ${tree.label}, Form ${shape.label.toLowerCase()}`, amount: tree.price },
  ];
  for (const id of selection.extras) {
    const extra = findExtra(id);
    if (extra) items.push({ kind: 'extra', id: extra.id, label: extra.label, amount: extra.price });
  }
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  let deliveryFee = 0;
  const zone = zoneId != null ? findZone(zoneId) : undefined;
  if (zone) {
    deliveryFee = zone.fee;
    items.push({ kind: 'delivery', id: `zone-${zone.id}`, label: `Lieferung ${zone.name} (${zone.area})`, amount: zone.fee });
  }
  return { items, subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export function lowestDeliveryFee(): number {
  return Math.min(...shopConfig.zones.map((z) => z.fee));
}
