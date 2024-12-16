import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/Firebase/Config';

interface LoginProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('infraestructura@gmail.com');
  const [password, setPassword] = useState('AdminS.A');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.custom((t) => (
        <div className={cn(
          "flex items-center gap-3 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 shadow-lg rounded-lg border",
          theme === 'dark' ? 'border-white/10' : 'border-green-500/20'
        )}>
          <div className="bg-green-500/10 rounded-full p-2">
            <ArrowRight className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-white font-medium">¡Inicio de sesión exitoso!</p>
          </div>
        </div>
      ), {
        position: "top-center",
        duration: 2000,
      });
      onLogin();
    } catch (error) {
      toast.custom((t) => (
        <div className={cn(
          "flex items-center gap-3 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 shadow-lg rounded-lg border",
          theme === 'dark' ? 'border-white/10' : 'border-red-500/20'
        )}>
          <div className="bg-red-500/10 rounded-full p-2">
            <X className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-white font-medium">Credenciales incorrectas</p>
          </div>
        </div>
      ), {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center relative overflow-hidden",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
    )}>
      <Toaster />
      
      {/* Efectos de fondo */}
      <div className="absolute inset-0">
        {/* Gradiente de fondo */}
        <div className={cn(
          "absolute inset-0",
          theme === 'dark' 
            ? 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black' 
            : 'bg-gradient-to-b from-green-50 via-white to-white'
        )} />
        
        {/* Patrón de puntos */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: theme === 'dark' 
              ? 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, rgba(0, 200, 0, 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} 
        />
        
        {/* Efectos de luz */}
        <div className={cn(
          "absolute top-0 -left-40 w-96 h-96 rounded-full blur-[120px] animate-pulse",
          theme === 'dark' ? 'bg-emerald-500/5' : 'bg-green-200/50'
        )} />
        <div className={cn(
          "absolute bottom-0 -right-40 w-96 h-96 rounded-full blur-[120px] animate-pulse delay-700",
          theme === 'dark' ? 'bg-emerald-500/5' : 'bg-green-200/50'
        )} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-10">
        <div className="max-w-[400px] mx-auto space-y-8">
          {/* Logo y título */}
          <div className="text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto mb-8 group">
              <div className={cn(
                "absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500",
                theme === 'dark' ? 'bg-emerald-500/10' : 'bg-green-500/10'
              )} />
              <div className={cn(
                "relative backdrop-blur-xl border rounded-2xl p-4 transition-transform duration-500 group-hover:scale-105",
                theme === 'dark' 
                  ? 'bg-zinc-900/50 border-white/10' 
                  : 'bg-white/40 border-green-500/30'
              )}>
                <img 
                  src="/new-infra-logo.svg"
                  alt="Logo"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">
              <span className={cn(
                "bg-clip-text text-transparent",
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-emerald-400 via-white to-emerald-400'
                  : 'bg-gradient-to-r from-green-600 to-green-800'
              )}>
                Inventario Infraestructura
              </span>
            </h1>
            <p className={cn(
              "text-base",
              theme === 'dark' ? 'text-zinc-400' : 'text-green-800'
            )}>
              Sistema integral de gestión
            </p>
          </div>

          {/* Formulario */}
          <Card className={cn(
            "border-0 backdrop-blur-xl shadow-2xl",
            theme === 'dark' 
              ? 'bg-zinc-900/30 shadow-black/10' 
              : 'bg-white/60 shadow-green-200/30'
          )}>
            <div className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className={cn(
                    "font-medium pl-1",
                    theme === 'dark' ? 'text-zinc-300' : 'text-green-700'
                  )}>
                    Correo Electrónico
                  </Label>
                  <div className="relative group">
                    <div className={cn(
                      "absolute inset-0 rounded-lg blur-sm group-hover:blur-md transition-all duration-300",
                      theme === 'dark' ? 'bg-emerald-500/5' : 'bg-green-500/10'
                    )} />
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-3 h-4 w-4 transition-colors",
                        theme === 'dark' 
                          ? 'text-zinc-400 group-hover:text-white' 
                          : 'text-green-700/60 group-hover:text-green-600'
                      )} />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          "pl-10",
                          theme === 'dark'
                            ? 'bg-zinc-900/50 border-white/10 focus:border-white/20 text-white placeholder:text-zinc-500'
                            : 'bg-white/80 border-green-600/30 focus:border-green-600/50 text-green-800 placeholder:text-green-700/50'
                        )}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={cn(
                    "font-medium pl-1",
                    theme === 'dark' ? 'text-zinc-300' : 'text-green-700'
                  )}>
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <div className={cn(
                      "absolute inset-0 rounded-lg blur-sm group-hover:blur-md transition-all duration-300",
                      theme === 'dark' ? 'bg-emerald-500/5' : 'bg-green-500/10'
                    )} />
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-3 h-4 w-4 transition-colors",
                        theme === 'dark' 
                          ? 'text-zinc-400 group-hover:text-white' 
                          : 'text-green-700/60 group-hover:text-green-600'
                      )} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          "pl-10 pr-10",
                          theme === 'dark'
                            ? 'bg-zinc-900/50 border-white/10 focus:border-white/20 text-white'
                            : 'bg-white/80 border-green-600/30 focus:border-green-600/50 text-green-800'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-3 top-3 transition-colors",
                          theme === 'dark' 
                            ? 'text-zinc-400 hover:text-white' 
                            : 'text-green-700/60 hover:text-green-600'
                        )}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full backdrop-blur-sm transition-all duration-300 group",
                      theme === 'dark'
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-white border border-white/10 hover:border-white/20'
                        : 'bg-green-600/20 hover:bg-green-600/30 text-green-700 border border-green-600/30 hover:border-green-600/50'
                    )}
                  >
                    <span className="mr-2">Iniciar Sesión</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Footer */}
          <p className={cn(
            "text-center text-sm pt-4",
            theme === 'dark' ? 'text-zinc-500' : 'text-green-700/40'
          )}>
            2024 Infraestructura S.A - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
