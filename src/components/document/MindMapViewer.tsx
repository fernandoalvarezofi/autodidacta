import { useMemo, useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronRight, X, Sparkles, FunctionSquare, Lightbulb, FileText, BookOpen } from "lucide-react";

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

const LEAF_ICON: Record<string, typeof FileText> = {
  detail: FileText,
  formula: FunctionSquare,
  example: Lightbulb,
};

interface TreeNode {
  node: MindmapNodeData;
  children: TreeNode[];
}

function buildTree(content: MindmapContent): { main: TreeNode | null; subs: TreeNode[] } {
  const byId = new Map(content.nodes.map((n) => [n.id, n]));
  const childrenOf: Record<string, string[]> = {};
  const hasParent = new Set<string>();
  for (const e of content.edges) {
    if (!childrenOf[e.source]) childrenOf[e.source] = [];
    childrenOf[e.source].push(e.target);
    hasParent.add(e.target);
  }
  const build = (id: string, seen: Set<string>): TreeNode | null => {
    if (seen.has(id)) return null;
    seen.add(id);
    const node = byId.get(id);
    if (!node) return null;
    const kids = (childrenOf[id] ?? [])
      .map((cid) => build(cid, seen))
      .filter((x): x is TreeNode => x !== null);
    return { node, children: kids };
  };

  const mainNode = content.nodes.find((n) => n.type === "main");
  if (mainNode) {
    const seen = new Set<string>();
    const tree = build(mainNode.id, seen);
    return { main: tree, subs: tree?.children ?? [] };
  }
  // fallback: roots = sin parent
  const roots = content.nodes.filter((n) => !hasParent.has(n.id));
  const seen = new Set<string>();
  const subs = roots.map((r) => build(r.id, seen)).filter((x): x is TreeNode => x !== null);
  return { main: null, subs };
}

export function MindMapViewer({ content }: MindMapViewerProps) {
  const { main, subs } = useMemo(() => buildTree(content), [content]);

  // Inicialmente todos los "sub" expandidos
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<MindmapNodeData | null>(null);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => {
    const all = new Set<string>();
    const walk = (t: TreeNode) => {
      if (t.children.length > 0) all.add(t.node.id);
      t.children.forEach(walk);
    };
    subs.forEach(walk);
    setCollapsed(all);
  };

  // ESC cierra panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  if (!content.nodes.length) {
    return (
      <div className="border-2 border-dashed border-border bg-paper p-12 text-center rounded-lg">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-ink/30" strokeWidth={1.5} />
        <p className="text-ink/60 text-sm">No hay mapa mental disponible.</p>
      </div>
    );
  }

  return (
    <div className="relative flex gap-6 h-full">
      <div className={`flex-1 min-w-0 overflow-y-auto pr-2 ${selected ? "lg:pr-0" : ""}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink/45 font-mono inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange rounded-full" />
            Mapa mental
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs border border-border rounded-md hover:border-ink/40 hover:bg-cream transition-colors text-ink/70"
            >
              Expandir todo
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs border border-border rounded-md hover:border-ink/40 hover:bg-cream transition-colors text-ink/70"
            >
              Colapsar todo
            </button>
          </div>
        </div>

        {/* Main node */}
        {main && (
          <h2 className="font-display text-2xl font-semibold text-ink border-b-2 border-orange pb-3 mb-6 w-full">
            {main.node.label}
          </h2>
        )}

        {/* Subs */}
        <ul className="space-y-1">
          {subs.map((sub) => (
            <SubBranch
              key={sub.node.id}
              tree={sub}
              collapsed={collapsed}
              onToggle={toggle}
              onSelect={(n) => n.excerpt && setSelected(n)}
            />
          ))}
        </ul>
      </div>

      {/* Panel desktop */}
      {selected && (
        <aside className="hidden lg:block w-72 shrink-0 bg-cream border-l border-border p-4 overflow-y-auto">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-base font-medium text-ink leading-tight">
              {selected.label}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="text-ink/50 hover:text-ink p-1 -m-1 rounded"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
            {selected.excerpt}
          </p>
        </aside>
      )}

      {/* Bottom sheet mobile */}
      {selected && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 max-h-[55vh] bg-paper border-t border-border p-4 rounded-t-xl shadow-elevated overflow-y-auto animate-slide-in-up">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-base font-medium text-ink leading-tight">
              {selected.label}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="text-ink/50 hover:text-ink p-2 -m-2 rounded min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
            {selected.excerpt}
          </p>
        </div>
      )}
    </div>
  );
}

function SubBranch({
  tree,
  collapsed,
  onToggle,
  onSelect,
}: {
  tree: TreeNode;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (n: MindmapNodeData) => void;
}) {
  const isCollapsed = collapsed.has(tree.node.id);
  const hasChildren = tree.children.length > 0;
  const isExpanded = !isCollapsed && hasChildren;

  return (
    <li>
      <button
        onClick={() => {
          if (hasChildren) onToggle(tree.node.id);
          if (tree.node.excerpt) onSelect(tree.node);
        }}
        className={`w-full flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-cream transition-colors font-medium text-base text-ink text-left min-h-[44px] ${
          isExpanded ? "bg-cream/60 border-l-2 border-orange" : ""
        }`}
      >
        {hasChildren ? (
          isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-ink/50 shrink-0" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-4 h-4 text-orange shrink-0" strokeWidth={2} />
          )
        ) : (
          <BookOpen className="w-4 h-4 text-ink/40 shrink-0" strokeWidth={1.75} />
        )}
        <span className="flex-1 truncate">{tree.node.label}</span>
        {tree.node.excerpt && (
          <span
            className="w-1.5 h-1.5 bg-orange rounded-full shrink-0"
            title="Tiene fragmento fuente"
          />
        )}
      </button>

      {isExpanded && (
        <ul className="ml-4 pl-3 border-l border-border space-y-1 mt-1 mb-2">
          {tree.children.map((child) =>
            child.children.length > 0 ? (
              <SubBranch
                key={child.node.id}
                tree={child}
                collapsed={collapsed}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ) : (
              <LeafItem key={child.node.id} node={child.node} onSelect={onSelect} />
            ),
          )}
        </ul>
      )}
    </li>
  );
}

function LeafItem({
  node,
  onSelect,
}: {
  node: MindmapNodeData;
  onSelect: (n: MindmapNodeData) => void;
}) {
  const Icon = LEAF_ICON[node.type] ?? FileText;
  const clickable = !!node.excerpt;
  return (
    <li>
      <button
        onClick={() => clickable && onSelect(node)}
        disabled={!clickable}
        className={`w-full py-1.5 px-2 text-sm text-ink/70 text-left flex items-start gap-2 rounded ${
          clickable ? "hover:bg-cream/60 hover:text-ink cursor-pointer" : "cursor-default"
        }`}
      >
        <span className="text-ink/40 mt-0.5 shrink-0">·</span>
        <Icon className="w-3 h-3 text-ink/40 mt-1 shrink-0" strokeWidth={2} />
        <span className="flex-1">{node.label}</span>
        {clickable && (
          <span className="w-1 h-1 bg-orange/60 rounded-full mt-2 shrink-0" />
        )}
      </button>
    </li>
  );
}
