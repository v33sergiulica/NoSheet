export interface HeaderGroup {
  id: string;
  title: string; // e.g. "P1", "P2"
  colSpan: number; // e.g. 2 columns for a (2 1) pair
}

export interface ColumnConfig {
  id: string;
  label: string;
  widthRatio: number;
  groupId?: string;
}

export interface TableRow {
  id: string;
  roundLabel: string;
  cells: Record<string, string>;
}

export type RowIndexingType = 'numbered' | 'circular' | 'none';

export interface SimpleTableConfig {
  id: string;
  title: string;
  hasRoundColumn: boolean; // true if rowIndexingType !== 'none'
  rowIndexingType: RowIndexingType; // 'numbered' | 'circular' | 'none'
  roundColumnName: string;
  roundPrefix?: string; // for 'numbered' (e.g. "Round ", "R", "")
  circularItems?: string[]; // for 'circular' (e.g. ["P1", "P2", "P3"])
  headerGroups?: HeaderGroup[];
  columns: ColumnConfig[];
  rows: TableRow[];
  createdAt: number;
  lastModified: number;
}
