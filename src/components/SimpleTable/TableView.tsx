import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Sliders,
  Maximize2,
  Minimize2,
  Pencil,
  Undo2,
  Check
} from 'lucide-react';
import type { SimpleTableConfig, TableRow, ColumnConfig } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { SoundToggle } from '../SoundToggle';
import { saveActiveTable } from '../../utils/storage';
import { 
  playTapSound, 
  playCrossSound, 
  startCrayonSound,
  updateCrayonMotion,
  stopCrayonSound,
  playAddRowSound, 
  playClearSound 
} from '../../utils/sound';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface TableViewProps {
  table: SimpleTableConfig;
  onUpdateTable: (updated: SimpleTableConfig) => void;
  onBackToMenu: () => void;
  onEditConfig: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  table,
  onUpdateTable,
  onBackToMenu,
  onEditConfig,
  isDark,
  onToggleTheme,
  isMuted = false,
  onToggleSound = () => {},
}) => {
  // Column width sizing mode: 'fit' (fits to name/compact) vs 'stretch' (fills 100% screen)
  const [isFitContent, setIsFitContent] = useState<boolean>(() => {
    const saved = localStorage.getItem('table_width_mode');
    return saved ? saved === 'fit' : true;
  });

  const toggleWidthMode = () => {
    setIsFitContent((prev) => {
      const next = !prev;
      localStorage.setItem('table_width_mode', next ? 'fit' : 'stretch');
      return next;
    });
  };

  // Crayon / Drawing Mode State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawColor, setDrawColor] = useState<string>('#dc2626');
  const [drawWidth, setDrawWidth] = useState<number>(3);
  const [strokes, setStrokes] = useState<Stroke[]>(() => {
    if (table.drawingData) {
      try {
        const parsed = JSON.parse(table.drawingData);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Palette & Stroke Widths
  const crayonColors = useMemo(() => [
    { id: 'red', name: 'Terracotta Red', color: '#dc2626' },
    { id: 'blue', name: 'Ink Blue', color: '#2563eb' },
    { id: 'green', name: 'Felt Green', color: '#16a34a' },
    { id: 'amber', name: 'Crayon Gold', color: '#f59e0b' },
    { id: 'purple', name: 'Wild Violet', color: '#9333ea' },
    { id: 'neutral', name: isDark ? 'Chalk White' : 'Charcoal Black', color: isDark ? '#f5f5f4' : '#1c1917' },
  ], [isDark]);

  const strokeWidths = useMemo(() => [
    { id: 'fine', name: 'Fine', size: 2 },
    { id: 'medium', name: 'Medium', size: 4 },
    { id: 'bold', name: 'Bold', size: 8 },
  ], []);

  // Sync strokes if external table changes
  useEffect(() => {
    if (table.drawingData) {
      try {
        const parsed = JSON.parse(table.drawingData);
        if (Array.isArray(parsed) && JSON.stringify(parsed) !== JSON.stringify(strokes)) {
          setStrokes(parsed);
        }
      } catch {
        // ignore
      }
    } else if (strokes.length > 0) {
      setStrokes([]);
    }
  }, [table.id, table.drawingData]);

  // Redraw all strokes on canvas
  const redraw = () => {
    const canvas = canvasRef.current;
    const wrapper = tableWrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    if (width === 0 || height === 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.85;

    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    redraw();
  }, [strokes]);

  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(() => {
      redraw();
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [strokes]);

  const saveStrokes = (newStrokes: Stroke[]) => {
    setStrokes(newStrokes);
    const updatedTable: SimpleTableConfig = {
      ...table,
      drawingData: JSON.stringify(newStrokes),
      lastModified: Date.now(),
    };
    onUpdateTable(updatedTable);
    saveActiveTable(updatedTable);
  };

  const handleUndoStroke = () => {
    if (strokes.length === 0) return;
    playTapSound();
    const newStrokes = strokes.slice(0, -1);
    saveStrokes(newStrokes);
  };

  const handleClearDrawing = () => {
    if (strokes.length === 0) return;
    if (window.confirm('Wipe all crayon doodles on this table?')) {
      playClearSound();
      saveStrokes([]);
    }
  };

  // Canvas pointer event handlers for drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    startCrayonSound();
    updateCrayonMotion();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    const newStroke: Stroke = {
      color: drawColor,
      width: drawWidth,
      points: [{ x, y }],
    };
    currentStrokeRef.current = newStroke;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawColor;
      ctx.fillStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(x, y, drawWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    updateCrayonMotion();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const points = currentStrokeRef.current.points;
    const lastPoint = points[points.length - 1];
    points.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx && lastPoint) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stopCrayonSound();
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const strokeToSave = currentStrokeRef.current;
    currentStrokeRef.current = null;
    if (strokeToSave.points.length > 0) {
      const newStrokes = [...strokes, strokeToSave];
      saveStrokes(newStrokes);
    }
  };

  // Long press detection ref
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef<boolean>(false);

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
      const labelChars = col.label ? col.label.length : 4;
      const textWidthNeeded = labelChars * 9 + 20;

      if (isFitContent) {
        if (isNarrow) {
          return Math.max(48, Math.min(68, textWidthNeeded));
        }
        return Math.max(col.widthRatio * 44, textWidthNeeded);
      } else {
        return (col.widthRatio / totalRatio) * 100;
      }
    });
  }, [table.columns, isFitContent, totalRatio]);

  const roundColWidth = 42;
  const deleteBtnWidth = 34;

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

  // Toggle Cross-Off State (Pen Strike)
  const toggleCrossCell = (rowId: string, colId: string) => {
    // Play authentic pen scratch audio
    playCrossSound();

    // Tactile haptic vibration on phones
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {
        // Ignore if vibration is restricted
      }
    }

    const updatedRows = table.rows.map((row: TableRow) => {
      if (row.id === rowId) {
        const currentCrossed = row.crossedCells?.[colId] ?? false;
        return {
          ...row,
          crossedCells: {
            ...row.crossedCells,
            [colId]: !currentCrossed,
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

  // Long-press handlers for touch / mouse
  const handleTouchStart = (rowId: string, colId: string) => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      toggleCrossCell(rowId, colId);
    }, 420); // 420ms hold threshold
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Instant Crash-Proof Cell Update
  const handleCellChange = (rowId: string, colId: string, value: string) => {
    // If it was just a long press, ignore text change
    if (isLongPressRef.current) return;

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

  // Add row
  const handleAddRow = () => {
    playAddRowSound();
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
    playTapSound();
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
    playClearSound();
    const clearedRows = table.rows.map((r: TableRow) => {
      const cells: Record<string, string> = {};
      table.columns.forEach((col: ColumnConfig) => {
        cells[col.id] = '';
      });
      return { ...r, cells, crossedCells: {} };
    });

    const updatedTable: SimpleTableConfig = {
      ...table,
      rows: clearedRows,
      lastModified: Date.now(),
    };

    onUpdateTable(updatedTable);
    saveActiveTable(updatedTable);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col">
      {/* Top Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-paper)] px-3 py-2 sm:px-6 sm:py-2.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playTapSound();
                onBackToMenu();
              }}
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
            <button
              onClick={() => {
                playTapSound();
                toggleWidthMode();
              }}
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

            <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* Crayon / Doodle Button */}
            <button
              onClick={() => {
                playTapSound();
                setIsDrawingMode((prev) => !prev);
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isDrawingMode
                  ? 'bg-[var(--accent)] text-white border-transparent shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border-transparent'
              }`}
              title={isDrawingMode ? 'Done Drawing' : 'Draw with Crayon'}
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Crayon</span>
              {strokes.length > 0 && !isDrawingMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
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

      {/* Crayon Floating / Sub-header Settings Bar */}
      {isDrawingMode && (
        <div className="bg-[var(--bg-surface)] border-b border-[var(--border-paper)] px-3 py-2 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs z-30 shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Colors */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider mr-1">
                Color:
              </span>
              {crayonColors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDrawColor(c.color)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-transform cursor-pointer border border-black/10 shadow-2xs flex items-center justify-center ${
                    drawColor === c.color
                      ? 'scale-125 ring-2 ring-[var(--accent)] ring-offset-1'
                      : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-[var(--border-paper)] hidden sm:block" />

            {/* Stroke Widths */}
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider mr-1">
                Size:
              </span>
              {strokeWidths.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => setDrawWidth(sw.size)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer border ${
                    drawWidth === sw.size
                      ? 'bg-[var(--accent-subtle-bg)] text-[var(--accent)] border-[var(--accent-subtle-border)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] border-transparent'
                  }`}
                >
                  {sw.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right action buttons: Undo, Clear, Done */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoStroke}
              disabled={strokes.length === 0}
              className="px-2 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
              title="Undo stroke"
            >
              <Undo2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Undo</span>
            </button>

            <button
              type="button"
              onClick={handleClearDrawing}
              disabled={strokes.length === 0}
              className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
              title="Wipe doodles"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrawingMode(false)}
              className="px-3 py-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer shadow-2xs"
              title="Done drawing"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <main className="flex-1 p-2 sm:p-6 max-w-7xl mx-auto w-full flex flex-col overflow-hidden">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] shadow-2xs flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto flex-1 relative">
            <div
              ref={tableWrapperRef}
              className="relative inline-block"
              style={{
                width: isFitContent ? `${totalTableWidth}px` : '100%',
                minWidth: `${totalTableWidth}px`,
              }}
            >
              <table
                className="border-collapse text-left w-full"
                style={{
                  tableLayout: 'fixed',
                  width: '100%',
                }}
              >
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
                      {/* Round Cell */}
                      {table.hasRoundColumn && (
                        <td
                          style={{ width: `${roundColWidth}px` }}
                          className="px-0.5 py-1 text-center font-mono tabular-nums text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface)]/80 border-r border-[var(--border-paper)] sticky left-0 z-10 select-none truncate"
                        >
                          {displayRound}
                        </td>
                      )}

                      {/* Columns: Proportional Input with Authentic Pen Slash */}
                      {table.columns.map((col: ColumnConfig) => {
                        const val = row.cells[col.id] ?? '';
                        const isCrossed = row.crossedCells?.[col.id] ?? false;
                        const isNarrow = col.widthRatio === 1;

                        return (
                          <td
                            key={col.id}
                            className={`p-0.5 sm:p-1 border-r border-[var(--border-paper)] last:border-r-0 relative select-none ${
                              isNarrow ? 'bg-[var(--accent-subtle-bg)]/10' : ''
                            }`}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              toggleCrossCell(row.id, col.id);
                            }}
                            onTouchStart={() => handleTouchStart(row.id, col.id)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchEnd}
                            onMouseDown={() => handleTouchStart(row.id, col.id)}
                            onMouseUp={handleTouchEnd}
                            onMouseLeave={handleTouchEnd}
                          >
                            <div className="relative w-full h-full flex items-center justify-center">
                              <input
                                type="text"
                                inputMode="text"
                                value={val}
                                onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                                placeholder=""
                                className={`w-full h-8 sm:h-9 px-1 text-center font-mono tabular-nums font-bold text-xs sm:text-sm rounded transition-all focus:outline-none focus:ring-1.5 focus:ring-[var(--accent)] border ${
                                  isCrossed ? 'line-through opacity-60 text-red-500/80 dark:text-red-400/80' : ''
                                } ${
                                  val !== ''
                                    ? isNarrow
                                      ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] text-[var(--accent-subtle-text)]'
                                      : 'bg-[var(--bg-input)] border-[var(--border-strong)] text-[var(--text-primary)] shadow-2xs'
                                    : 'bg-[var(--bg-input)]/50 border-transparent hover:border-[var(--border-paper)] text-[var(--text-primary)]'
                                }`}
                              />

                              {/* Realistic Pen Strike Overlay when Crossed Off */}
                              {isCrossed && (
                                <svg
                                  className="absolute inset-0 w-full h-full pointer-events-none"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                >
                                  {/* Realistic diagonal pen slash from bottom-left to top-right */}
                                  <line
                                    x1="12"
                                    y1="88"
                                    x2="88"
                                    y2="12"
                                    stroke="var(--accent)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeOpacity="0.85"
                                  />
                                </svg>
                              )}
                            </div>
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

            {/* Crayon Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full ${
                isDrawingMode
                  ? 'pointer-events-auto cursor-crosshair z-20'
                  : 'pointer-events-none z-10'
              }`}
              style={{ touchAction: isDrawingMode ? 'none' : 'auto' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
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
            {isDrawingMode
              ? 'Tip: Draw freely with crayon • Tap Done when finished'
              : 'Tip: Hold box to cross off'}
          </span>
        </div>
        </div>
      </main>
    </div>
  );
};
