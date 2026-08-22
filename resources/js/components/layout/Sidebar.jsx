import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Globe,
  AlertTriangle,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Gauge,
  Shield,
} from 'lucide-react';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/monitors',
    label: 'Monitors',
    icon: Globe,
  },
  {
    to: '/pagespeed',
    label: 'PageSpeed',
    icon: Gauge,
  },
  {
    to: '/incidents',
    label: 'Incidents',
    icon: AlertTriangle,
  },
  {
    to: '/wordpress',
    label: 'WP Updates',
    icon: RefreshCw,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

const adminItems = [
  {
    to: '/admin',
    label: 'Admin Panel',
    icon: Shield,
  },
];

function SidebarContent({ onLinkClick, collapsed, setCollapsed, isAdmin }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-bold text-foreground">UptimeGuard</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <Separator className="my-2" />
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <Separator />

      {/* Add Monitor Button */}
      <div className="p-2">
        <NavLink
          to="/monitors/create"
          onClick={onLinkClick}
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>Add Monitor</span>}
        </NavLink>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const isAdmin = user?.is_admin === true;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} isAdmin={isAdmin} />
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      {isOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-border md:hidden">
          <SidebarContent
            onLinkClick={onClose}
            collapsed={false}
            setCollapsed={() => {}}
            isAdmin={isAdmin}
          />
        </aside>
      )}
    </>
  );
}
