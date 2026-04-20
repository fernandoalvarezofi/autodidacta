import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import {
  X,
  Sparkles,
  BookOpen,
  Lightbulb,
  FunctionSquare,
  FileText,
  Maximize2,
  Minimize2,
  Search,
  ChevronRight,
  ChevronDown,
  Network,
  Workflow,
  RefreshCw,
  Eye,
} from "lucide-react";

export interface MindmapNodeData {
  id: string;
  label: string;
  type: "main" | "sub" | "detail" | "formula" | "example";
  chunk_id: string | null;
  excerpt: string | null;
}

export interface MindmapEdgeData {
  source: string;
  target: string;
  label?: string;
}

export interface MindmapContent {
  nodes: MindmapNodeData[];
  edges: MindmapEdgeData[];
}

interface MindMapViewerProps {
  content: MindmapContent;
}

type LayoutDir = "TB" | "LR";

// ============================================================
// Custom node — visual hierarchy + interactive states
// ============================================================

const TYPE_STYLES: Record<
  MindmapNodeData["type"],
  {
    bg: string;
    border: string;
    icon: typeof Sparkles;
    accent: string;
    size: string;
    ring: string;
  }
> = {
  main: {
    bg: "bg-gradient-orange",
    border: "border-orange/0",
    icon: Sparkles,
    accent: "text-paper",
    size: "px-5 py-3.5 text-[15px] font-display font-semibold max-w-[280px]",
    ring: "shadow-orange",
  },
  sub: {
    bg: "bg-paper",
    border: "border-ink/90",
    icon: BookOpen,
    accent: "text-ink",
    size: "px-4 py-2.5 text-[13px] font-display font-medium max-w-[230px]",
    ring: "shadow-[0_2px_0_0_hsl(var(--ink))]",
  },
  detail: {
    bg: "bg-cream",
    border: "border-border",
    icon: FileText,
    accent: "text-ink/80",
    size: "px-3 py-2 text-[12px] max-w-[210px]",
    ring: "",
  },
  formula: {
    bg: "bg-orange/10",
    border: "border-orange/50",
    icon: FunctionSquare,
    accent: "text-orange-deep",
    size: "px-3 py-2 text-[12px] font-mono max-w-[210px]",
    ring: "",
  },
  example: {
    bg: "bg-paper",
    border: "border-dashed border-ink/40",
    icon: Lightbulb,
    accent: "text-ink/70",
    size: "px-3 py-2 text-[12px] italic max-w-[210px]",
    ring: "",
  },
};

type FlowNodeData = MindmapNodeData & {
  onSelect: (n: MindmapNodeData) => void;
  onToggle: (id: string) => void;
  hasChildren: boolean;
  collapsed: boolean;
  dimmed: boolean;
  highlighted: boolean;
  layoutDir: LayoutDir;
  [key: string]: unknown;
};

function MindNode({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  const style = TYPE_STYLES[data.type];
  const Icon = style.icon;
  const clickable = !!data.chunk_id;
  const sourcePos = data.layoutDir === "LR" ? Position.Right : Position.Bottom;
  const targetPos = data.layoutDir === "LR" ? Position.Left : Position.Top;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (clickable) data.onSelect(data);
      }}
      className={`group relative ${style.bg} ${style.border} ${style.size} ${style.ring} border-2 rounded-lg transition-all duration-200 leading-snug ${
        clickable ? "cursor-pointer" : "cursor-default"
      } ${data.dimmed ? "opacity-25 saturate-50" : ""} ${
        data.highlighted ? "ring-4 ring-orange/40 scale-[1.04]" : ""
      } ${selected ? "ring-2 ring-ink/60" : ""} hover:scale-[1.03] hover:z-10`}
    >
      <Handle type="target" position={targetPos} className="!opacity-0 !w-2 !h-2" />

      <div className="flex items-start gap-1.5">
        <Icon
          className={`w-3.5 h-3.5 mt-[2px] shrink-0 ${style.accent}`}
          strokeWidth={2}
        />
        <span className={`${style.accent} break-words flex-1`}>{data.label}</span>
      </div>

      {/* Indicador de fragmento fuente */}
      {clickable && (
        <span
          className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-orange rounded-full ring-2 ring-paper animate-pulse"
          title="Tiene fragmento fuente"
        />
      )}

      {/* Botón expand/collapse — visible si tiene hijos */}
      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle(data.id);
          }}
          className={`absolute ${
            data.layoutDir === "LR"
              ? "-right-2.5 top-1/2 -translate-y-1/2"
              : "-bottom-2.5 left-1/2 -translate-x-1/2"
          } w-5 h-5 inline-flex items-center justify-center bg-paper border-2 border-ink/60 rounded-full text-ink hover:bg-ink hover:text-paper transition-colors shadow-soft z-20`}
          title={data.collapsed ? "Expandir" : "Colapsar"}
          aria-label={data.collapsed ? "Expandir" : "Colapsar"}
        >
          {data.collapsed ? (
            data.layoutDir === "LR" ? (
              <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
            ) : (
              <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
            )
          ) : (
            <X className="w-2.5 h-2.5" strokeWidth={2.5} />
          )}
        </button>
      )}

      <Handle type="source" position={sourcePos} className="!opacity-0 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { mind: MindNode };

