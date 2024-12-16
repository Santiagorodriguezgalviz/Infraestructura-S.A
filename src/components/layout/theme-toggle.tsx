import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themes = [
  {
    name: 'Predeterminado',
    value: 'default',
    primary: '142.1 76.2% 36.3%',
  },
  {
    name: 'Océano',
    value: 'ocean',
    primary: '199 89% 48%',
  },
  {
    name: 'Bosque',
    value: 'forest',
    primary: '141 79% 35%',
  },
  {
    name: 'Atardecer',
    value: 'sunset',
    primary: '12 76% 61%',
  },
  {
    name: 'Real',
    value: 'royal',
    primary: '262 80% 50%',
  },
];

export function ThemeToggle() {
  const setTheme = (primary: string) => {
    document.documentElement.style.setProperty('--primary', primary);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Temas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setTheme(theme.primary)}
            className="flex items-center gap-2"
          >
            <div 
              className="h-3 w-3 rounded-full"
              style={{ background: `hsl(${theme.primary})` }}
            />
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}