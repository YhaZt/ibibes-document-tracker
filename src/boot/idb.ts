// src/boot/idb.ts
import { get, set, del } from 'idb-keyval';

export async function idbGet<T = unknown>(key: string): Promise<T | null> {
  try {
    return (await get(key)) as T | null;
  } catch (e) {
    console.error('IndexedDB get error:', e);
    return null;
  }
}

export async function idbSet<T = unknown>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
  } catch (e) {
    console.error('IndexedDB set error:', e);
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    await del(key);
  } catch (e) {
    console.error('IndexedDB remove error:', e);
  }
}
