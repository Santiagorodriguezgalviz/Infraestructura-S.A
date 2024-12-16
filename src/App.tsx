import { BrowserRouter } from 'react-router-dom';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', '/');
    };

    window.history.pushState(null, '', '/');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
      setTimeout(() => {
        setIsAuthenticated(false);
        setCurrentView('dashboard');
      }, 1000);
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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'elementos':
        return <ElementosView />;
      case 'solicitudes':
        return <SolicitudesView />;
      case 'pedidos':
        return <PedidosView />;
      default:
        return <DashboardView />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LoginView onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex h-screen">
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
          <div className="flex flex-1 flex-col">
            <Navbar onLogout={handleLogout} />
            <main className="flex-1 overflow-y-auto p-8">
              {renderView()}
            </main>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}