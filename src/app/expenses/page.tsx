'use client';

import React, { useState, useMemo } from 'react';
import type { ExpenseRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from 'react-day-picker';
import { formatCurrencyCLP } from '@/lib/utils';

// Mock Data
const initialExpenseRecords: ExpenseRecord[] = [
  { id: '1', date: new Date(2024, 0, 10), category: 'Costos Operativos', amount: 300000, description: 'Alquiler Enero' },
  { id: '2', date: new Date(2024, 1, 5), category: 'Marketing', amount: 100000, description: 'Publicidad Febrero' },
  { id: '3', date: new Date(2024, 6, 2), category: 'Costos Operativos', amount: 350000, description: 'Alquiler oficina' },
  { id: '4', date: new Date(2024, 6, 6), category: 'Marketing', amount: 150000, description: 'Publicidad online' },
  { id: '5', date: new Date(2024, 6, 12), category: 'Suministros', amount: 75200, description: 'Material de oficina' },
];

const expenseCategories = ["Costos Operativos", "Marketing", "Suministros", "Salarios", "Servicios Públicos", "Otros"];

export default function ExpensesPage() {
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(initialExpenseRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<ExpenseRecord>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultDateRangeFrom = startOfMonth(addMonths(new Date(), -5));
  const defaultDateRangeTo = endOfMonth(new Date());

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultDateRangeFrom,
    to: defaultDateRangeTo,
  });

  const filteredExpenseRecords = useMemo(() => {
    if (!dateRange?.from) return expenseRecords;

    const fromDate = dateRange.from;
    const toDate = dateRange.to || new Date(8640000000000000);

    return expenseRecords.filter(record => {
      const recordDate = record.date;
      if (!recordDate) return false;
      
      const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
      const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

      return recordDateOnly >= fromDateOnly && recordDateOnly <= toDateOnly;
    });
  }, [expenseRecords, dateRange]);

  const handleAddOrUpdateExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: ExpenseRecord = {
      id: editingId || crypto.randomUUID(),
      date: currentExpense.date || new Date(),
      category: currentExpense.category || formData.get('categoryFallback') as string, 
      amount: Math.round(parseFloat(formData.get('amount') as string)),
      description: formData.get('description') as string | undefined,
    };

    if (editingId) {
      setExpenseRecords(expenseRecords.map(rec => rec.id === editingId ? newRecord : rec));
    } else {
      setExpenseRecords([...expenseRecords, newRecord].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
    setIsDialogOpen(false);
    setCurrentExpense({});
    setEditingId(null);
  };

  const handleEdit = (record: ExpenseRecord) => {
    setCurrentExpense(record);
    setEditingId(record.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setExpenseRecords(expenseRecords.filter(rec => rec.id !== id));
  };

  const totalExpenses = useMemo(() => {
    return filteredExpenseRecords.reduce((sum, record) => sum + record.amount, 0);
  }, [filteredExpenseRecords]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Registro de Egresos</h1>
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
              setCurrentExpense({});
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Egreso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar' : 'Añadir Nuevo'} Egreso</DialogTitle>
                <DialogDescription>
                  Completa los detalles de tu egreso.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddOrUpdateExpense} className="space-y-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentExpense.date ? format(currentExpense.date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentExpense.date}
                        onSelect={(date) => setCurrentExpense(prev => ({ ...prev, date: date || new Date() }))}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                   <Select 
                    name="category" 
                    value={currentExpense.category}
                    onValueChange={(value) => setCurrentExpense(prev => ({ ...prev, category: value}))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="categoryFallback" value={currentExpense.category} />
                </div>
                <div>
                  <Label htmlFor="amount">Monto (CLP)</Label>
                  <Input id="amount" name="amount" type="number" step="1" defaultValue={currentExpense.amount} required />
                </div>
                <div>
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea id="description" name="description" defaultValue={currentExpense.description} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'} Egreso</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Egresos</CardTitle>
          <CardDescription>
             Egresos registrados para el período: {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : 'N/A'} - {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'N/A'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenseRecords.length > 0 ? filteredExpenseRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(record.date, "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrencyCLP(record.amount)}</TableCell>
                  <TableCell>{record.description || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
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
                  <TableCell colSpan={5} className="text-center h-24">
                    No hay egresos registrados para el rango de fechas seleccionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end font-semibold">
            Total Egresos: {formatCurrencyCLP(totalExpenses)}
        </CardFooter>
      </Card>
    </div>
  );
}
