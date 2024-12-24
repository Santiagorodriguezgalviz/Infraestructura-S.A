import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { useState, useEffect } from 'react';
import { DashboardView } from '@/views/dashboard';
import { ElementosView } from '@/views/elementos';
import { SolicitudesView } from '@/views/solicitudes';
import { PedidosView } from '@/views/pedidos';
import { LoginView } from '@/views/login';
import { toast, Toaster } from 'sonner';
import { LogOut } from 'lucide-react';
import { auth } from '@/Firebase/Config';
import { signOut } from 'firebase/auth';
import { AuthGuard } from '@/guards/AuthGuard';
import { ROUTES } from '@/routes/routes.config';

// Componente interno para manejar la navegación
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Limpiar el estado de autenticación inmediatamente
      setIsAuthenticated(false);
      // Limpiar el localStorage
      localStorage.removeItem('isAuthenticated');
      
      toast.success(
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <LogOut className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">¡Hasta pronto!</p>
            <p className="text-sm text-muted-foreground">
              Has cerrado sesión exitosamente
            </p>
          </div>
        </div>,
        {
          duration: 2000,
          className: "bg-background/80 backdrop-blur-sm border border-primary/20",
          position: "top-center",
        }
      );
      
      // Redireccionar al login
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error(
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium">Error al cerrar sesión</p>
            <p className="text-sm text-muted-foreground">
              Hubo un problema al cerrar la sesión. Por favor, inténtalo de nuevo.
            </p>
          </div>
        </div>,
        {
          duration: 3000,
          className: "bg-background/80 backdrop-blur-sm border-red-500/20",
          position: "top-center",
        }
      );
    }
  };

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route 
        path={ROUTES.LOGIN} 
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD.ROOT} replace /> : <LoginView onLogin={handleLogin} />} 
      />

      {/* Redirección de la raíz al dashboard */}
      <Route 
        path="/" 
        element={<Navigate to={ROUTES.DASHBOARD.ROOT} replace />} 
      />

      {/* Rutas protegidas */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex-col">
                <Navbar onLogout={handleLogout} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Routes>
                    {/* Dashboard Routes */}
                    <Route path={ROUTES.DASHBOARD.ROOT} element={<DashboardView />} />
                    <Route path={ROUTES.DASHBOARD.OVERVIEW} element={<DashboardView />} />
                    <Route path={ROUTES.DASHBOARD.ANALYTICS} element={<DashboardView />} />

                    {/* Inventory Routes */}
                    <Route path={ROUTES.INVENTORY.ROOT} element={<ElementosView />} />
                    <Route path={ROUTES.INVENTORY.LIST} element={<ElementosView />} />
                    <Route path={ROUTES.INVENTORY.ADD} element={<ElementosView />} />
                    <Route path={ROUTES.INVENTORY.EDIT} element={<ElementosView />} />

                    {/* Requests Routes */}
                    <Route path={ROUTES.REQUESTS.ROOT} element={<SolicitudesView />} />
                    <Route path={ROUTES.REQUESTS.PENDING} element={<SolicitudesView />} />
                    <Route path={ROUTES.REQUESTS.APPROVED} element={<SolicitudesView />} />
                    <Route path={ROUTES.REQUESTS.REJECTED} element={<SolicitudesView />} />

                    {/* Orders Routes */}
                    <Route path={ROUTES.ORDERS.ROOT} element={<PedidosView />} />
                    <Route path={ROUTES.ORDERS.ACTIVE} element={<PedidosView />} />
                    <Route path={ROUTES.ORDERS.HISTORY} element={<PedidosView />} />

                    {/* Ruta 404 */}
                    <Route path="*" element={<Navigate to={ROUTES.DASHBOARD.ROOT} replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

// Componente principal que proporciona el contexto de enrutamiento
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}