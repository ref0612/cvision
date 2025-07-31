"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { VAT_RATE } from "@/lib/types";
import { formatCurrencyCLP } from "@/lib/utils";
import type { IncomeRecord, ExpenseRecord } from "@/lib/types";

export default function DeclaracionSiiPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const from = dateRange?.from?.toISOString().split('T')[0];
        const to = dateRange?.to?.toISOString().split('T')[0];
        const [incomeRes, expensesRes] = await Promise.all([
          fetch(`/api/income?from=${from}&to=${to}`),
          fetch(`/api/expenses?from=${from}&to=${to}`)
        ]);
        if (!incomeRes.ok || !expensesRes.ok) {
          throw new Error('Error al obtener datos');
        }
        const incomeData = await incomeRes.json();
        const expensesData = await expensesRes.json();
        setIncome(Array.isArray(incomeData) ? incomeData.map(i => ({ ...i, date: new Date(i.date) })) : []);
        setExpenses(Array.isArray(expensesData) ? expensesData.map(e => ({ ...e, date: new Date(e.date) })) : []);
      } catch (err) {
        setError('No se pudieron cargar los datos. Intenta nuevamente.');
      }
      setLoading(false);
    }
    fetchData();
  }, [dateRange]);

  // Los datos ya vienen filtrados por rango desde la API
  const filteredIncome = income;
  const filteredExpenses = expenses;

  // Cálculos ingresos
  const totalIncome = useMemo(() => filteredIncome.reduce((sum, r) => sum + r.amount, 0), [filteredIncome]);
  const totalNetIncome = useMemo(() => filteredIncome.reduce((sum, r) => sum + r.netAmount, 0), [filteredIncome]);
  const ivaDebito = useMemo(() => filteredIncome.reduce((sum, r) => sum + r.ivaAmount, 0), [filteredIncome]);

  // Cálculos egresos
  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, r) => sum + r.amount, 0), [filteredExpenses]);
  const ivaCredito = useMemo(() => filteredExpenses.filter(e => e.hasInvoice).reduce((sum, r) => sum + (r.amount * VAT_RATE / (1 + VAT_RATE)), 0), [filteredExpenses]);

  // Resumen final
  const ivaToPay = ivaDebito - ivaCredito;
  const utilidadBruta = totalNetIncome - totalExpenses;

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 bg-background p-4">
      {loading && (
        <div className="text-center text-lg text-muted-foreground">Cargando datos...</div>
      )}
      {error && (
        <div className="text-center text-red-600 font-bold">{error}</div>
      )}
      <h1 className="text-3xl font-headline font-bold mb-2">Declaración SII</h1>
      <Card>
        <CardHeader>
          <CardTitle>Rango de fechas</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: es })} - {format(dateRange.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>Total ingresos brutos: <span className="font-bold">{formatCurrencyCLP(totalIncome)}</span></div>
            <div>Total ingresos netos: <span className="font-bold">{formatCurrencyCLP(totalNetIncome)}</span></div>
            <div>IVA débito: <span className="font-bold">{formatCurrencyCLP(ivaDebito)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Egresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>Total egresos: <span className="font-bold">{formatCurrencyCLP(totalExpenses)}</span></div>
            <div>IVA crédito: <span className="font-bold">{formatCurrencyCLP(ivaCredito)}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>IVA a pagar: <span className="font-bold">{formatCurrencyCLP(ivaToPay)}</span></div>
          <div>Utilidad bruta: <span className="font-bold">{formatCurrencyCLP(utilidadBruta)}</span></div>
          <div>
            {ivaToPay > 0 ? (
              <div className="text-red-600 font-bold">Debes pagar al SII: ${formatCurrencyCLP(ivaToPay)}</div>
            ) : ivaToPay < 0 ? (
              <div className="text-green-600 font-bold">Saldo a favor (crédito fiscal): ${formatCurrencyCLP(Math.abs(ivaToPay))}</div>
            ) : (
              <div className="text-neutral-600 font-bold">No hay diferencias de IVA este mes.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opcional: botones para exportar o guardar historial */}
      {/* <div className="flex gap-2 mt-4">
        <Button variant="outline">Exportar a PDF</Button>
        <Button variant="outline">Exportar a Excel</Button>
        <Button variant="default">Guardar resumen mensual</Button>
      </div> */}
    </div>
  );
}
