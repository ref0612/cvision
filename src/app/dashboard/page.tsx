'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart as LucideBarChartIcon, DollarSign, Archive, TrendingUp, TrendingDown, Calendar as CalendarIcon, Percent } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart as ShadBarChart } from 'recharts';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { VAT_RATE } from '@/lib/types';
import { formatCurrencyCLP } from '@/lib/utils';

const MOCK_CASH_FLOW_DATA_SOURCE = [
  { monthLabel: 'Ene 2024', date: new Date(2024, 0, 15), income: 4000000, expenses: 2400000 },
  { monthLabel: 'Feb 2024', date: new Date(2024, 1, 15), income: 3000000, expenses: 1398000 },
  { monthLabel: 'Mar 2024', date: new Date(2024, 2, 15), income: 2000000, expenses: 5800000 },
  { monthLabel: 'Abr 2024', date: new Date(2024, 3, 15), income: 2780000, expenses: 3908000 },
  { monthLabel: 'May 2024', date: new Date(2024, 4, 15), income: 1890000, expenses: 4800000 },
  { monthLabel: 'Jun 2024', date: new Date(2024, 5, 15), income: 2390000, expenses: 3800000 },
  { monthLabel: 'Jul 2024', date: new Date(2024, 6, 15), income: 3200000, expenses: 2000000 },
  { monthLabel: 'Ago 2024', date: new Date(2024, 7, 15), income: 4500000, expenses: 2800000 },
];

const chartConfig = {
  income: {
    label: 'Ingresos',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Egresos',
    color: 'hsl(var(--chart-2))',
  },
} satisfies import('@/components/ui/chart').ChartConfig;


