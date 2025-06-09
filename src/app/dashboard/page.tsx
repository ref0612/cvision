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
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className="w-full sm:w-[300px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales (c/IVA)</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCLP(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to ? 
               `Del ${format(dateRange.from, "P", {locale:es})} al ${format(dateRange.to, "P", {locale:es})}` 
               : "Período seleccionado"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCLP(totalExpenses)}</div>
             <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to ? 
               `Del ${format(dateRange.from, "P", {locale:es})} al ${format(dateRange.to, "P", {locale:es})}` 
               : "Período seleccionado"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCLP(netProfit)}</div>
            <p className="text-xs text-muted-foreground">Resultado de ingresos - egresos</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IVA (Ingresos)</CardTitle>
            <Percent className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCLP(totalIvaFromIncome)}</div>
             <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to ? 
               `Del ${format(dateRange.from, "P", {locale:es})} al ${format(dateRange.to, "P", {locale:es})}` 
               : "Período seleccionado"}
            </p>
          </CardContent>
        </Card>
        {/* Placeholder for Inventory Stats Card - Assuming this will be added or is part of another component */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estadísticas de Inventario</CardTitle>
            <Archive className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {inventoryStats.loading ? (
              <p>Cargando...</p>
            ) : inventoryStats.error ? (
              <p className="text-red-500">{inventoryStats.error}</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats.totalItems} items</div>
                <p className="text-xs text-muted-foreground">Valor total: {formatCurrencyCLP(inventoryStats.totalInventoryValue)}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Flujo de Caja (Últimos 6 Meses)</CardTitle>
          <CardDescription>
            Ingresos vs. Egresos mensuales.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ShadBarChart data={MOCK_CASH_FLOW_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="monthLabel" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrencyCLP(value)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={80}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </ShadBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
