import { Card } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Package, ShoppingCart, AlertTriangle, Archive, Clock } from 'lucide-react';
import '@/styles/scrollbar.css';

const formatDate = (fecha: any) => {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

export function DashboardView() {
  const data = useDashboardData();
  const navigate = useNavigate();

  const handleLowStockClick = () => {
    navigate('/pedidos/nuevo'); // Navegar a la página de nuevo pedido
  };

  const StatsCard = ({ title, value, increment, icon: Icon, onClick }) => (
    <Card 
      className={`p-6 bg-gradient-to-br from-background/50 to-background border-0 backdrop-blur-sm hover:scale-105 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`} 
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {increment !== undefined && (
            <p className={`flex items-center gap-1 ${increment >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-sm">
                {increment >= 0 ? '+' : ''}{increment.toFixed(1)}% vs mes anterior
              </span>
            </p>
          )}
        </div>
        <div className="p-4 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Panel Principal
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido al sistema de inventario
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Elementos"
          value={data.stats.totalElementos}
          icon={Package}
        />
        <StatsCard
          title="Elementos Activos"
          value={data.stats.elementosActivos}
          increment={data.stats.incrementoElementos}
          icon={Archive}
        />
        <StatsCard
          title="Total Pedidos"
          value={data.stats.totalPedidos}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Elementos Bajo Stock"
          value={data.stats.elementosBajoStock}
          icon={AlertTriangle}
          onClick={handleLowStockClick}
        >
          <p className="text-xs text-muted-foreground mt-1">
            Click para hacer un nuevo pedido
          </p>
        </StatsCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-br from-background/50 to-background border-0">
          <h3 className="text-xl font-semibold mb-6 text-foreground">
            Distribución por Categoría
          </h3>
          <div className="h-[300px] w-full">
            {data.elementosPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.elementosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="cantidad"
                    nameKey="nombre"
                  >
                    {data.elementosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background/95 p-4 rounded-lg shadow-lg border border-border">
                            <p className="font-medium text-foreground mb-1">
                              {data.nombre}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ backgroundColor: data.color }}></span>
                                {data.cantidad} elementos
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {((data.cantidad / data.stats?.totalElementos) * 100).toFixed(1)}% del total
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay elementos registrados</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-background/50 to-background border-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              Elementos Más Solicitados
            </h3>
            <span className="text-sm text-muted-foreground">
              Top 5 elementos
            </span>
          </div>
          {data.elementosMasSolicitados.length > 0 ? (
            <div className="space-y-4">
              {data.elementosMasSolicitados.map((elemento, index) => (
                <div 
                  key={elemento.id} 
                  className="relative p-4 rounded-lg bg-background/80 hover:bg-background/90 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground truncate pr-4">
                          {elemento.nombre}
                        </p>
                        <p className="text-sm font-medium text-foreground whitespace-nowrap">
                          {elemento.cantidadSolicitada} unid.
                        </p>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${elemento.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
              <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Aún no hay datos de elementos solicitados
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2 max-w-[300px]">
                Los elementos más solicitados aparecerán aquí cuando se registren pedidos
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-background/50 to-background border-0">
          <h3 className="text-xl font-semibold mb-6">Estado del Stock por Categoría</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
            {data.stockPorCategoria.map((categoria) => (
              <Card key={categoria.categoria} className="p-4 bg-background/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{categoria.categoria}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      categoria.elementosBajoStock > 0 
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {categoria.elementosBajoStock > 0 
                        ? `${categoria.elementosBajoStock} elementos bajo stock`
                        : 'Stock saludable'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cantidad total en stock: {categoria.cantidadTotal}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-background/50 to-background border-0">
          <h3 className="text-xl font-semibold mb-6">Elementos Recientes</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {data.elementosRecientes.length > 0 ? (
              data.elementosRecientes.map((elemento) => (
                <Card key={elemento.id} className="p-4 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{elemento.nombre}</h4>
                        <p className="text-sm text-muted-foreground">
                          {elemento.categoria}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Stock: {elemento.cantidadActual}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(elemento.fecha)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No hay elementos recientes
                </p>
                <p className="text-sm text-muted-foreground/80 mt-2">
                  Los elementos aparecerán aquí cuando se agreguen al inventario
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-background/50 to-background border-0">
          <h3 className="text-xl font-semibold mb-6">Pedidos Recientes</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {data.pedidosRecientes.map((pedido) => (
              <Card key={pedido.id} className="p-4 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pedido #{pedido.id.slice(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pedido.elementos?.length || 0} elementos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      pedido.estado === 'completado'
                        ? 'bg-green-500/10 text-green-500'
                        : pedido.estado === 'cancelado'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {pedido.estado}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(pedido.fecha)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}