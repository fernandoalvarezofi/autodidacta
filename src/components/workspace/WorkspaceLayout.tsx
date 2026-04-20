import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, PanelLeftClose, PanelLeft, Menu, X } from "lucide-react";
import { EntityIcon } from "@/components/ui/EntityIcon";

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
  title: string;
  eyebrow?: string;
  emoji?: string;
  subtitle?: ReactNode;
  backTo?: { to: string; params?: Record<string, string>; label: string };
  groups: WorkspaceGroup[];
  activeKey: string;
  onItemSelect: (key: string) => void;
  headerAction?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

export function WorkspaceLayout({
  title,
  eyebrow,
  emoji,
  subtitle,
  backTo,
  groups,
  activeKey,
  onItemSelect,
  headerAction,
  children,
  wide = false,
}: WorkspaceLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelect = (key: string) => {
    onItemSelect(key);
    if (isMobile) setMobileOpen(false);
  };

  const activeItem = groups.flatMap((g) => g.items).find((i) => i.key === activeKey);

  const Sidebar = (
    <aside
      className={`flex flex-col bg-cream/40 transition-[width] duration-200 ease-out h-full ${
        isMobile
          ? "w-72 border-r border-border shadow-elevated"
          : `border-r border-border ${collapsed ? "w-14" : "w-72"}`
      }`}
    >
      <div
        className={`flex items-start gap-2 px-3 pt-4 pb-3 border-b border-border/60 ${
          !isMobile && collapsed ? "justify-center" : ""
        }`}
      >
        {!isMobile && collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 text-ink/60 hover:text-ink hover:bg-paper rounded-md transition-colors"
            title="Expandir"
          >
            <PanelLeft className="w-4 h-4" strokeWidth={1.75} />
          </button>
        ) : (
          <>
            <div className="flex-1 min-w-0 flex items-start gap-2.5">
              {emoji && (
                <div className="flex-shrink-0 mt-0.5">
                  <EntityIcon value={emoji} size={36} flat />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {eyebrow && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-orange/90 mb-1.5">
                    {eyebrow}
                  </p>
                )}
                <h2 className="font-display text-[20px] leading-tight text-ink truncate">
                  {title}
                </h2>
                {subtitle && <div className="mt-1.5">{subtitle}</div>}
              </div>
            </div>
            <button
              onClick={() => (isMobile ? setMobileOpen(false) : setCollapsed(true))}
              className="p-1.5 text-ink/50 hover:text-ink hover:bg-paper rounded-md transition-colors flex-shrink-0"
              title={isMobile ? "Cerrar" : "Colapsar"}
            >
              {isMobile ? (
                <X className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          </>
        )}
      </div>

      {headerAction && (isMobile || !collapsed) && (
        <div className="px-3 py-2.5 border-b border-border/60">{headerAction}</div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (isMobile || !collapsed) && (
              <p className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-ink/40">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.key === activeKey;
                const showLabels = isMobile || !collapsed;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => handleSelect(item.key)}
                      title={!showLabels ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-md transition-all relative group ${
                        active
                          ? "bg-paper text-ink font-medium shadow-soft"
                          : "text-ink/70 hover:text-ink hover:bg-paper/60"
                      } ${!showLabels ? "justify-center" : ""}`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-orange rounded-full" />
                      )}
                      <span
                        className={`flex-shrink-0 ${
                          active ? "text-orange" : "text-ink/55 group-hover:text-ink/80"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {showLabels && (
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

      {backTo && (isMobile || !collapsed) && (
        <div className="border-t border-border/60 p-2.5">
          <Link
            to={backTo.to as string}
            params={backTo.params as never}
            className="flex items-center gap-2 px-2.5 py-2 text-xs text-ink/55 hover:text-ink hover:bg-paper/70 rounded-md transition-colors group"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
              strokeWidth={1.75}
            />
            <span className="truncate">{backTo.label}</span>
          </Link>
        </div>
      )}
    </aside>
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] bg-paper overflow-hidden">
      {/* Sidebar desktop */}
      {!isMobile && Sidebar}

      {/* Sidebar mobile (drawer) */}
      {isMobile && mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-14 bottom-0 z-50 animate-slide-in-up">
            {Sidebar}
          </div>
        </>
      )}

      {/* Área central */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile con botón menú + título del item activo */}
        {isMobile && (
          <div className="flex items-center gap-2 px-3 h-12 border-b border-border bg-paper/90 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 text-ink/70 hover:text-ink hover:bg-cream rounded-md transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {activeItem && (
                <span className="text-orange flex-shrink-0">{activeItem.icon}</span>
              )}
              <span className="text-sm font-medium text-ink truncate">
                {activeItem?.label ?? title}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/40 truncate max-w-[40%]">
              {title}
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          {wide ? (
            <div className="flex-1 overflow-y-auto">{children}</div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-3xl px-3 sm:px-6">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
