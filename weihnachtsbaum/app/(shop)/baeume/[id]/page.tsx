import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { shopConfig } from '@/config/shop.config';
import { Configurator } from '@/components/Configurator';
import { findTree } from '@/lib/pricing';

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return shopConfig.trees.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tree = findTree((await params).id);
  return { title: tree ? `Nordmanntanne ${tree.label} konfigurieren` : 'Baum konfigurieren' };
}

export default async function TreePage({ params }: Props) {
  const tree = findTree((await params).id);
  if (!tree) notFound();
  return <Configurator initialTreeId={tree.id} />;
}
