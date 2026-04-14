"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../../../components/ui/skeleton";
import { useColumnWidths, ResizeHandle, useTableSort, SortIndicator, sortRows } from "../../../../lib/use-column-widths";
import { ChevronDownIcon, EyeIcon, EyeOffIcon, GripVerticalIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Types ────────────────────────────────────────────────────────

/** Column definition for the DataTable. */
export interface DataTableColumn<T> {
  /** Unique column ID used for sorting, resizing, visibility. */
  id: string;
  /** Display header label. */
  header: string;
  /** Optional header icon (React node). */
  headerIcon?: ReactNode;
  /** Default width in pixels. */
  defaultWidth?: number;
  /** Render the cell content for a row. */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Extract a sortable value from a row. If omitted, column is not sortable. */
  sortValue?: (row: T) => string | number;
  /** If true, column cannot be hidden or reordered. */
  fixed?: boolean;
  /** Minimum width for resize. */
  minWidth?: number;
}

/** Aggregate function type. */
export type AggFn = "sum" | "count" | "avg" | "min" | "max" | "most_frequent";

/** Aggregate definition for a column. */
export interface DataTableAggregate<T> {
  /** Column ID to aggregate. */
  columnId: string;
  /** Available aggregate functions. */
  options: { id: string; label: string }[];
  /** Default function. */
  defaultFn: AggFn;
  /** Extract numeric/string value for aggregation. */
  getValue: (row: T) => unknown;
}

/** View definition for saved table layouts. */
export interface DataTableView {
  id: string;
  name: string;
  hiddenColumns: string[];
  columnOrder?: string[];
}

/** Internal labels for the DataTable. Override for localization. */
export interface DataTableLabels {
  columns: string;
  rowsPerPage: string;
  /** Format the row count cell shown in the aggregates footer. */
  rowCount: (count: number) => string;
  /** Format the pagination range. */
  pageRange: (start: number, end: number, total: number) => string;
}

const defaultDataTableLabels: DataTableLabels = {
  columns: "Columns",
  rowsPerPage: "Rows per page",
  rowCount: (n) => `${n} rows`,
  pageRange: (start, end, total) => `${start}\u2013${end} of ${total}`,
};

interface DataTableProps<T> {
  /** Unique table ID for persisting column widths. */
  tableId: string;
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Data rows. */
  data: T[];
  /** Extract a unique key from each row. */
  rowKey: (row: T) => string;

  // ── Optional features ──

  /** Default sort column ID. */
  defaultSortKey?: string;
  /** Default sort direction. */
  defaultSortDir?: "asc" | "desc";
  /** Column IDs hidden by default (before any user/view override). */
  defaultHiddenColumns?: string[];
  /** Column order by default (before any user/view override). Array of column IDs. */
  defaultColumnOrder?: string[];
  /** Enable column visibility toggling. */
  columnPicker?: boolean;
  /** Enable column drag-reorder (requires views). */
  columnReorder?: boolean;
  /** Enable pagination. Default page sizes: [10, 25, 50, 100]. */
  pagination?: boolean;
  /** Custom page size options. */
  pageSizes?: number[];
  /** Default page size. */
  defaultPageSize?: number;
  /** Aggregate definitions for footer row. */
  aggregates?: DataTableAggregate<T>[];
  /** Render row-level action buttons (e.g., delete). */
  rowActions?: (row: T) => ReactNode;
  /** Toolbar content rendered before the column picker. */
  toolbar?: ReactNode;
  /** Empty state message. */
  emptyMessage?: string;
  /** Render loading skeleton. */
  loading?: boolean;
  /** Number of skeleton rows to show. */
  skeletonRows?: number;
  /** Row click handler. */
  onRowClick?: (row: T) => void;
  /** Row class name. */
  rowClassName?: string | ((row: T) => string);

  // ── Views ──

  /** If provided, enables view tabs. */
  views?: DataTableView[];
  /** Active view ID. */
  activeViewId?: string;
  /** Called when the active view changes. */
  onViewChange?: (viewId: string) => void;
  /** Called when the user requests to add a new view. */
  onViewAdd?: () => void;
  /** Called when the user requests to delete a view. */
  onViewDelete?: (viewId: string) => void;
  /** Called when the user renames a view. */
  onViewRename?: (viewId: string, name: string) => void;
  /** Callback for right-click on a view tab (e.g., to show a context menu). */
  onViewContextMenu?: (viewId: string, position: { x: number; y: number }) => void;
  /** Content rendered at the right end of the view tab bar (e.g., "New" button). */
  tabActions?: ReactNode;
  /** Called when a column's visibility is toggled. */
  onColumnVisibilityChange?: (columnId: string) => void;
  /** Called when columns are reordered via drag-and-drop. */
  onColumnReorder?: (newOrder: string[]) => void;
  /** Additional CSS classes for the root container. Use `h-full` to fill parent. */
  className?: string;
  /** Override internal labels for localization. */
  labels?: Partial<DataTableLabels>;
}

// ── Sortable column item ────────────────────────────────────────

function SortableColumnItem({ field, onToggle }: { field: { id: string; name: string }; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-muted/50">
      <div {...attributes} {...listeners} className="cursor-grab p-0.5 text-muted-foreground/40 hover:text-muted-foreground"><GripVerticalIcon className="size-3" /></div>
      <button onClick={onToggle} className="p-0.5 cursor-pointer"><EyeIcon className="size-3 text-primary" /></button>
      <span className="flex-1 truncate">{field.name}</span>
    </div>
  );
}

// ── Inline select for aggregate / page size ─────────────────────

function MiniSelect({ value, options, onChange }: { value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const selected = options.find((o) => o.id === value);

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // Estimated dropdown height: ~32px per option, max ~192px (max-h-48)
      const estimatedHeight = Math.min(192, options.length * 32 + 8);
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;
      const flipUp = spaceBelow < estimatedHeight + 8 && spaceAbove > spaceBelow;
      if (flipUp) {
        setPos({
          bottom: window.innerHeight - r.top + 4,
          left: r.left,
          width: Math.max(r.width, 80),
        });
      } else {
        setPos({
          top: r.bottom + 4,
          left: r.left,
          width: Math.max(r.width, 80),
        });
      }
    }
    setOpen(!open);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") { e.preventDefault(); setOpen(false); btnRef.current?.focus(); } }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs cursor-pointer rounded border border-border/60 px-1.5 py-0.5 hover:bg-muted/50 transition-colors"
      >
        <span className={cn("truncate text-foreground", !selected && "text-muted-foreground/40")}>{selected?.label || "—"}</span>
        <ChevronDownIcon className="size-3 text-muted-foreground shrink-0" />
      </button>
      {open && (<>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div
          className="fixed z-50 rounded-lg border bg-popover shadow-lg py-1 max-h-48 overflow-y-auto"
          style={{ top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width }}
        >
          {options.map((opt) => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }} className={cn("w-full px-2.5 py-1.5 text-xs text-left hover:bg-muted/50 cursor-pointer", value === opt.id && "font-medium text-foreground")}>{opt.label}</button>
          ))}
        </div>
      </>)}
    </div>
  );
}

