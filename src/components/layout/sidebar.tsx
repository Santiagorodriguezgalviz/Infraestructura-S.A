import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes/routes.config';
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
    path: ROUTES.DASHBOARD.ROOT,
    description: 'Vista general',
  },
  {
    title: 'Elementos',
    icon: Package2,
    path: ROUTES.INVENTORY.ROOT,
    description: 'Gestión de inventario',
  },
  {
    title: 'Solicitudes',
    icon: ClipboardList,
    path: ROUTES.REQUESTS.ROOT,
    description: 'Control de solicitudes',
  },
  {
    title: 'Pedidos',
    icon: ShoppingCart,
    path: ROUTES.ORDERS.ROOT,
    description: 'Gestión de pedidos',
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className={cn(
        'relative border-r bg-background duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo y botón de colapso */}
      <div className="flex h-16 items-center justify-between px-3 border-b">
        <div className={cn(
          'flex items-center gap-3 duration-300',
          collapsed ? 'w-8' : 'w-full'
        )}>
          <img
            src="/logo-sena.png"
            alt="Logo SENA"
            className={cn(
              'object-contain transition-all duration-300',
              collapsed ? 'w-8 h-8' : 'w-12 h-12'
            )}
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-primary">Infraestructura S.A</span>
              <span className="text-xs text-muted-foreground">Gestión de Inventario</span>
            </div>
          )}
        </div>
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
        <div className="flex flex-col gap-2 p-2">
          {nav.map(({ title, icon: Icon, path, description }) => {
            const isActive = location.pathname.startsWith(path);

            return (
              <Button
                key={path}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-4 hover:bg-muted/50',
                  collapsed && 'justify-center'
                )}
                onClick={() => navigate(path)}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && (
                  <div className="flex flex-col items-start">
                    <span>{title}</span>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}