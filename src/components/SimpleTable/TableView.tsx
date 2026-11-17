import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Share2, 
  Sliders,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { SimpleTableConfig, TableRow, ColumnConfig } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { saveActiveTable } from '../../utils/storage';

interface TableViewProps {
  table: SimpleTableConfig;
  onUpdateTable: (updated: SimpleTableConfig) => void;
  onBackToMenu: () => void;
  onEditConfig: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  table,
  onUpdateTable,
  onBackToMenu,
  onEditConfig,
  isDark,
  onToggleTheme,
}) => {
  const [showCopiedToast, setShowCopiedToast] = React.useState<boolean>(false);

  // Column width sizing mode: 'fit' (fits to name/compact) vs 'stretch' (fills 100% screen)
  const [isFitContent, setIsFitContent] = useState<boolean>(() => {
    const saved = localStorage.getItem('table_width_mode');
    return saved ? saved === 'fit' : true; // Default to 'fit' so laptop isn't giant and mobile isn't crushed
  });

  const toggleWidthMode = () => {
    setIsFitContent((prev) => {
      const next = !prev;
      localStorage.setItem('table_width_mode', next ? 'fit' : 'stretch');
      return next;
    });
  };

  // Crash protection: ensure table is saved on unload or app backgrounding
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveActiveTable(table);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [table]);

  // Compute total width ratio
  const totalRatio = useMemo(() => {
    return table.columns.reduce((sum, c) => sum + c.widthRatio, 0);
  }, [table.columns]);

  // Calculate natural, comfortable column widths based on label lengths and ratios
  const columnWidths = useMemo(() => {
    return table.columns.map((col) => {
      const isNarrow = col.widthRatio === 1;
      // Estimate width needed for column label / content
      const labelChars = col.label ? col.label.length : 4;
      const textWidthNeeded = labelChars * 9 + 20;

      if (isFitContent) {
        // Compact / Fit to name mode:
        // Narrow (1x) box: 48px to 64px (comfortable for 2-3 digits/letters, never crushed)
        // Wider boxes: scales with ratio and label length
        if (isNarrow) {
          return Math.max(48, Math.min(68, textWidthNeeded));
        }
        return Math.max(col.widthRatio * 44, textWidthNeeded);
      } else {
        // Stretch mode percentage
        return (col.widthRatio / totalRatio) * 100;
      }
    });
  }, [table.columns, isFitContent, totalRatio]);

  // Compact round column width (reduced from 68px to 42px)
  const roundColWidth = 42;
  const deleteBtnWidth = 34;

  // Calculate minimum total table width
  const totalTableWidth = useMemo(() => {
    const roundW = table.hasRoundColumn ? roundColWidth : 0;
    if (isFitContent) {
      const dataWidth = columnWidths.reduce((sum, w) => sum + (typeof w === 'number' ? w : 60), 0);
      return roundW + dataWidth + deleteBtnWidth;
    } else {
      const minDataW = totalRatio * 44;
      return roundW + minDataW + deleteBtnWidth;
    }
  }, [table.hasRoundColumn, isFitContent, columnWidths, totalRatio]);

  // Instant Crash-Proof Cell Update
  const handleCellChange = (rowId: string, colId: string, value: string) => {
    const updatedRows = table.rows.map((row: TableRow) => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [colId]: value,
          },
        };
      }
      return row;
    });

    const updatedTable: SimpleTableConfig = {
      ...table,
      rows: updatedRows,
      lastModified: Date.now(),
    };

    onUpdateTable(updatedTable);
    saveActiveTable(updatedTable);
  };

  // Add row supporting both Numbered rounds and Circular list indexing
  const handleAddRow = () => {
    const newIndex = table.rows.length + 1;
    let newLabel = `${newIndex}`;

    if (table.rowIndexingType === 'circular') {
      const items = table.circularItems && table.circularItems.length > 0 ? table.circularItems : ['P1'];
      newLabel = items[(newIndex - 1) % items.length];
    } else if (table.rowIndexingType === 'numbered') {
      const prefix = table.roundPrefix !== undefined ? table.roundPrefix : 'Round ';
      newLabel = `${prefix}${newIndex}`;
    }

    const cells: Record<string, string> = {};
    table.columns.forEach((col: ColumnConfig) => {
      cells[col.id] = '';
    });

    const newRow: TableRow = {
      id: `row-${Date.now()}-${newIndex}`,
      roundLabel: newLabel,
      cells,
    };

    const updatedTable: SimpleTableConfig = {
      ...table,
      rows: [...table.rows, newRow],
      lastModified: Date.now(),
    };

    onUpdateTable(updatedTable);
    saveActiveTable(updatedTable);
  };

  const handleDeleteRow = (rowId: string) => {
    if (table.rows.length <= 1) return;
    const updatedTable: SimpleTableConfig = {
      ...table,
      rows: table.rows.filter((r: TableRow) => r.id !== rowId),
      lastModified: Date.now(),
    };
    onUpdateTable(updatedTable);
    saveActiveTable(updatedTable);
  };

  const handleResetScores = () => {
    if (!window.confirm('Clear all scores? Table structure will remain.')) return;
    const clearedRows = table.rows.map((r: TableRow) => {
      const cells: Record<string, string> = {};
      table.columns.forEach((col: ColumnConfig) => {
        cells[col.id] = '';
      });
      return { ...r, cells };
    });

    const updatedTable: SimpleTableConfig = {
      ...table,
      rows: clearedRows,
      lastModified: Date.now(),
    };

    onUpdateTable(updatedTable);
    saveActiveTable(updatedTable);
  };

  const handleShareSummary = () => {
    const lines = [`${table.title}`, ''];
    table.rows.forEach((row, idx) => {
      let label = row.roundLabel;
      if (!label) {
        label = `R${idx + 1}`;
      }
      const rowValues = table.columns.map((c) => row.cells[c.id] || '-').join(' | ');
      lines.push(`${label}: ${rowValues}`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col">
      {/* Top Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-paper)] px-3 py-2 sm:px-6 sm:py-2.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToMenu}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
              title="Menu"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight font-serif truncate max-w-[130px] sm:max-w-xs">
                {table.title}
              </h1>
              <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                {table.rows.length} rounds • {table.columns.map((c: ColumnConfig) => c.widthRatio).join(' ')}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Box Size Toggle: Fit to Content vs Stretch */}
            <button
              onClick={toggleWidthMode}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isFitContent
                  ? 'bg-[var(--accent-subtle-bg)] text-[var(--accent)] border-[var(--accent-subtle-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border-transparent'
              }`}
              title={isFitContent ? 'Switch to Full Screen Width' : 'Fit Box Size to Content / Names'}
            >
              {isFitContent ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span className="hidden md:inline">Fit Size</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span className="hidden md:inline">Stretch</span>
                </>
              )}
            </button>

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            <button
              onClick={handleShareSummary}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Scores"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">
                {showCopiedToast ? 'Copied' : 'Share'}
              </span>
            </button>

            <button
              onClick={handleResetScores}
              className="p-1.5 sm:p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
              title="Reset scores"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
            </button>

            <button
              onClick={onEditConfig}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Table settings"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 p-2 sm:p-6 max-w-7xl mx-auto w-full flex flex-col overflow-hidden">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] shadow-2xs flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table
              className="border-collapse text-left"
              style={{
                tableLayout: 'fixed',
                width: isFitContent ? `${totalTableWidth}px` : '100%',
                minWidth: isFitContent ? `${totalTableWidth}px` : `${totalTableWidth}px`,
              }}
            >
              {/* colgroup enforces exact column ratios and sizes */}
              <colgroup>
                {table.hasRoundColumn && (
                  <col style={{ width: `${roundColWidth}px` }} />
                )}
                {table.columns.map((col, idx) => {
                  const w = columnWidths[idx];
                  const colStyle = isFitContent
                    ? { width: `${w}px` }
                    : { width: `${w}%` };

                  return <col key={col.id} style={colStyle} />;
                })}
                <col style={{ width: `${deleteBtnWidth}px` }} />
              </colgroup>

              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-paper)] text-xs text-[var(--text-secondary)] font-serif">
                  {/* Smaller, compact round column header */}
                  {table.hasRoundColumn && (
                    <th
                      style={{ width: `${roundColWidth}px` }}
                      className="p-1 text-center font-bold text-[var(--text-muted)] border-r border-[var(--border-paper)] sticky left-0 bg-[var(--bg-surface)] z-10 text-[11px] truncate"
                    >
                      {table.roundColumnName || (table.rowIndexingType === 'circular' ? 'P' : '#')}
                    </th>
                  )}

                  {table.headerGroups && table.headerGroups.length > 0 ? (
                    table.headerGroups.map((group) => (
                      <th
                        key={group.id}
                        colSpan={group.colSpan}
                        className="p-2 text-center border-r border-[var(--border-paper)] last:border-r-0 font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate"
                      >
                        {group.title}
                      </th>
                    ))
                  ) : (
                    table.columns.map((col: ColumnConfig) => {
                      const isNarrow = col.widthRatio === 1;

                      return (
                        <th
                          key={col.id}
                          className={`p-1.5 sm:p-2 text-center border-r border-[var(--border-paper)] last:border-r-0 font-bold text-xs truncate ${
                            isNarrow ? 'text-[var(--accent-subtle-text)] bg-[var(--accent-subtle-bg)]/30' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {col.label}
                        </th>
                      );
                    })
                  )}

                  <th style={{ width: `${deleteBtnWidth}px` }}></th>
                </tr>
              </thead>

              {/* Table Data Rows */}
              <tbody className="divide-y divide-[var(--border-paper)] text-sm">
                {table.rows.map((row: TableRow, rIdx: number) => {
                  const prefix = table.roundPrefix !== undefined ? table.roundPrefix : 'Round ';
                  const displayRound = row.roundLabel || `${prefix}${rIdx + 1}`;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-[var(--bg-surface)]/40 transition-colors group"
                    >
                      {/* Smaller, compact round cell */}
                      {table.hasRoundColumn && (
                        <td
                          style={{ width: `${roundColWidth}px` }}
                          className="px-0.5 py-1 text-center font-mono tabular-nums text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface)]/80 border-r border-[var(--border-paper)] sticky left-0 z-10 select-none truncate"
                        >
                          {displayRound}
                        </td>
                      )}

                      {/* Columns: Proportional Native Input Field */}
                      {table.columns.map((col: ColumnConfig) => {
                        const val = row.cells[col.id] ?? '';
                        const isNarrow = col.widthRatio === 1;

                        return (
                          <td
                            key={col.id}
                            className={`p-0.5 sm:p-1 border-r border-[var(--border-paper)] last:border-r-0 ${
                              isNarrow ? 'bg-[var(--accent-subtle-bg)]/10' : ''
                            }`}
                          >
                            <input
                              type="text"
                              inputMode="text"
                              value={val}
                              onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                              placeholder=""
                              className={`w-full h-8 sm:h-9 px-1 text-center font-mono tabular-nums font-bold text-xs sm:text-sm rounded transition-all focus:outline-none focus:ring-1.5 focus:ring-[var(--accent)] border ${
                                val !== ''
                                  ? isNarrow
                                    ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] text-[var(--accent-subtle-text)]'
                                    : 'bg-[var(--bg-input)] border-[var(--border-strong)] text-[var(--text-primary)] shadow-2xs'
                                  : 'bg-[var(--bg-input)]/50 border-transparent hover:border-[var(--border-paper)] text-[var(--text-primary)]'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Delete Row Button */}
                      <td
                        style={{ width: `${deleteBtnWidth}px` }}
                        className="px-0.5 text-center"
                      >
                        {table.rows.length > 1 && (
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 p-1 rounded transition-opacity cursor-pointer"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Action: Add Next Row */}
          <div className="p-2 sm:p-3 bg-[var(--bg-surface)] border-t border-[var(--border-paper)] flex items-center justify-between">
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-paper)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
              Add Row ({table.rows.length + 1})
            </button>

            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              {isFitContent ? 'Fit to Content' : 'Stretched'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
