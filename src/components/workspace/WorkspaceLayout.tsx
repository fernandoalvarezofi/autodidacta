import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, PanelLeftClose, PanelLeft } from "lucide-react";

export interface WorkspaceItem {
  key: string;
  label: string;
  icon: ReactNode;
  count?: number;
  badge?: string;
  highlight?: boolean;
}

export interface WorkspaceGroup {
  label?: string;
  items: WorkspaceItem[];
}

interface WorkspaceLayoutProps {
  /** Título grande arriba del sidebar */
  title: string;
  /** Subtítulo/etiqueta tipo "DOCUMENTO" o "CUADERNO" */
  eyebrow?: string;
  /** Emoji o icono opcional al lado del título */
  emoji?: string;
  /** Link "volver" en el footer del sidebar */
  backTo?: { to: string; params?: Record<string, string>; label: string };
  /** Grupos de items navegables */
  groups: WorkspaceGroup[];
  /** Item activo */
  activeKey: string;
  onItemSelect: (key: string) => void;
  /** Acción extra opcional en el header del sidebar (ej: "Editar como nota") */
  headerAction?: ReactNode;
  /** Contenido principal */
  children: ReactNode;
  /** Si true, el área central NO restringe el ancho (para mapa mental, etc) */
  wide?: boolean;
}

export function WorkspaceLayout({
  title,
  eyebrow,
  emoji,
  backTo,
  groups,
  activeKey,
  onItemSelect,
  headerAction,
  children,
  wide = false,
}: WorkspaceLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-paper">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-cream/40 transition-[width] duration-200 ease-out ${
          collapsed ? "w-14" : "w-72"
        }`}
      >
        {/* Header del sidebar */}
        <div className={`flex items-start gap-2 px-3 pt-4 pb-3 border-b border-border/60 ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 text-ink/60 hover:text-ink hover:bg-paper rounded-md transition-colors"
              title="Expandir"
            >
              <PanelLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                {eyebrow && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-orange/90 mb-1.5">
                    {eyebrow}
                  </p>
                )}
                <h2 className="font-display text-[20px] leading-tight text-ink truncate">
                  {emoji && <span className="mr-1.5">{emoji}</span>}
                  {title}
                </h2>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 text-ink/50 hover:text-ink hover:bg-paper rounded-md transition-colors flex-shrink-0"
                title="Colapsar"
              >
                <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        {/* Acción extra (ej: Editar como nota) */}
        {headerAction && !collapsed && (
          <div className="px-3 py-2.5 border-b border-border/60">{headerAction}</div>
        )}

        {/* Grupos de items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.label && !collapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-ink/40">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.key === activeKey;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => onItemSelect(item.key)}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-md transition-all relative group ${
                          active
                            ? "bg-paper text-ink font-medium shadow-soft"
                            : "text-ink/70 hover:text-ink hover:bg-paper/60"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-orange rounded-full" />
                        )}
                        <span className={`flex-shrink-0 ${active ? "text-orange" : "text-ink/55 group-hover:text-ink/80"}`}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {item.count !== undefined && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  active
                                    ? "bg-orange/15 text-orange-deep"
                                    : "bg-cream/80 text-ink/55"
                                }`}
                              >
                                {item.count}
                              </span>
                            )}
                            {item.badge && (
                              <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange/15 text-orange-deep">
                                {item.badge}
                              </span>
                            )}
                            {item.highlight && !active && (
                              <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse" />
                            )}
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {backTo && !collapsed && (
          <div className="border-t border-border/60 p-2.5">
            <Link
              // @ts-expect-error dynamic route
              to={backTo.to}
              params={backTo.params}
              className="flex items-center gap-2 px-2.5 py-2 text-xs text-ink/55 hover:text-ink hover:bg-paper/70 rounded-md transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.75} />
              <span className="truncate">{backTo.label}</span>
            </Link>
          </div>
        )}
      </aside>

      {/* Área central */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className={`flex-1 flex flex-col min-h-0 ${wide ? "" : "items-stretch"}`}>
          {wide ? (
            <div className="flex-1 overflow-y-auto">{children}</div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-3xl px-4 sm:px-6">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
