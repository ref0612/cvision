'use client';

import React, { useState, useMemo } from 'react';
import type { IncomeRecord } from '@/lib/types';
import { VAT_RATE } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale"; // For Spanish date formatting
import type { DateRange } from 'react-day-picker';
import { formatCurrencyCLP } from '@/lib/utils';

// Helper to calculate amounts for initial data, assuming input is Total Amount WITH VAT
const calculateInitialAmounts = (totalAmountWithVat: number) => {
  const net = Math.round(totalAmountWithVat / (1 + VAT_RATE));
  const iva = Math.round(totalAmountWithVat - net);
  return { amount: Math.round(totalAmountWithVat), netAmount: net, ivaAmount: iva };
};

const initialIncomeRecords: IncomeRecord[] = [
  { id: '1', date: new Date(2024, 0, 15), source: 'Venta Enero Producto A', ...calculateInitialAmounts(1000000)},
  { id: '2', date: new Date(2024, 1, 10), source: 'Venta Febrero Producto B', ...calculateInitialAmounts(1500000)},
  { id: '3', date: new Date(2024, 6, 1), source: 'Venta de Producto A', ...calculateInitialAmounts(1200500), description: 'Factura #101' },
  { id: '4', date: new Date(2024, 6, 5), source: 'Servicios de Consultoría', ...calculateInitialAmounts(750000) },
  { id: '5', date: new Date(2024, 6, 10), source: 'Venta de Producto B', ...calculateInitialAmounts(300750), description: 'Factura #102' },
];

export default function IncomePage() {
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(initialIncomeRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState<Partial<IncomeRecord>>({ date: new Date() });
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultDateRangeFrom = startOfMonth(addMonths(new Date(), -5));
  const defaultDateRangeTo = endOfMonth(new Date());

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultDateRangeFrom,
    to: defaultDateRangeTo,
  });

  const filteredIncomeRecords = useMemo(() => {
    if (!dateRange?.from) return incomeRecords;

    const fromDate = dateRange.from;
    const toDate = dateRange.to || new Date(8640000000000000); // Max date if 'to' is not set

    return incomeRecords.filter(record => {
      const recordDate = record.date;
      // Ensure recordDate is valid
      if (!recordDate) return false;
      
      // Create date objects for comparison, ignoring time component
      const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
      const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

      return recordDateOnly >= fromDateOnly && recordDateOnly <= toDateOnly;
    });
  }, [incomeRecords, dateRange]);


  const handleAddOrUpdateIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const totalAmountInput = Math.round(parseFloat(formData.get('totalAmountInput') as string));

    if (isNaN(totalAmountInput)) {
      console.error("Monto Total Inválido");
      return;
    }

    const calculatedNetAmount = Math.round(totalAmountInput / (1 + VAT_RATE));
    const calculatedIvaAmount = Math.round(totalAmountInput - calculatedNetAmount);

    const newRecord: IncomeRecord = {
      id: editingId || crypto.randomUUID(),
      date: currentIncome.date || new Date(),
      source: formData.get('source') as string,
      amount: totalAmountInput, // User-entered total amount with VAT
      netAmount: calculatedNetAmount,
      ivaAmount: calculatedIvaAmount,
      description: formData.get('description') as string | undefined,
    };

    if (editingId) {
      setIncomeRecords(incomeRecords.map(rec => rec.id === editingId ? newRecord : rec));
      setIsDialogOpen(false);
      setCurrentIncome({ date: new Date() });
      setEditingId(null);
    } else {
      // Persist to API
      fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newRecord.date,
          source: newRecord.source,
          amount: newRecord.amount,
          netAmount: newRecord.netAmount,
          ivaAmount: newRecord.ivaAmount,
          description: newRecord.description,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setIncomeRecords([...incomeRecords, { ...data, id: data.id || crypto.randomUUID() }].sort((a, b) => b.date.getTime() - a.date.getTime()));
            setIsDialogOpen(false);
            setCurrentIncome({ date: new Date() });
            setEditingId(null);
          } else {
            alert('Error al registrar ingreso');
          }
        })
        .catch(() => alert('Error al registrar ingreso'));
    }
  };

  const handleEdit = (record: IncomeRecord) => {
    setCurrentIncome({...record});
    setEditingId(record.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setIncomeRecords(incomeRecords.filter(rec => rec.id !== id));
  };
  
  const totalIncome = useMemo(() => {
    return filteredIncomeRecords.reduce((sum, record) => sum + record.amount, 0);
  }, [filteredIncomeRecords]);

  const totalNetAmount = useMemo(() => {
    return filteredIncomeRecords.reduce((sum, record) => sum + record.netAmount, 0);
  }, [filteredIncomeRecords]);

  const totalIvaAmount = useMemo(() => {
    return filteredIncomeRecords.reduce((sum, record) => sum + record.ivaAmount, 0);
  }, [filteredIncomeRecords]);


  return (
    <div className="w-full min-h-screen flex flex-col gap-4 bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <h1 className="text-3xl font-headline font-semibold">Registro de Ingresos</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className="w-full sm:w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: es })}
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
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen);
              if (!isOpen) {
                setCurrentIncome({ date: new Date() });
                setEditingId(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={() => { setCurrentIncome({ date: new Date() }); setEditingId(null); setIsDialogOpen(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ingreso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar' : 'Añadir Nuevo'} Ingreso</DialogTitle>
                  <DialogDescription>
                    Completa los detalles de tu ingreso. Ingresa el Monto Total (IVA Incluido). El Monto Neto y el IVA ({VAT_RATE * 100}%) se calcularán automáticamente.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddOrUpdateIncome} className="space-y-4">
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentIncome.date ? format(currentIncome.date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={currentIncome.date}
                          onSelect={(date) => setCurrentIncome(prev => ({ ...prev, date: date || new Date() }))}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="source">Fuente del Ingreso</Label>
                    <Input id="source" name="source" defaultValue={currentIncome.source} required />
                  </div>
                  <div>
                    <Label htmlFor="totalAmountInput">Monto Total (IVA Incluido)</Label>
                    <Input id="totalAmountInput" name="totalAmountInput" type="number" step="1" defaultValue={currentIncome.amount} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Textarea id="description" name="description" defaultValue={currentIncome.description} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'} Ingreso</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lista de Ingresos</CardTitle>
          <CardDescription>Ingresos registrados para el período seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">Monto Neto (sin IVA)</TableHead>
                  <TableHead className="text-right">IVA ({VAT_RATE * 100}%)</TableHead>
                  <TableHead className="text-right">Monto Total (con IVA)</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomeRecords.length > 0 ? filteredIncomeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(record.date, "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell>{record.source}</TableCell>
                    <TableCell className="text-right">{formatCurrencyCLP(record.netAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyCLP(record.ivaAmount)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrencyCLP(record.amount)}</TableCell>
                    <TableCell>{record.description || '-'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No hay ingresos registrados para el rango de fechas seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
         <CardFooter className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-semibold">
            <div>Total Neto (sin IVA): {formatCurrencyCLP(totalNetAmount)}</div>
            <div>Total IVA: {formatCurrencyCLP(totalIvaAmount)}</div>
            <div>Total Ingresos (con IVA): {formatCurrencyCLP(totalIncome)}</div>
        </CardFooter>
      </Card>
    </div>
  );
}