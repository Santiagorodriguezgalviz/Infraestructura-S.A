import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Package2,
  ClipboardList,
  ShoppingCart,
  Menu,
} from 'lucide-react';

const nav = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    value: 'dashboard',
    description: 'Vista general',
  },
  {
    title: 'Elementos',
    icon: Package2,
    value: 'elementos',
    description: 'Gestión de inventario',
  },
  {
    title: 'Solicitudes',
    icon: ClipboardList,
    value: 'solicitudes',
    description: 'Control de solicitudes',
  },
  {
    title: 'Pedidos',
    icon: ShoppingCart,
    value: 'pedidos',
    description: 'Gestión de pedidos',
  },
];

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'relative border-r bg-background duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <h2
          className={cn(
            'text-lg font-semibold tracking-tight text-primary duration-300',
            collapsed && 'opacity-0'
          )}
        >
          {collapsed ? 'II' : 'Inventario Infraestructura S.A'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-4 p-4">
          <nav className="flex flex-col gap-2">
            {nav.map((item) => (
              <Button
                key={item.value}
                variant={currentView === item.value ? 'secondary' : 'ghost'}
                className={cn(
                  'justify-start gap-4 hover:bg-primary/10',
                  collapsed && 'justify-center px-2'
                )}
                onClick={() => onViewChange(item.value)}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && (
                  <div className="flex flex-col items-start">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
}