export default function DashboardPage() {
  const sixMonthsAgo = startOfMonth(addMonths(new Date(), -5));
  const today = endOfMonth(new Date());
  
  // Estado para manejar las estadísticas de inventario
  const [inventoryStats, setInventoryStats] = React.useState({
    loading: true,
    error: null as string | null,
    totalItems: 0,
    totalInventoryValue: 0,
  });
  
  // Efecto para cargar las estadísticas de inventario
  React.useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Error al cargar las estadísticas de inventario');
        }
        const data = await response.json();
        setInventoryStats({
          loading: false,
          error: null,
          totalItems: data.totalItems,
          totalInventoryValue: data.totalInventoryValue,
        });
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
        setInventoryStats({
          loading: false,
          error: 'Error al cargar los datos',
          totalItems: 0,
          totalInventoryValue: 0,
        });
      }
    };

    fetchInventoryStats();
  }, []);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: sixMonthsAgo,
    to: today,
  });

  const MOCK_CASH_FLOW_DATA = useMemo(() => {
    if (!dateRange?.from) return MOCK_CASH_FLOW_DATA_SOURCE;
    const fromDate = dateRange.from;
    const toDate = dateRange.to || new Date(8640000000000000); // Max date if 'to' is not set

    return MOCK_CASH_FLOW_DATA_SOURCE.filter(item => {
      const itemDate = item.date;
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }, [dateRange]);
  
  const totalIncome = MOCK_CASH_FLOW_DATA.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = MOCK_CASH_FLOW_DATA.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalIncome - totalExpenses;

  const totalIvaFromIncome = useMemo(() => {
    return MOCK_CASH_FLOW_DATA.reduce((sum, item) => {
      const net = Math.round(item.income / (1 + VAT_RATE));
      const iva = item.income - net;
      return sum + iva;
    }, 0);
  }, [MOCK_CASH_FLOW_DATA]);
  
  // These are placeholders and would need real data sources for date filtering
  const averageProfitMargin = MOCK_CASH_FLOW_DATA.length > 0 ? 25 : 0; // Simplified placeholder

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      {/* Header y filtro de fechas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h1 className="h1 text-foreground drop-shadow-sm">Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className="w-full md:w-[300px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y", {locale: es})} -{" "}
                    {format(dateRange.to, "LLL dd, y", {locale: es})}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y", {locale: es})
                )
              ) : (
                <span>Selecciona un rango</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* KPIs: grid fluido, tarjetas perfectamente responsivas y estilizadas */}
      <div
        className="grid w-full"
        style={{
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {/* Tarjeta KPI: padding y alto adaptativos, textos con wrap en mobile, animación y hover */}
        <Card className="group flex flex-col justify-center items-center h-32 md:h-36 p-4 text-center overflow-hidden max-w-full transition-all duration-300 shadow-xl bg-gradient-to-br from-[#1a2236]/80 to-[#232946]/90 hover:scale-[1.025] hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary rounded-2xl">
          <CardHeader className="flex flex-col items-center justify-center pb-1 px-0 w-full">
            <CardTitle className="text-base md:text-lg font-semibold text-green-400 whitespace-normal break-words w-full drop-shadow-sm">Ingresos Totales (c/IVA)</CardTitle>
            <TrendingUp className="h-7 w-7 md:h-8 md:w-8 text-green-400 drop-shadow mt-1 group-hover:scale-110 transition-transform duration-200" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 p-0 w-full">
            <div className="text-2xl md:text-3xl font-extrabold text-green-200 leading-tight w-full whitespace-normal break-words animate-fade-in">{formatCurrencyCLP(totalIncome)}</div>
            <p className="text-xs text-green-300/80 mt-1 w-full whitespace-normal break-words">{dateRange?.from && dateRange?.to ? `Del ${format(dateRange.from, "P", {locale:es})} al ${format(dateRange.to, "P", {locale:es})}` : "Período seleccionado"}</p>
          </CardContent>
        </Card>
        <Card className="group flex flex-col justify-center items-center h-32 md:h-36 p-4 text-center overflow-hidden max-w-full transition-all duration-300 shadow-xl bg-gradient-to-br from-[#2d1a1a]/80 to-[#3a2323]/90 hover:scale-[1.025] hover:shadow-2xl focus-within:ring-2 focus-within:ring-red-400 rounded-2xl">
          <CardHeader className="flex flex-col items-center justify-center pb-1 px-0 w-full">
            <CardTitle className="text-base md:text-lg font-semibold text-red-400 whitespace-normal break-words w-full drop-shadow-sm">Egresos Totales</CardTitle>
            <TrendingDown className="h-7 w-7 md:h-8 md:w-8 text-red-400 drop-shadow mt-1 group-hover:scale-110 transition-transform duration-200" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 p-0 w-full">
            <div className="text-2xl md:text-3xl font-extrabold text-red-200 leading-tight w-full whitespace-normal break-words animate-fade-in">{formatCurrencyCLP(totalExpenses)}</div>
            <p className="text-xs text-red-300/80 mt-1 w-full whitespace-normal break-words">{dateRange?.from && dateRange?.to ? `Del ${format(dateRange.from, "P", {locale:es})} al ${format(dateRange.to, "P", {locale:es})}` : "Período seleccionado"}</p>
          </CardContent>
        </Card>
        <Card className="group flex flex-col justify-center items-center h-32 md:h-36 p-4 text-center overflow-hidden max-w-full transition-all duration-300 shadow-xl bg-gradient-to-br from-[#1a2236]/80 to-[#232946]/90 hover:scale-[1.025] hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-400 rounded-2xl">
          <CardHeader className="flex flex-col items-center justify-center pb-1 px-0 w-full">
            <CardTitle className="text-base md:text-lg font-semibold text-blue-400 whitespace-normal break-words w-full drop-shadow-sm">Beneficio Neto</CardTitle>
            <DollarSign className="h-7 w-7 md:h-8 md:w-8 text-blue-400 drop-shadow mt-1 group-hover:scale-110 transition-transform duration-200" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 p-0 w-full">
            <div className="text-2xl md:text-3xl font-extrabold text-blue-200 leading-tight w-full whitespace-normal break-words animate-fade-in">{formatCurrencyCLP(netProfit)}</div>
            <p className="text-xs text-blue-300/80 mt-1 w-full whitespace-normal break-words">Resultado de ingresos - egresos</p>
          </CardContent>
        </Card>
        <Card className="group flex flex-col justify-center items-center h-32 md:h-36 p-4 text-center overflow-hidden max-w-full transition-all duration-300 shadow-xl bg-gradient-to-br from-[#3a2d1a]/80 to-[#4a3923]/90 hover:scale-[1.025] hover:shadow-2xl focus-within:ring-2 focus-within:ring-yellow-200 rounded-2xl">
          <CardHeader className="flex flex-col items-center justify-center pb-1 px-0 w-full">
            <CardTitle className="text-base md:text-lg font-semibold text-yellow-200 whitespace-normal break-words w-full drop-shadow-sm">Total IVA (Ingresos)</CardTitle>
            <Percent className="h-7 w-7 md:h-8 md:w-8 text-yellow-200 drop-shadow mt-1 group-hover:scale-110 transition-transform duration-200" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 p-0 w-full">
            <div className="text-2xl md:text-3xl font-extrabold text-yellow-100 leading-tight w-full whitespace-normal break-words animate-fade-in">{formatCurrencyCLP(totalIvaFromIncome)}</div>
            <p className="text-xs text-yellow-100/80 mt-1 w-full whitespace-normal break-words">{dateRange?.from && dateRange?.to ? `Del ${format(dateRange.from, "P", {locale:es})} al ${format(dateRange.to, "P", {locale:es})}` : "Período seleccionado"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de flujo de caja */}
      <div className="w-full card mt-2 overflow-x-auto">
        <div className="h2 text-primary mb-2">Flujo de Caja (Últimos 6 Meses)</div>
        <div className="text-muted-foreground mb-2">Ingresos vs. Egresos mensuales.</div>
        <ChartContainer config={chartConfig} className="w-full" style={{height: '200px', minWidth: 320}}>
          <ResponsiveContainer width="100%" height="100%">
            <ShadBarChart data={MOCK_CASH_FLOW_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
              <XAxis 
                dataKey="monthLabel" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="#6366f1"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrencyCLP(value)}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                stroke="#6366f1"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="income" fill="#4ade80" radius={4} />
              <Bar dataKey="expenses" fill="#f87171" radius={4} />
            </ShadBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Estadísticas de Inventario y widgets atractivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mt-8 max-w-full">
        {/* Fondo oscuro y texto de alto contraste para modo oscuro */}
        <Card className="h-full shadow-lg border-0 bg-card max-w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm md:text-base font-semibold text-purple-300 whitespace-normal break-words">Estadísticas de Inventario</CardTitle>
            <Archive className="h-6 w-6 md:h-7 md:w-7 text-purple-200 drop-shadow" />
          </CardHeader>
          <CardContent>
            {inventoryStats.loading ? (
              <p className="text-purple-200/80">Cargando...</p>
            ) : inventoryStats.error ? (
              <p className="text-red-400">{inventoryStats.error}</p>
            ) : (
              <>
                <div className="text-2xl md:text-3xl font-extrabold text-purple-100">{inventoryStats.totalItems} items</div>
                <p className="text-xs text-purple-200/80">Valor total: {formatCurrencyCLP(inventoryStats.totalInventoryValue)}</p>
              </>
            )}
          </CardContent>
        </Card>
        {/* Fondo oscuro y texto de alto contraste para modo oscuro */}
        <Card className="h-full flex items-center justify-center text-center shadow-lg border-0 bg-card max-w-full">
          <CardContent>
            <div>
              <p className="text-lg md:text-xl font-bold mb-2 text-foreground">¿Sin datos aún?</p>
              <p className="text-sm md:text-base text-muted-foreground">Agrega productos, ingresos o egresos para ver estadísticas aquí.<br/>¡Tu dashboard se verá increíble con más información!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
