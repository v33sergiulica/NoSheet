import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { SimpleTableConfig, ColumnConfig, TableRow, HeaderGroup, RowIndexingType } from '../../types';
import { ThemeToggle } from '../ThemeToggle';

interface SimpleTableSetupProps {
  onBack: () => void;
  onGenerate: (config: SimpleTableConfig) => void;
  initialConfig?: SimpleTableConfig | null;
  isEditingExisting?: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SimpleTableSetup: React.FC<SimpleTableSetupProps> = ({
  onBack,
  onGenerate,
  initialConfig,
  isEditingExisting = false,
  isDark,
  onToggleTheme,
}) => {
  const [title, setTitle] = useState(
    isEditingExisting && initialConfig ? initialConfig.title : 'Score Table'
  );

  // Row indexing mode: 'numbered' | 'circular' | 'none' (max 1 active)
  const [rowIndexingType, setRowIndexingType] = useState<RowIndexingType>(() => {
    if (isEditingExisting && initialConfig) {
      return initialConfig.rowIndexingType || (initialConfig.hasRoundColumn ? 'numbered' : 'none');
    }
    return 'numbered';
  });

  // Numbered prefix
  const [roundPrefix, setRoundPrefix] = useState<string>(
    isEditingExisting && initialConfig?.roundPrefix !== undefined
      ? initialConfig.roundPrefix
      : 'Round '
  );

  // Circular items string (space-separated, e.g. "P1 P2 P3")
  const [circularInput, setCircularInput] = useState<string>(() => {
    if (isEditingExisting && initialConfig?.circularItems) {
      return initialConfig.circularItems.join(' ');
    }
    return 'P1 P2 P3';
  });

  // Stored as string so user can clear and type freely
  const [rowCount, setRowCount] = useState<string>(
    isEditingExisting && initialConfig ? String(initialConfig.rows.length) : '8'
  );

  // Pattern input string (e.g. "2 1 2 1")
  const [patternInput, setPatternInput] = useState(
    isEditingExisting && initialConfig
      ? initialConfig.columns.map((c: ColumnConfig) => c.widthRatio).join(' ')
      : '2 1 2 1'
  );

  // Grouped headers mode (e.g. "P1" spanning 2 columns)
  const [isGrouped, setIsGrouped] = useState<boolean>(() => {
    return isEditingExisting && initialConfig?.headerGroups
      ? initialConfig.headerGroups.length > 0
      : true;
  });

  const [colsPerGroup, setColsPerGroup] = useState<number>(() => {
    return isEditingExisting && initialConfig?.headerGroups?.[0]?.colSpan
      ? initialConfig.headerGroups[0].colSpan
      : 2;
  });

  // Custom group labels
  const [groupTitles, setGroupTitles] = useState<string[]>(() => {
    if (isEditingExisting && initialConfig?.headerGroups) {
      return initialConfig.headerGroups.map((g) => g.title);
    }
    return ['P1', 'P2', 'P3', 'P4'];
  });

  // Individual column labels (if not grouped)
  const [singleColLabels, setSingleColLabels] = useState<string[]>(() => {
    if (isEditingExisting && initialConfig?.columns) {
      return initialConfig.columns.map((c) => c.label);
    }
    return ['Col 1', 'Col 2', 'Col 3', 'Col 4'];
  });

  // Parse circular items
  const parsedCircularItems = useMemo(() => {
    const items = circularInput.trim().split(/\s+/).filter(Boolean);
    return items.length > 0 ? items : ['P1'];
  }, [circularInput]);

  // Parse pattern string into column ratios
  const parsedPatternRatios = useMemo(() => {
    const nums = patternInput
      .replace(/[(),]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((s: string) => parseInt(s, 10))
      .filter((n: number) => !isNaN(n) && n > 0 && n <= 8);
    return nums.length > 0 ? nums : [1];
  }, [patternInput]);

  // Compute HeaderGroups if grouped
  const headerGroups = useMemo<HeaderGroup[]>(() => {
    if (!isGrouped) return [];
    const span = Math.max(1, colsPerGroup);
    const count = Math.ceil(parsedPatternRatios.length / span);
    const groups: HeaderGroup[] = [];

    for (let i = 0; i < count; i++) {
      const remainingCols = parsedPatternRatios.length - i * span;
      const actualSpan = Math.min(span, remainingCols);
      groups.push({
        id: `group-${i}`,
        title: groupTitles[i] || `P${i + 1}`,
        colSpan: actualSpan,
      });
    }

    return groups;
  }, [isGrouped, colsPerGroup, parsedPatternRatios.length, groupTitles]);

  // Active columns to use
  const activeColumns = useMemo<ColumnConfig[]>(() => {
    return parsedPatternRatios.map((ratio: number, index: number) => {
      let groupId: string | undefined;
      if (isGrouped) {
        const groupIndex = Math.floor(index / Math.max(1, colsPerGroup));
        groupId = headerGroups[groupIndex]?.id;
      }

      return {
        id: `col-${index}`,
        label: singleColLabels[index] || `Col ${index + 1}`,
        widthRatio: ratio,
        groupId,
      };
    });
  }, [parsedPatternRatios, isGrouped, colsPerGroup, headerGroups, singleColLabels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRows = Math.max(1, parseInt(rowCount, 10) || 8);
    const generatedRows: TableRow[] = [];

    for (let i = 1; i <= parsedRows; i++) {
      let rowLabel = `${i}`;
      if (rowIndexingType === 'numbered') {
        rowLabel = `${roundPrefix}${i}`;
      } else if (rowIndexingType === 'circular') {
        rowLabel = parsedCircularItems[(i - 1) % parsedCircularItems.length];
      }

      const cells: Record<string, string> = {};
      activeColumns.forEach((col: ColumnConfig) => {
        if (isEditingExisting && initialConfig?.rows[i - 1]?.cells[col.id] !== undefined) {
          cells[col.id] = initialConfig.rows[i - 1].cells[col.id];
        } else {
          cells[col.id] = '';
        }
      });

      generatedRows.push({
        id: `row-${Date.now()}-${i}`,
        roundLabel: rowLabel,
        cells,
      });
    }

    let roundColHeader = '#';
    if (rowIndexingType === 'numbered') {
      roundColHeader = roundPrefix.trim() || '#';
    } else if (rowIndexingType === 'circular') {
      roundColHeader = 'P';
    }

    const config: SimpleTableConfig = {
      id: isEditingExisting && initialConfig ? initialConfig.id : `table-${Date.now()}`,
      title: title.trim() || 'Score Table',
      hasRoundColumn: rowIndexingType !== 'none',
      rowIndexingType,
      roundColumnName: roundColHeader,
      roundPrefix,
      circularItems: parsedCircularItems,
      headerGroups: isGrouped ? headerGroups : undefined,
      columns: activeColumns,
      rows: generatedRows,
      createdAt: isEditingExisting && initialConfig ? initialConfig.createdAt : Date.now(),
      lastModified: Date.now(),
    };

    onGenerate(config);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] px-4 py-6 sm:px-6 lg:px-8 max-w-xl mx-auto">
      {/* Navigation & Theme Toggle */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-serif font-bold text-[var(--text-secondary)]">
            {isEditingExisting ? 'Edit Table Settings' : 'New Table Setup'}
          </span>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Table & Rows */}
        <section className="bg-[var(--bg-card)] rounded-2xl p-5 sm:p-6 border border-[var(--border-paper)] shadow-2xs">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Table Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Game Name / Table"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Initial Rows
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={rowCount}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  setRowCount(cleaned);
                }}
                onBlur={() => {
                  if (!rowCount || parseInt(rowCount, 10) < 1) {
                    setRowCount('8');
                  }
                }}
                placeholder="8"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] font-mono tabular-nums text-sm font-bold focus:outline-none focus:border-[var(--accent)] shadow-2xs"
              />
            </div>

