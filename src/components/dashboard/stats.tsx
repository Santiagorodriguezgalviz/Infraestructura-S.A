import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Package, ShoppingCart, ArrowUpRight } from 'lucide-react';

const stats = [
  {
    title: 'Total Clientes',
    value: '2,350',
    change: '+12.5%',
    icon: Users,
  },
  {
    title: 'Productos Activos',
    value: '1,250',
    change: '+8.2%',
    icon: Package,
  },
  {
    title: 'Total Pedidos',
    value: '450',
    change: '+15.3%',
    icon: ShoppingCart,
  },
];

export function Stats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-sm text-primary">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              {stat.change}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}