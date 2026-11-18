import { shopConfig } from '../config/shop.config.ts';
import type { Order } from './orders.ts';
import { findExtra, findShape, findTree } from './pricing.ts';

export const treeLabel = (o: Order) => findTree(o.treeId)?.label ?? o.treeId;
export const shapeLabel = (o: Order) => findShape(o.shapeId)?.label ?? o.shapeId;
export const extrasLabel = (o: Order) => o.extras.map((id) => findExtra(id)?.label ?? id).join(', ') || '–';
export const zoneName = (id: number) => shopConfig.zones.find((z) => z.id === id)?.name ?? `Zone ${id}`;
