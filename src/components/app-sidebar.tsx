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
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';

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

const DAYBOOK_ACTIVE_ROUTE_PREFIXES = [
  '/daybook',
  '/incoming',
  '/outgoing',
  '/transfer',
] as const;

function isDaybookNavActive(pathname: string) {
  return DAYBOOK_ACTIVE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isSettingsNavActive(pathname: string) {
  return pathname === '/settings' || pathname.startsWith('/settings/');
}

function isPeopleNavActive(pathname: string) {
  return pathname === '/people' || pathname.startsWith('/people/');
}

function isNavItemActive(item: NavItem, pathname: string) {
  if (!item.to) return false;
  if (item.to === '/daybook') return isDaybookNavActive(pathname);
  if (item.to === '/people') return isPeopleNavActive(pathname);
  if (item.to === '/settings') return isSettingsNavActive(pathname);
  return pathname === item.to;
}

function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showFinances = usePreferencesStore(
    (s) => s.preferences?.showFinances ?? true,
  );
  const visibleNavItems = coreNavItems.filter(
    (item) => item.to !== '/finances' || showFinances,
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Core Operations
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.name}>
                {item.to && !item.disabled ? (
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(item, pathname)}
                    tooltip={item.name}
                  >
                    <Link
                      to={item.to}
                      {...(item.to === "/daybook"
                        ? { search: DEFAULT_DAYBOOK_SEARCH }
                        : {})}
                    >
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
              <Link to="/daybook" search={DEFAULT_DAYBOOK_SEARCH}>
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