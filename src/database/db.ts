import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from "uuid";
import { Vistoria } from '@/types/vistoria';
import { normalizePlate } from '@/lib/plate';

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
  // NÃO incrementa aqui - apenas retorna qual seria o próximo
  return String(nextNumber).padStart(6, '0');
}

export async function incrementVistoriaNumber(): Promise<void> {
  const database = await getDB();
  const config = await database.get('config', 'lastNumber');
  const lastNumber = config?.value as number || 0;
  const nextNumber = lastNumber + 1;
  // Incrementa APENAS quando salva de verdade
  await database.put('config', { key: 'lastNumber', value: nextNumber });
}

export async function saveVistoria(vistoria: Vistoria): Promise<void> {
  const database = await getDB();
  // ensure id exists so record is stored/retrievable reliably
  if (!vistoria.id) vistoria.id = uuidv4();
  vistoria.atualizadoEm = new Date().toISOString();
  // normaliza a placa antes de salvar (novo formato LLLNLNN)
  vistoria.placa = normalizePlate(vistoria.placa || '');
  await database.put('vistorias', vistoria);
  // Incrementa o número APÓS salvar com sucesso
  await incrementVistoriaNumber();
}

export async function getVistoria(id: string): Promise<Vistoria | undefined> {
  const database = await getDB();
  return database.get('vistorias', id);
}

export async function getAllVistorias(): Promise<Vistoria[]> {
  const database = await getDB();
  const vistorias = await database.getAllFromIndex('vistorias', 'by-date');
  
  // Deletar vistorias com mais de 30 dias
  const agora = new Date();
  const trintaDiasAtrás = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  for (const vistoria of vistorias) {
    const dataCriacao = new Date(vistoria.criadoEm);
    if (dataCriacao < trintaDiasAtrás) {
      await database.delete('vistorias', vistoria.id);
    }
  }
  
  // Retornar apenas as não deletadas
  const vistoriasAtualizadas = await database.getAllFromIndex('vistorias', 'by-date');
  return vistoriasAtualizadas.reverse(); // Most recent first
}

export async function deleteVistoria(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('vistorias', id);
}

export async function cleanupOldVistorias(): Promise<number> {
  const database = await getDB();
  const vistorias = await database.getAllFromIndex('vistorias', 'by-date');
  
  const agora = new Date();
  const trintaDiasAtrás = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let deletedCount = 0;
  for (const vistoria of vistorias) {
    const dataCriacao = new Date(vistoria.criadoEm);
    if (dataCriacao < trintaDiasAtrás) {
      await database.delete('vistorias', vistoria.id);
      deletedCount++;
    }
  }
  
  return deletedCount;
}

export async function searchVistorias(query: string): Promise<Vistoria[]> {
  const all = await getAllVistorias();
  const lowerQuery = query.toLowerCase();
  const normalizedQuery = normalizePlate(query);
  return all.filter(
    (v) =>
      (v.placa && normalizePlate(v.placa).includes(normalizedQuery)) ||
      v.numero.includes(query) ||
      v.segurado.toLowerCase().includes(lowerQuery)
  );
}