// ── DataTable ───────────────────────────────────────────────────

/**
 * Generic data table with sortable columns, resizable widths, pagination,
 * column visibility toggling, drag-and-drop column reordering, aggregate
 * footer rows, saved views, and row actions.
 */
export function DataTable<T>({
  tableId,
  columns,
  data,
  rowKey,
  defaultSortKey,
  defaultSortDir = "asc",
  defaultHiddenColumns,
  defaultColumnOrder,
  columnPicker = false,
  columnReorder = false,
  pagination = false,
  pageSizes = [10, 25, 50, 100],
  defaultPageSize = 25,
  aggregates,
  rowActions,
  toolbar,
  emptyMessage = "No results found.",
  loading = false,
  skeletonRows = 8,
  onRowClick,
  rowClassName,
  views,
  activeViewId,
  onViewChange,
  onViewAdd,
  onViewDelete,
  onViewRename,
  onViewContextMenu,
  tabActions,
  onColumnVisibilityChange,
  onColumnReorder,
  className,
  labels,
}: DataTableProps<T>) {
  const l = { ...defaultDataTableLabels, ...labels };
  // ── Sorting ──
  const { sortKey, sortDir, toggle: toggleSort } = useTableSort<string>(defaultSortKey, defaultSortDir);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.id === sortKey);
    if (!col?.sortValue) return data;
    return sortRows(data, sortKey, sortDir, (row) => col.sortValue!(row));
  }, [data, sortKey, sortDir, columns]);

  // ── Pagination ──
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = pagination ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;

  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page when data or page size changes
  useEffect(() => { setPage(0); }, [data.length, pageSize]);

  // ── Column widths ──
  const defaultWidths = useMemo(() => {
    const d: Record<string, number> = {};
    for (const col of columns) d[col.id] = col.defaultWidth ?? 150;
    return d;
  }, [columns]);
  const { widths, onResize } = useColumnWidths(tableId, defaultWidths);

  // ── Column visibility ──
  const activeView = views?.find((v) => v.id === activeViewId);
  // Hidden columns: view override > default > none
  const hiddenSet = useMemo(() => {
    const viewHidden = activeView?.hiddenColumns;
    if (viewHidden && viewHidden.length > 0) return new Set(viewHidden);
    if (defaultHiddenColumns?.length) return new Set(defaultHiddenColumns);
    return new Set<string>();
  }, [activeView, defaultHiddenColumns]);

  // Column order: view override > default > array order
  const visibleColumns = useMemo(() => {
    let cols = columns.filter((c) => c.fixed || !hiddenSet.has(c.id));
    const order = activeView?.columnOrder ?? defaultColumnOrder;
    if (order?.length) {
      const orderMap = new Map(order.map((id, i) => [id, i]));
      cols = [...cols].sort((a, b) => {
        if (a.fixed) return -1;
        if (b.fixed) return 1;
        return (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999);
      });
    }
    return cols;
  }, [columns, hiddenSet, activeView, defaultColumnOrder]);

  const reorderableColumns = useMemo(() => visibleColumns.filter((c) => !c.fixed), [visibleColumns]);

  // ── Column picker ──
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = reorderableColumns.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onColumnReorder?.(arrayMove(ids, oldIndex, newIndex));
  }

  // ── Aggregates ──
  const [showTotals, setShowTotals] = useState(false);
  const [aggFns, setAggFns] = useState<Record<string, string>>({});

  function computeAggregate(agg: DataTableAggregate<T>, fn: AggFn): string {
    const rawVals = sorted.map((row) => agg.getValue(row));
    if (fn === "count") return String(rawVals.filter((v) => v != null && v !== "" && v !== false).length);
    if (fn === "most_frequent") {
      const freq = new Map<string, number>();
      for (const v of rawVals) { const s = String(v ?? ""); if (s) freq.set(s, (freq.get(s) ?? 0) + 1); }
      let best = "—"; let bestC = 0;
      for (const [k, c] of freq) { if (c > bestC) { best = k; bestC = c; } }
      return best;
    }
    const vals = rawVals.map((v) => Number(v ?? 0)).filter((v) => !isNaN(v));
    if (vals.length === 0) return "—";
    switch (fn) {
      case "sum": return String(vals.reduce((a, b) => a + b, 0));
      case "avg": return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
      case "min": return String(Math.min(...vals));
      case "max": return String(Math.max(...vals));
      default: return "—";
    }
  }

  const hasActions = !!rowActions;

  // ── View tabs ──
  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Loading ──
  if (loading) {
    const skeletonCols = visibleColumns.length || 4;
    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="data-table text-sm w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr className="border-b text-left">
              {Array.from({ length: skeletonCols }).map((_, i) => (
                <th key={i} className="px-3 py-2"><Skeleton className="h-3.5 w-20" /></th>
              ))}
              {hasActions && <th className="px-1 py-2 w-9" />}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="border-b border-border/50">
                {Array.from({ length: skeletonCols }).map((_, j) => (
                  <td key={j} className="px-3 py-2.5"><Skeleton className={cn("h-3.5", j === 0 ? "w-40" : "w-24")} /></td>
                ))}
                {hasActions && <td className="px-1 py-2.5" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg flex flex-col min-h-0", className)}>
      {/* View tabs */}
      {views && views.length > 0 && (
        <div className="flex items-center gap-0.5 px-3 border-b">
          {views.map((v) => (
            <div key={v.id} className={cn("flex items-center border-b-2 transition-colors", activeViewId === v.id ? "border-primary" : "border-transparent")}>
              {renamingViewId === v.id ? (
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => { onViewRename?.(v.id, renameValue); setRenamingViewId(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { onViewRename?.(v.id, renameValue); setRenamingViewId(null); } if (e.key === "Escape") setRenamingViewId(null); }}
                  className="px-3 py-1.5 text-xs font-medium bg-transparent outline-none border-b border-primary"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => onViewChange?.(v.id)}
                  onDoubleClick={() => { setRenamingViewId(v.id); setRenameValue(v.name); }}
                  onContextMenu={(e) => { if (onViewContextMenu) { e.preventDefault(); onViewChange?.(v.id); onViewContextMenu(v.id, { x: e.clientX, y: e.clientY }); } }}
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer", activeViewId === v.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {v.name}
                </button>
              )}
            </div>
          ))}
          {onViewAdd && (
            <button onClick={onViewAdd} className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              <PlusIcon className="size-3" />
            </button>
          )}
          {tabActions && <div className="ml-auto flex items-stretch">{tabActions}</div>}
        </div>
      )}

      {/* Toolbar */}
      {(toolbar || columnPicker) && (
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          {toolbar}
          {columnPicker && (
            <div className="relative ml-auto">
              <button onClick={() => setShowColumnPicker(!showColumnPicker)} className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                <EyeIcon className="size-3.5" /> {l.columns}
              </button>
              {showColumnPicker && (<>
                <div className="fixed inset-0 z-40" onClick={() => setShowColumnPicker(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-60 rounded-lg border bg-popover shadow-lg py-1 max-h-64 overflow-y-auto">
                  {columnReorder ? (
                    <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
                      <SortableContext items={reorderableColumns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {reorderableColumns.map((c) => (
                          <SortableColumnItem key={c.id} field={{ id: c.id, name: c.header }} onToggle={() => onColumnVisibilityChange?.(c.id)} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    columns.filter((c) => !c.fixed && !hiddenSet.has(c.id)).map((c) => (
                      <div key={c.id} className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-muted/50">
                        <button onClick={() => onColumnVisibilityChange?.(c.id)} className="p-0.5 cursor-pointer"><EyeIcon className="size-3 text-primary" /></button>
                        <span className="flex-1 truncate">{c.header}</span>
                      </div>
                    ))
                  )}
                  {columns.filter((c) => !c.fixed && hiddenSet.has(c.id)).map((c) => (
                    <div key={c.id} className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-muted/50">
                      {columnReorder && <div className="p-0.5"><GripVerticalIcon className="size-3 text-transparent" /></div>}
                      <button onClick={() => onColumnVisibilityChange?.(c.id)} className="p-0.5 cursor-pointer"><EyeOffIcon className="size-3 text-muted-foreground/40" /></button>
                      <span className="flex-1 truncate text-muted-foreground/50">{c.header}</span>
                    </div>
                  ))}
                </div>
              </>)}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="data-table text-sm w-full" style={{ tableLayout: "fixed", minWidth: "max-content" }}>
          <colgroup>
            {visibleColumns.map((col) => (
              <col key={col.id} style={{ width: widths[col.id] ?? col.defaultWidth ?? 150 }} />
            ))}
            {hasActions && <col style={{ width: 36 }} />}
          </colgroup>
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className="px-0 py-0 font-medium relative group whitespace-nowrap"
                >
                  {col.sortValue ? (
                    <button
                      className="flex items-center gap-0 w-full px-3 py-2 text-left cursor-pointer"
                      onClick={() => toggleSort(col.id)}
                    >
                      {col.headerIcon && <span className="inline-block mr-1 align-middle">{col.headerIcon}</span>}
                      {col.header}
                      <SortIndicator active={sortKey === col.id} dir={sortDir} />
                    </button>
                  ) : (
                    <span className="flex items-center px-3 py-2">
                      {col.headerIcon && <span className="inline-block mr-1 align-middle">{col.headerIcon}</span>}
                      {col.header}
                    </span>
                  )}
                  {!col.fixed && <ResizeHandle onResize={(w) => onResize(col.id, w)} />}
                </th>
              ))}
              {hasActions && <th className="px-1 py-2" />}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (hasActions ? 1 : 0)} className="text-center py-12 text-muted-foreground bg-card">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => {
                const key = rowKey(row);
                const rcn = typeof rowClassName === "function" ? rowClassName(row) : rowClassName;
                return (
                  <tr
                    key={key}
                    className={cn("border-b border-border/50 hover:bg-muted/20 group/row", onRowClick && "cursor-pointer", rcn)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleColumns.map((col) => (
                      <td key={col.id} className="px-3 py-1.5">
                        {col.cell(row, page * pageSize + idx)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-1 py-1.5">
                        <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                          {rowActions!(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Aggregates footer — separate from the table so it always sits between
          the scroll area and the pagination bar, regardless of row count */}
      {aggregates && showTotals && sorted.length > 0 && (
        <table className="data-table text-xs w-full border-t bg-muted/30 shrink-0" style={{ tableLayout: "fixed", minWidth: "max-content" }}>
          <colgroup>
            {visibleColumns.map((col) => (
              <col key={col.id} style={{ width: widths[col.id] ?? col.defaultWidth ?? 150 }} />
            ))}
            {hasActions && <col style={{ width: 36 }} />}
          </colgroup>
          <tbody>
            <tr className="text-muted-foreground">
              {visibleColumns.map((col) => {
                const agg = aggregates.find((a) => a.columnId === col.id);
                if (!agg) {
                  if (col === visibleColumns[0]) {
                    return <td key={col.id} className="px-3 py-2 font-medium">{l.rowCount(sorted.length)}</td>;
                  }
                  return <td key={col.id} className="px-3 py-2" />;
                }
                const fn = (aggFns[col.id] ?? agg.defaultFn) as AggFn;
                return (
                  <td key={col.id} className="px-3 py-1.5">
                    <div className="flex items-center gap-1">
                      <MiniSelect value={fn} options={agg.options} onChange={(v) => setAggFns((prev) => ({ ...prev, [col.id]: v }))} />
                      {fn && <span className="font-mono truncate">{computeAggregate(agg, fn)}</span>}
                    </div>
                  </td>
                );
              })}
              {hasActions && <td />}
            </tr>
          </tbody>
        </table>
      )}

      {/* Pagination footer */}
      {(pagination || aggregates) && sorted.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {aggregates && (
              <button onClick={() => setShowTotals(!showTotals)} className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors cursor-pointer", showTotals ? "bg-muted text-foreground" : "hover:bg-muted/50")}>
                Σ
              </button>
            )}
            {pagination && (
              <>
                <span>{l.rowsPerPage}</span>
                <MiniSelect
                  value={String(pageSize)}
                  options={pageSizes.map((n) => ({ id: String(n), label: String(n) }))}
                  onChange={(v) => { setPageSize(Number(v)); setPage(0); }}
                />
              </>
            )}
          </div>
          {pagination && (
            <div className="flex items-center gap-3">
              <span>{l.pageRange(page * pageSize + 1, Math.min((page + 1) * pageSize, sorted.length), sorted.length)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(0)} disabled={page === 0} className="px-1.5 py-0.5 rounded hover:bg-muted disabled:opacity-30 cursor-pointer disabled:cursor-default">«</button>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-1.5 py-0.5 rounded hover:bg-muted disabled:opacity-30 cursor-pointer disabled:cursor-default">‹</button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-1.5 py-0.5 rounded hover:bg-muted disabled:opacity-30 cursor-pointer disabled:cursor-default">›</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-1.5 py-0.5 rounded hover:bg-muted disabled:opacity-30 cursor-pointer disabled:cursor-default">»</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
