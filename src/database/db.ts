import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Vistoria } from '@/types/vistoria';

interface VistoriaDB extends DBSchema {
  vistorias: {
    key: string;
    value: Vistoria;
    indexes: { 'by-date': string; 'by-numero': string };
  };
  config: {
    key: string;
    value: { key: string; value: string | number };
  };
}

let db: IDBPDatabase<VistoriaDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<VistoriaDB>> {
  if (db) return db;

  db = await openDB<VistoriaDB>('vistoria-app', 1, {
    upgrade(database) {
      // Store for vistorias
      const vistoriaStore = database.createObjectStore('vistorias', {
        keyPath: 'id',
      });
      vistoriaStore.createIndex('by-date', 'criadoEm');
      vistoriaStore.createIndex('by-numero', 'numero');

      // Store for config
      database.createObjectStore('config', {
        keyPath: 'key',
      });
    },
  });

  return db;
}

export async function getNextVistoriaNumber(): Promise<string> {
  const database = await getDB();
  const config = await database.get('config', 'lastNumber');
  const lastNumber = config?.value as number || 0;
  const nextNumber = lastNumber + 1;
  await database.put('config', { key: 'lastNumber', value: nextNumber });
  return String(nextNumber).padStart(6, '0');
}

export async function saveVistoria(vistoria: Vistoria): Promise<void> {
  const database = await getDB();
  vistoria.atualizadoEm = new Date().toISOString();
  await database.put('vistorias', vistoria);
}

export async function getVistoria(id: string): Promise<Vistoria | undefined> {
  const database = await getDB();
  return database.get('vistorias', id);
}

export async function getAllVistorias(): Promise<Vistoria[]> {
  const database = await getDB();
  const vistorias = await database.getAllFromIndex('vistorias', 'by-date');
  return vistorias.reverse(); // Most recent first
}

export async function deleteVistoria(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('vistorias', id);
}

export async function searchVistorias(query: string): Promise<Vistoria[]> {
  const all = await getAllVistorias();
  const lowerQuery = query.toLowerCase();
  return all.filter(
    (v) =>
      v.placa.toLowerCase().includes(lowerQuery) ||
      v.numero.includes(lowerQuery) ||
      v.segurado.toLowerCase().includes(lowerQuery)
  );
}
