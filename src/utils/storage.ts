import type { SimpleTableConfig } from '../types';

const ACTIVE_TABLE_KEY = 'table_generator_active_table';
const SAVED_TABLES_KEY = 'table_generator_saved_tables';
const CRASH_BACKUP_KEY = 'table_generator_crash_backup';

export function saveActiveTable(table: SimpleTableConfig | null) {
  try {
    if (table) {
      const updated = { ...table, lastModified: Date.now() };
      const serialized = JSON.stringify(updated);
      localStorage.setItem(ACTIVE_TABLE_KEY, serialized);
      localStorage.setItem(CRASH_BACKUP_KEY, serialized);
    } else {
      localStorage.removeItem(ACTIVE_TABLE_KEY);
      localStorage.removeItem(CRASH_BACKUP_KEY);
    }
  } catch (e) {
    console.error('Failed to save active table', e);
  }
}

export function loadActiveTable(): SimpleTableConfig | null {
  try {
    const data = localStorage.getItem(ACTIVE_TABLE_KEY) || localStorage.getItem(CRASH_BACKUP_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // Backwards compatibility migration
    if (!parsed.rowIndexingType) {
      parsed.rowIndexingType = parsed.hasRoundColumn ? 'numbered' : 'none';
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load active table', e);
    return null;
  }
}

export function getSavedTables(): SimpleTableConfig[] {
  try {
    const data = localStorage.getItem(SAVED_TABLES_KEY);
    if (!data) return [];
    const list: SimpleTableConfig[] = JSON.parse(data);
    return list.map((table) => {
      if (!table.rowIndexingType) {
        table.rowIndexingType = table.hasRoundColumn ? 'numbered' : 'none';
      }
      return table;
    });
  } catch {
    return [];
  }
}

export function saveTableToHistory(table: SimpleTableConfig) {
  try {
    const existing = getSavedTables();
    const updatedTable = { ...table, lastModified: Date.now() };
    const filtered = existing.filter((t: SimpleTableConfig) => t.id !== table.id);
    const updated = [updatedTable, ...filtered].slice(0, 30);
    localStorage.setItem(SAVED_TABLES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to history', e);
  }
}

export function deleteTableFromHistory(tableId: string): SimpleTableConfig[] {
  try {
    const existing = getSavedTables();
    const updated = existing.filter((t) => t.id !== tableId);
    localStorage.setItem(SAVED_TABLES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete from history', e);
    return [];
  }
}
