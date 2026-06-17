import { Link, useRouterState } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';

type NavItem = {
  name: string;
  icon: LucideIcon;
  to?: string;
  disabled?: boolean;
};

// Updated navigation items
const coreNavItems: NavItem[] = [
  { name: 'Daybook', icon: BookOpen, to: '/daybook' },
  { name: 'People', icon: Users, to: '/people' },
  { name: 'Analytics', icon: BarChart3, to: '/analytics' },
  { name: 'Finances', icon: Wallet, to: '/finances' },
  { name: 'Settings', icon: Settings, to: '/settings' },
];

function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Core Operations
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {coreNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.name}>
                {item.to && !item.disabled ? (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.to}
                    tooltip={item.name}
                  >
                    <Link to={item.to}>
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton disabled tooltip={item.name}>
                    <Icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const coldStorageName = useColdStorageStore(
    (s) => s.coldStorage?.name ?? 'Cold Storage',
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/daybook" search={{ tab: "incoming" }}>
                <img
                  src="/favicon.svg"
                  alt="Coldop"
                  className="size-8 shrink-0 rounded-md"
                />
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm tracking-tight">
                    <span className="font-semibold text-sidebar-foreground">
                      Coldop
                    </span>
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      1.0.0
                    </span>
                  </span>
                  {coldStorageName ? (
                    <span
                      className="truncate text-xs text-muted-foreground"
                      title={coldStorageName}
                    >
                      {coldStorageName}
                    </span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}