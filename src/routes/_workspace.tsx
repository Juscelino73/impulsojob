import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, FileText, LayoutDashboard, ListChecks, Loader2, Moon, Search, Settings, Sparkles, Sun, UserRound,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand";
import { useSession } from "@/lib/session";
import { ErrorState } from "@/components/common";

export const Route = createFileRoute("/_workspace")({ component: WorkspaceLayout });

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Encontrar vagas", icon: Search },
  { to: "/matches", label: "Meus matches", icon: Sparkles },
  { to: "/resume", label: "Resume Studio", icon: FileText },
  { to: "/applications", label: "Minhas candidaturas", icon: ListChecks },
  { to: "/profile", label: "Perfil profissional", icon: UserRound },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(localStorage.getItem("impulso-theme") === "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const toggle = () => {
    const next = !dark;
    localStorage.setItem("impulso-theme", next ? "dark" : "light");
    setDark(next);
  };
  return { dark, toggle };
}

function WorkspaceLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { ready, error } = useSession();
  const { dark, toggle } = useTheme();
  const current = NAV.find((n) => path.startsWith(n.to));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-4">
          <Logo to="/dashboard" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((n) => {
                  const active = path.startsWith(n.to);
                  return (
                    <SidebarMenuItem key={n.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="h-10 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      >
                        <Link to={n.to}>
                          <n.icon />
                          <span>{n.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
            <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Briefcase className="size-3.5" /> Workspace anônimo
            </p>
            Seus dados ficam privados neste navegador.{" "}
            <Link to="/settings" className="text-accent underline-offset-2 hover:underline">
              Gerenciar
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground">{current?.label ?? "Impulso"}</span>
          <div className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/jobs">
                <Search /> <span className="hidden sm:inline">Adicionar vaga</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Configurações">
              <Link to="/settings">
                <Settings />
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
          {error ? (
            <ErrorState message={`Não foi possível iniciar seu workspace: ${error}`} onRetry={() => location.reload()} />
          ) : !ready ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Preparando seu workspace…
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
