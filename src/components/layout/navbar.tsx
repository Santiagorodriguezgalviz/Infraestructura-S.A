import { Bell, Search, Moon, Sun, MessageSquare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/theme-provider';
import { useState, useEffect } from 'react';
import { PerfilModal } from '@/components/perfil/perfil-modal';
import { auth } from '@/Firebase/Config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ChatbotComponent } from '@/components/chat/ChatbotComponent';
import { Link } from "react-router-dom";

interface NavbarProps {
  onLogout?: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('Current user:', currentUser); // Para depuración
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handlePerfilClick = () => {
    console.log('Opening profile modal, user:', user); // Para depuración
    setPerfilOpen(true);
  };

  return (
    <>
      <nav className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold">
              Inventario
            </Link>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="w-[200px] pl-8"
              />
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="/avatar.png" alt="Avatar" />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePerfilClick}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Botón flotante del chat */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg 
            transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
            flex items-center justify-center
            ${chatOpen 
              ? 'bg-destructive hover:bg-destructive/90' 
              : 'bg-primary hover:bg-primary/90'
            }
            group
            backdrop-blur-sm
            hover:shadow-xl
            motion-safe:animate-bounce`}
        >
          <MessageCircle className={`h-6 w-6 text-primary-foreground transition-all duration-300 ${
            chatOpen ? 'rotate-180' : 'group-hover:scale-110'
          }`} />
        </button>

        <ChatbotComponent
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
        
        <PerfilModal
          open={perfilOpen}
          onClose={() => setPerfilOpen(false)}
          user={user}
        />
      </nav>
    </>
  );
}