// ============================================================
// Layout con dagre — soporta TB y LR
// ============================================================
function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  dir: LayoutDir,
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: dir,
    nodesep: dir === "LR" ? 30 : 50,
    ranksep: dir === "LR" ? 110 : 90,
    marginx: 30,
    marginy: 30,
  });

  nodes.forEach((n) => g.setNode(n.id, { width: 240, height: 70 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const laidOut = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - 120, y: pos.y - 35 },
      sourcePosition: dir === "LR" ? Position.Right : Position.Bottom,
      targetPosition: dir === "LR" ? Position.Left : Position.Top,
    };
  });
  return { nodes: laidOut, edges };
}

// ============================================================
// Helpers de grafo: descendientes, raíces, etc.
// ============================================================
function buildAdjacency(edges: MindmapEdgeData[]): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  for (const e of edges) {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  }
  return adj;
}

function getDescendants(rootId: string, adj: Record<string, string[]>): Set<string> {
  const out = new Set<string>();
  const stack = [...(adj[rootId] ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    for (const n of adj[id] ?? []) stack.push(n);
  }
  return out;
}

function getAncestors(
  targetId: string,
  edges: MindmapEdgeData[],
): Set<string> {
  const reverse: Record<string, string[]> = {};
  for (const e of edges) {
    if (!reverse[e.target]) reverse[e.target] = [];
    reverse[e.target].push(e.source);
  }
  const out = new Set<string>();
  const stack = [...(reverse[targetId] ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    for (const n of reverse[id] ?? []) stack.push(n);
  }
  return out;
}

// ============================================================
// Inner viewer (necesita estar dentro de ReactFlowProvider)
// ============================================================

function MindMapInner({ content }: MindMapViewerProps) {
  const [selected, setSelected] = useState<MindmapNodeData | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [layoutDir, setLayoutDir] = useState<LayoutDir>("TB");
  const [fullscreen, setFullscreen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const adjacency = useMemo(() => buildAdjacency(content.edges), [content.edges]);

  const handleSelect = useCallback((n: MindmapNodeData) => {
    setSelected(n);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // IDs ocultos por colapso
  const hiddenIds = useMemo(() => {
    const out = new Set<string>();
    for (const root of collapsed) {
      const desc = getDescendants(root, adjacency);
      desc.forEach((d) => out.add(d));
    }
    return out;
  }, [collapsed, adjacency]);

  // Búsqueda → IDs que coinciden + sus ancestros (para mostrar contexto)
  const { matchedIds, focusIds } = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { matchedIds: new Set<string>(), focusIds: new Set<string>() };
    const matched = new Set<string>();
    const focus = new Set<string>();
    for (const n of content.nodes) {
      if (n.label.toLowerCase().includes(q)) {
        matched.add(n.id);
        focus.add(n.id);
        getAncestors(n.id, content.edges).forEach((a) => focus.add(a));
        getDescendants(n.id, adjacency).forEach((d) => focus.add(d));
      }
    }
    return { matchedIds: matched, focusIds: focus };
  }, [search, content.nodes, content.edges, adjacency]);

  // Hover: dim everyone except this node + its ancestors + descendants
  const focusFromHover = useMemo(() => {
    if (!hoveredId) return null;
    const out = new Set<string>([hoveredId]);
    getAncestors(hoveredId, content.edges).forEach((a) => out.add(a));
    getDescendants(hoveredId, adjacency).forEach((d) => out.add(d));
    return out;
  }, [hoveredId, content.edges, adjacency]);

  // Construir nodos visibles + estado computado
  const initial = useMemo(() => {
    const visibleNodes = content.nodes.filter((n) => !hiddenIds.has(n.id));
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = content.edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target),
    );

    const flowNodes: Node[] = visibleNodes.map((n) => {
      const hasChildren = (adjacency[n.id]?.length ?? 0) > 0;
      const dimByHover = focusFromHover ? !focusFromHover.has(n.id) : false;
      const dimBySearch = search.trim() ? !focusIds.has(n.id) : false;
      return {
        id: n.id,
        type: "mind",
        position: { x: 0, y: 0 },
        data: {
          ...n,
          onSelect: handleSelect,
          onToggle: handleToggle,
          hasChildren,
          collapsed: collapsed.has(n.id),
          dimmed: dimByHover || dimBySearch,
          highlighted: matchedIds.has(n.id),
          layoutDir,
        } satisfies FlowNodeData,
      };
    });

    const flowEdges: Edge[] = visibleEdges.map((e, idx) => {
      const dim =
        (focusFromHover && (!focusFromHover.has(e.source) || !focusFromHover.has(e.target))) ||
        (search.trim() && (!focusIds.has(e.source) || !focusIds.has(e.target)));
      return {
        id: `e-${idx}-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: "smoothstep",
        animated: matchedIds.has(e.target),
        labelStyle: {
          fontSize: 10,
          fontFamily: "var(--font-mono, ui-monospace)",
          fill: "hsl(var(--ink) / 0.55)",
        },
        labelBgStyle: { fill: "hsl(var(--paper))", fillOpacity: 0.95 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke: matchedIds.has(e.target) ? "hsl(var(--orange))" : "hsl(var(--ink) / 0.3)",
          strokeWidth: matchedIds.has(e.target) ? 2 : 1.5,
          opacity: dim ? 0.15 : 1,
          transition: "opacity 200ms, stroke 200ms, stroke-width 200ms",
        },
      };
    });

    return layoutGraph(flowNodes, flowEdges, layoutDir);
  }, [
    content,
    handleSelect,
    handleToggle,
    collapsed,
    hiddenIds,
    adjacency,
    layoutDir,
    matchedIds,
    focusIds,
    focusFromHover,
    search,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // Re-aplicar layout cuando cambia la estructura
  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
    // Refit cuando cambia el layout direction
    requestAnimationFrame(() => {
      fitView({ padding: 0.18, duration: 500 });
    });
  }, [initial.nodes, initial.edges, setNodes, setEdges, fitView]);

  // ESC para cerrar fullscreen / drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else if (fullscreen) setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, fullscreen]);

  if (!content.nodes.length) {
    return (
      <div className="border-2 border-dashed border-border bg-paper p-12 text-center rounded-xl">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-ink/30" strokeWidth={1.5} />
        <p className="text-ink/60 text-sm">No hay mapa mental disponible para este documento.</p>
      </div>
    );
  }

  // Stats
  const totalNodes = content.nodes.length;
  const visibleCount = nodes.length;
  const interactiveCount = content.nodes.filter((n) => n.chunk_id).length;

  return (
    <div className="relative" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-orange rounded-full shadow-[0_0_8px_var(--orange)]" />
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink/45 font-mono">
              Mapa mental
            </p>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink tracking-tight">
            Estructura del documento
          </h2>
          <p className="text-[12.5px] text-ink/55 mt-1">
            {visibleCount}/{totalNodes} nodos visibles · {interactiveCount} con fragmento fuente
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/35"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el mapa..."
              className="w-44 sm:w-56 pl-8 pr-3 py-1.5 text-[12.5px] bg-paper border border-border rounded-full focus:border-ink/40 focus:ring-2 focus:ring-ink/5 focus:outline-none transition-all placeholder:text-ink/35"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ink/40 hover:text-ink"
                aria-label="Limpiar"
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Layout toggle */}
          <div className="flex items-center bg-cream border border-border rounded-full p-0.5">
            <button
              onClick={() => setLayoutDir("TB")}
              className={`p-1.5 rounded-full transition-colors ${
                layoutDir === "TB"
                  ? "bg-paper shadow-soft text-ink"
                  : "text-ink/45 hover:text-ink"
              }`}
              title="Layout vertical"
            >
              <Network className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={() => setLayoutDir("LR")}
              className={`p-1.5 rounded-full transition-colors ${
                layoutDir === "LR"
                  ? "bg-paper shadow-soft text-ink"
                  : "text-ink/45 hover:text-ink"
              }`}
              title="Layout horizontal"
            >
              <Workflow className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          {collapsed.size > 0 && (
            <button
              onClick={() => setCollapsed(new Set())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-paper border border-border rounded-full hover:border-ink/30 transition-colors text-ink/75"
              title="Expandir todo"
            >
              <RefreshCw className="w-3 h-3" strokeWidth={2} />
              Expandir todo
            </button>
          )}

          <button
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-paper border border-border rounded-full hover:border-ink/30 transition-colors text-ink/75"
            title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {fullscreen ? (
              <Minimize2 className="w-3 h-3" strokeWidth={2} />
            ) : (
              <Maximize2 className="w-3 h-3" strokeWidth={2} />
            )}
            {fullscreen ? "Salir" : "Expandir"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className={`relative bg-paper border border-border overflow-hidden rounded-xl shadow-soft transition-all ${
          fullscreen
            ? "fixed inset-4 z-50 !rounded-2xl shadow-elevated"
            : ""
        }`}
        style={fullscreen ? undefined : { height: "min(72vh, 720px)" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={(_, n) => setHoveredId(n.id)}
          onNodeMouseLeave={() => setHoveredId(null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.25}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
        >
          <Background
            gap={28}
            size={1.2}
            color="hsl(var(--ink) / 0.07)"
          />
          <Controls
            className="!bg-paper !border !border-border !shadow-soft !rounded-lg overflow-hidden"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-paper !border !border-border !rounded-lg overflow-hidden"
            nodeColor={(n) => {
              const t = (n.data as FlowNodeData)?.type;
              if (t === "main") return "hsl(var(--orange))";
              if (t === "sub") return "hsl(var(--ink))";
              if (t === "formula") return "hsl(var(--orange) / 0.5)";
              return "hsl(var(--ink) / 0.35)";
            }}
            maskColor="hsl(var(--paper) / 0.75)"
            pannable
            zoomable
          />

          {/* Leyenda */}
          <Panel
            position="top-right"
            className="!bg-paper/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2.5 text-[10.5px] font-mono uppercase tracking-wider text-ink/65 shadow-soft"
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] tracking-[0.22em] text-ink/40 mb-0.5">Tipos</p>
              <LegendItem color="bg-gradient-orange" label="Tema central" />
              <LegendItem color="bg-paper border border-ink" label="Subtema" />
              <LegendItem color="bg-cream border border-border" label="Detalle" />
              <LegendItem color="bg-orange/10 border border-orange/50" label="Fórmula" />
              <LegendItem color="bg-paper border-2 border-dashed border-ink/40" label="Ejemplo" />
            </div>
          </Panel>

          {/* Tip inferior */}
          <Panel
            position="bottom-left"
            className="!bg-paper/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-[10.5px] font-mono text-ink/55 shadow-soft hidden md:block"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" strokeWidth={2} />
                Hover: foco
              </span>
              <span className="text-ink/20">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-orange rounded-full" />
                Click: fragmento
              </span>
            </div>
          </Panel>

          {/* Empty filter result */}
          {search.trim() && matchedIds.size === 0 && (
            <Panel
              position="top-center"
              className="!bg-paper border border-border rounded-lg px-4 py-2 text-[12px] text-ink/65 shadow-elevated"
            >
              Sin coincidencias para "{search}"
            </Panel>
          )}
        </ReactFlow>

        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-3 right-3 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-paper border border-border rounded-full hover:border-ink/30 transition-colors text-ink/75 shadow-elevated"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
            Cerrar
          </button>
        )}
      </div>

      {/* Drawer fragmento fuente */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setSelected(null)}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-paper border-l border-border z-50 overflow-y-auto animate-slide-in-right shadow-elevated">
            <div className="sticky top-0 bg-paper border-b border-border px-6 py-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-orange">
                  Fragmento fuente
                </span>
                <h3 className="font-display text-[17px] font-semibold mt-1 leading-tight text-ink">
                  {selected.label}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-cream transition-colors -mt-1 rounded-md"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selected.excerpt ? (
                <blockquote className="border-l-4 border-orange pl-4 py-3 text-[13.5px] leading-relaxed text-ink/85 bg-cream/40 rounded-r-md">
                  {selected.excerpt}
                  <span className="text-ink/40">…</span>
                </blockquote>
              ) : (
                <p className="text-sm text-ink/50 italic">
                  Este nodo no tiene un fragmento fuente asociado.
                </p>
              )}
              <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink/45 pt-2 border-t border-border">
                Tipo · {selected.type}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

// ============================================================
// Wrapper con Provider (necesario para useReactFlow)
// ============================================================
export function MindMapViewer({ content }: MindMapViewerProps) {
  return (
    <ReactFlowProvider>
      <MindMapInner content={content} />
    </ReactFlowProvider>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
      <span className="normal-case tracking-normal text-[10.5px]">{label}</span>
    </div>
  );
}
