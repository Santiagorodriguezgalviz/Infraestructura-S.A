import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function RecentSales() {
  return (
    <div className="space-y-8">
      {['Juan Pérez', 'María García', 'Carlos López'].map((name, i) => (
        <div key={i} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-sm text-muted-foreground">
              Solicitud #{1000 + i}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}