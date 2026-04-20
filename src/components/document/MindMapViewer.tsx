import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { X, Sparkles, BookOpen, Lightbulb, FunctionSquare, FileText } from "lucide-react";

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

// =====================================================
// Custom node renderer — editorial, paper-feel
// =====================================================
type FlowNodeData = MindmapNodeData & { onSelect: (n: MindmapNodeData) => void };

const TYPE_STYLES: Record<
  MindmapNodeData["type"],
  { bg: string; border: string; icon: typeof Sparkles; accent: string; size: string }
> = {
  main: {
    bg: "bg-gradient-orange",
    border: "border-orange shadow-orange",
    icon: Sparkles,
    accent: "text-paper",
    size: "px-5 py-3.5 text-base font-display font-semibold max-w-[260px]",
  },
  sub: {
    bg: "bg-paper",
    border: "border-ink shadow-[0_2px_0_0_hsl(var(--ink))]",
    icon: BookOpen,
    accent: "text-ink",
    size: "px-4 py-2.5 text-sm font-display font-medium max-w-[220px]",
  },
  detail: {
    bg: "bg-cream",
    border: "border-border",
    icon: FileText,
    accent: "text-ink/80",
    size: "px-3 py-2 text-xs max-w-[200px]",
  },
  formula: {
    bg: "bg-orange/10",
    border: "border-orange/50",
    icon: FunctionSquare,
    accent: "text-orange-deep",
    size: "px-3 py-2 text-xs font-mono max-w-[200px]",
  },
  example: {
    bg: "bg-paper",
    border: "border-dashed border-ink/40",
    icon: Lightbulb,
    accent: "text-ink/70",
    size: "px-3 py-2 text-xs italic max-w-[200px]",
  },
};

function MindNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const style = TYPE_STYLES[data.type];
  const Icon = style.icon;
  const clickable = !!data.chunk_id;
  return (
    <div
      onClick={() => clickable && data.onSelect(data)}
      className={`relative ${style.bg} ${style.border} ${style.size} border-2 transition-all ${
        clickable
          ? "cursor-pointer hover:scale-[1.04] hover:shadow-orange"
          : "cursor-default"
      } leading-snug`}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-2 !h-2" />
      <div className="flex items-start gap-1.5">
        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${style.accent}`} strokeWidth={2} />
        <span className={`${style.accent} break-words`}>{data.label}</span>
      </div>
      {clickable && (
        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-orange rounded-full ring-2 ring-paper" />
      )}
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { mind: MindNode };

// =====================================================
// Layout con dagre
// =====================================================
function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80, marginx: 30, marginy: 30 });

  nodes.forEach((n) => g.setNode(n.id, { width: 240, height: 70 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const laidOut = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - 120, y: pos.y - 35 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });
  return { nodes: laidOut, edges };
}

// =====================================================
// Viewer principal
// =====================================================
export function MindMapViewer({ content }: MindMapViewerProps) {
  const [selected, setSelected] = useState<MindmapNodeData | null>(null);

  const handleSelect = useCallback((n: MindmapNodeData) => {
    setSelected(n);
  }, []);

  const initial = useMemo(() => {
    const flowNodes: Node[] = content.nodes.map((n) => ({
      id: n.id,
      type: "mind",
      position: { x: 0, y: 0 },
      data: { ...n, onSelect: handleSelect } satisfies FlowNodeData,
    }));

    const flowEdges: Edge[] = content.edges.map((e, idx) => ({
      id: `e-${idx}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label,
      type: "smoothstep",
      animated: false,
      labelStyle: {
        fontSize: 10,
        fontFamily: "var(--font-mono, ui-monospace)",
        fill: "hsl(var(--ink) / 0.5)",
      },
      labelBgStyle: { fill: "hsl(var(--paper))", fillOpacity: 0.9 },
      style: { stroke: "hsl(var(--ink) / 0.3)", strokeWidth: 1.5 },
    }));

    return layoutGraph(flowNodes, flowEdges);
  }, [content, handleSelect]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initial.edges);

  // Re-layout cuando cambia el content
  useEffect(() => {
    setNodes(initial.nodes);
  }, [initial.nodes, setNodes]);

  if (!content.nodes.length) {
    return (
      <div className="border-2 border-dashed border-border bg-paper p-12 text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-ink/30" strokeWidth={1.5} />
        <p className="text-ink/60 text-sm">No hay mapa mental disponible para este documento.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Mapa mental</h2>
          <p className="text-xs font-mono uppercase tracking-wider text-ink/50 mt-1">
            {content.nodes.length} nodos · click en los nodos con punto naranja para ver el fragmento
          </p>
        </div>
      </div>

      <div
        className="relative bg-paper border-2 border-ink/15 overflow-hidden"
        style={{ height: "min(72vh, 720px)" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
        >
          <Background gap={24} size={1} color="hsl(var(--ink) / 0.08)" />
          <Controls
            className="!bg-paper !border-2 !border-ink/15 !shadow-none"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-cream !border-2 !border-ink/15"
            nodeColor={(n) => {
              const t = (n.data as FlowNodeData)?.type;
              if (t === "main") return "hsl(var(--orange))";
              if (t === "sub") return "hsl(var(--ink))";
              if (t === "formula") return "hsl(var(--orange) / 0.5)";
              return "hsl(var(--ink) / 0.4)";
            }}
            maskColor="hsl(var(--paper) / 0.7)"
            pannable
            zoomable
          />
          <Panel
            position="top-right"
            className="!bg-paper/90 backdrop-blur-sm border-2 border-ink/15 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-ink/60"
          >
            <div className="flex flex-col gap-1">
              <LegendItem color="bg-gradient-orange" label="Tema central" />
              <LegendItem color="bg-paper border border-ink" label="Subtema" />
              <LegendItem color="bg-cream border border-border" label="Detalle" />
              <LegendItem color="bg-orange/10 border border-orange/50" label="Fórmula" />
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Drawer del fragmento fuente */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setSelected(null)}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-paper border-l-2 border-ink z-50 overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-paper border-b-2 border-ink px-6 py-4 flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-orange">
                  Fragmento fuente
                </span>
                <h3 className="font-display text-lg font-semibold mt-1 leading-tight">
                  {selected.label}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-cream transition-colors -mt-1"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selected.excerpt ? (
                <blockquote className="border-l-4 border-orange pl-4 py-2 text-sm leading-relaxed text-ink/85 bg-cream/40">
                  {selected.excerpt}
                  <span className="text-ink/40">…</span>
                </blockquote>
              ) : (
                <p className="text-sm text-ink/50 italic">
                  Este nodo no tiene un fragmento fuente asociado.
                </p>
              )}
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink/40 pt-2 border-t border-border">
                Tipo: {selected.type}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 ${color}`} />
      <span>{label}</span>
    </div>
  );
}