            {/* Mutually Exclusive Row Indexing Options (Max 1 clickable) */}
            <div className="pt-3 border-t border-[var(--border-paper)] space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                Row Index Column (Choose at most 1)
              </span>

              {/* Option A: Numbered Rounds */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-paper)] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rowIndexingType === 'numbered'}
                      onChange={() => {
                        setRowIndexingType(rowIndexingType === 'numbered' ? 'none' : 'numbered');
                      }}
                      className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--bg-input)] border-[var(--border-paper)] cursor-pointer"
                    />
                    <span className="text-[var(--text-primary)]">Numbered Rounds</span>
                  </label>

                  {rowIndexingType === 'numbered' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">Prefix:</span>
                      <input
                        type="text"
                        value={roundPrefix}
                        onChange={(e) => setRoundPrefix(e.target.value)}
                        placeholder="e.g. Round , R, or empty"
                        className="w-24 bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  )}
                </div>

                {rowIndexingType === 'numbered' && (
                  <p className="text-[11px] text-[var(--text-muted)] pl-6.5">
                    {roundPrefix === ''
                      ? 'Rows labeled: 1, 2, 3, 4...'
                      : `Rows labeled: ${roundPrefix}1, ${roundPrefix}2, ${roundPrefix}3...`}
                  </p>
                )}
              </div>

              {/* Option B: Circular List Indexing (e.g. P1 P2 P3) */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-paper)] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rowIndexingType === 'circular'}
                      onChange={() => {
                        setRowIndexingType(rowIndexingType === 'circular' ? 'none' : 'circular');
                      }}
                      className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--bg-input)] border-[var(--border-paper)] cursor-pointer"
                    />
                    <span className="text-[var(--text-primary)]">Circular List Indexing</span>
                  </label>

                  {rowIndexingType === 'circular' && (
                    <input
                      type="text"
                      value={circularInput}
                      onChange={(e) => setCircularInput(e.target.value)}
                      placeholder="e.g. P1 P2 P3"
                      className="w-full sm:w-44 bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:border-[var(--accent)]"
                    />
                  )}
                </div>

                {rowIndexingType === 'circular' && (
                  <p className="text-[11px] text-[var(--text-muted)] pl-6.5">
                    Cycles continuously through items: <span className="font-mono text-[var(--accent)] font-semibold">{parsedCircularItems.join(' → ')} → {parsedCircularItems[0]}...</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pattern Mode (Column Thickness) */}
        <section className="bg-[var(--bg-card)] rounded-2xl p-5 sm:p-6 border border-[var(--border-paper)] shadow-2xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-serif">
              Column Thickness
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Enter column width ratios separated by spaces (e.g. <span className="font-mono font-bold text-[var(--accent)]">2 1 2 1</span>)
            </p>
          </div>

          <div className="mb-5">
            <input
              type="text"
              value={patternInput}
              onChange={(e) => setPatternInput(e.target.value)}
              placeholder="e.g. 2 1 2 1"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono text-xl font-bold tracking-wider focus:outline-none shadow-2xs"
            />
          </div>

          {/* Section 3: Header Configuration (e.g. "P1" over 2 columns) */}
          <div className="pt-4 border-t border-[var(--border-paper)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-serif">
                  Header Style
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Label the top as <span className="font-semibold text-[var(--text-primary)]">P1, P2</span> across pairs of columns
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGrouped}
                  onChange={(e) => setIsGrouped(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--bg-input)] border-[var(--border-paper)] cursor-pointer"
                />
                <span>Grouped (P1, P2...)</span>
              </label>
            </div>

            {isGrouped ? (
              <div className="space-y-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-paper)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-secondary)]">Columns per header group:</span>
                  <select
                    value={colsPerGroup}
                    onChange={(e) => setColsPerGroup(parseInt(e.target.value, 10))}
                    className="bg-[var(--bg-input)] border border-[var(--border-paper)] text-[var(--text-primary)] font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value={2}>2 columns (e.g. 2 1)</option>
                    <option value={3}>3 columns</option>
                    <option value={1}>1 column each</option>
                  </select>
                </div>

                {/* Edit Group Names: P1, P2, etc. */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {headerGroups.map((group, gIdx) => (
                    <div key={group.id} className="flex items-center gap-1.5 bg-[var(--bg-input)] p-2 rounded-lg border border-[var(--border-paper)]">
                      <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-4 text-center">
                        {gIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={groupTitles[gIdx] ?? group.title}
                        onChange={(e) => {
                          const updated = [...groupTitles];
                          updated[gIdx] = e.target.value;
                          setGroupTitles(updated);
                        }}
                        placeholder={`P${gIdx + 1}`}
                        className="w-full bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Individual column labels */
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {parsedPatternRatios.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-paper)] text-xs">
                    <span className="font-mono font-bold text-[var(--text-muted)] w-4 text-center">{idx + 1}</span>
                    <input
                      type="text"
                      value={singleColLabels[idx] ?? `Col ${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...singleColLabels];
                        updated[idx] = e.target.value;
                        setSingleColLabels(updated);
                      }}
                      className="w-full bg-transparent text-xs font-medium text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Table Preview */}
          <div className="mt-5 pt-4 border-t border-[var(--border-paper)]">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2.5">
              <span className="font-semibold uppercase tracking-wider font-serif">Table Header Preview</span>
              <span className="font-mono tabular-nums font-semibold text-[var(--text-muted)]">
                {activeColumns.length} cols
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-paper)] overflow-x-auto shadow-2xs">
              <div className="min-w-full">
                {/* Header Row Preview */}
                <div className="flex gap-1.5 mb-1.5">
                  {rowIndexingType !== 'none' && (
                    <div className="w-10 shrink-0 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-paper)] text-center flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] truncate">
                        {rowIndexingType === 'circular' ? 'P' : (roundPrefix.trim() || '#')}
                      </span>
                    </div>
                  )}

                  {isGrouped ? (
                    headerGroups.map((group, gIdx) => {
                      const startIndex = gIdx * colsPerGroup;
                      const groupCols = activeColumns.slice(startIndex, startIndex + group.colSpan);
                      const groupRatioSum = groupCols.reduce((sum, c) => sum + c.widthRatio, 0);

                      return (
                        <div
                          key={group.id}
                          style={{ flex: groupRatioSum }}
                          className="min-w-[50px] p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-paper)] text-center font-bold text-xs text-[var(--text-primary)] truncate"
                        >
                          {group.title}
                        </div>
                      );
                    })
                  ) : (
                    activeColumns.map((col) => (
                      <div
                        key={col.id}
                        style={{ flex: col.widthRatio }}
                        className="min-w-[40px] p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-paper)] text-center font-bold text-xs text-[var(--text-primary)] truncate"
                      >
                        {col.label}
                      </div>
                    ))
                  )}
                </div>

                {/* Sub-Ratio Boxes Preview */}
                <div className="flex gap-1.5">
                  {rowIndexingType !== 'none' && (
                    <div className="w-10 shrink-0 text-center font-mono text-[10px] text-[var(--text-muted)] flex items-center justify-center truncate">
                      {rowIndexingType === 'circular'
                        ? parsedCircularItems[0]
                        : (roundPrefix.trim() ? `${roundPrefix.trim()}1` : '1')}
                    </div>
                  )}
                  {activeColumns.map((col, idx) => {
                    const isNarrow = col.widthRatio === 1;
                    const minW = isNarrow ? 36 : col.widthRatio * 32;

                    return (
                      <div
                        key={col.id || idx}
                        style={{
                          flex: col.widthRatio,
                          minWidth: `${minW}px`,
                        }}
                        className={`p-1 rounded-lg border text-center font-mono text-[11px] tabular-nums font-bold ${
                          isNarrow
                            ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] text-[var(--accent-subtle-text)]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-paper)] text-[var(--text-primary)]'
                        }`}
                      >
                        {col.widthRatio}x
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            {isEditingExisting ? 'Save Changes' : 'Generate Table'}
          </button>
        </div>
      </form>
    </div>
  );
};
