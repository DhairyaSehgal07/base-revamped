import { Link, useRouterState } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Building2,
  Layers,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { useStoreAdminStore } from '@/features/auth/store/use-store-admin-store';

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
  { name: 'Settings', icon: Layers, to: '/settings' },
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
  const userRole = useStoreAdminStore((s) => s.storeAdmin?.role);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/daybook">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span
                    className="truncate font-semibold text-sidebar-foreground"
                    title={coldStorageName}
                  >
                    {coldStorageName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userRole ?? 'Operations'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}