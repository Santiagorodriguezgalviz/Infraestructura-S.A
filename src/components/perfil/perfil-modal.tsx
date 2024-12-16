import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "firebase/auth";
import { auth } from '@/Firebase/Config';

interface PerfilModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function PerfilModal({ open, onOpenChange, user }: PerfilModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center pb-2">Perfil de Usuario</DialogTitle>
          <div className="flex justify-center pb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/avatar.png" alt="Avatar" />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              value={user.email || ''}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="created">Cuenta creada el</Label>
            <Input
              id="created"
              value={user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastSignIn">Último inicio de sesión</Label>
            <Input
              id="lastSignIn"
              value={user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
