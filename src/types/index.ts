export interface HeaderGroup {
  id: string;
  title: string;
  colSpan: number;
}

export interface ColumnConfig {
  id: string;
  label: string;
  subLabel?: string;
  widthRatio: number;
  groupId?: string;
}

export interface TableRow {
  id: string;
  roundLabel: string;
  cells: Record<string, string>;
  crossedCells?: Record<string, boolean>; // columnId -> true if crossed off
}

export type RowIndexingType = 'numbered' | 'circular' | 'none';

export interface SimpleTableConfig {
  id: string;
  title: string;
  hasRoundColumn: boolean;
  rowIndexingType: RowIndexingType;
  roundColumnName: string;
  roundPrefix?: string;
  circularItems?: string[];
  headerGroups?: HeaderGroup[];
  columns: ColumnConfig[];
  rows: TableRow[];
  drawingData?: string; // canvas drawing data URL
  createdAt: number;
  lastModified: number;
}
