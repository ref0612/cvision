'use client';

import React, { useState } from 'react';
import type { InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit2, Trash2, Archive, DollarSign } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { formatCurrencyCLP } from '@/lib/utils';

// Mock Data
const initialInventoryItems: InventoryItem[] = [
  { id: 'item1', name: 'Componente X', quantity: 100, purchasePrice: 10500, sku: 'CX-001', supplier: 'Proveedor A', lastRestocked: new Date(2024, 5, 15) },
  { id: 'item2', name: 'Materia Prima Y', quantity: 50, purchasePrice: 5750, sku: 'MPY-002', supplier: 'Proveedor B', lastRestocked: new Date(2024, 6, 1) },
  { id: 'item3', name: 'Empaque Genérico', quantity: 200, purchasePrice: 2000, sku: 'PKG-003', supplier: 'Proveedor A', lastRestocked: new Date(2024, 6, 10) },
  { id: 'item4', name: 'Mano de Obra (hora)', quantity: 1000, purchasePrice: 15000, sku: 'LAB-001' },
];

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdateItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: InventoryItem = {
      id: editingId || crypto.randomUUID(),
      name: formData.get('name') as string,
      quantity: parseInt(formData.get('quantity') as string),
      purchasePrice: Math.round(parseFloat(formData.get('purchasePrice') as string)),
      description: formData.get('description') as string | undefined,
      sku: formData.get('sku') as string | undefined,
      supplier: formData.get('supplier') as string | undefined,
      lastRestocked: currentItem.lastRestocked,
    };

    if (editingId) {
      setInventoryItems(inventoryItems.map(item => item.id === editingId ? newItem : item));
    } else {
      setInventoryItems([...inventoryItems, newItem]);
    }
    setIsDialogOpen(false);
    setCurrentItem({});
    setEditingId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setCurrentItem(item);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setInventoryItems(inventoryItems.filter(item => item.id !== id));
  };

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const totalStockUnits = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Gestión de Inventario (Componentes y Materias Primas)</h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setCurrentItem({});
            setEditingId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Componente/Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar' : 'Añadir Nuevo'} Componente/Material</DialogTitle>
              <DialogDescription>
                Completa los detalles del componente o materia prima.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrUpdateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Componente/Material</Label>
                  <Input id="name" name="name" defaultValue={currentItem.name} required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU (Opcional)</Label>
                  <Input id="sku" name="sku" defaultValue={currentItem.sku} />
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input id="quantity" name="quantity" type="number" step="1" defaultValue={currentItem.quantity} required />
                </div>
                <div>
                  <Label htmlFor="purchasePrice">Precio de Compra (Unidad, CLP)</Label>
                  <Input id="purchasePrice" name="purchasePrice" type="number" step="1" defaultValue={currentItem.purchasePrice} required />
                </div>
                <div>
                  <Label htmlFor="supplier">Proveedor (Opcional)</Label>
                  <Input id="supplier" name="supplier" defaultValue={currentItem.supplier} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="lastRestocked">Última Reposición (Opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentItem.lastRestocked ? format(currentItem.lastRestocked, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentItem.lastRestocked}
                        onSelect={(date) => setCurrentItem(prev => ({ ...prev, lastRestocked: date || undefined }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea id="description" name="description" defaultValue={currentItem.description} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'} Artículo</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Totales en Stock</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStockUnits.toLocaleString('es-CL')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total del Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCLP(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Basado en precio de compra.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Componentes y Materias Primas</CardTitle>
          <CardDescription>Todos los artículos base en tu inventario.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Compra</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Últ. Reposición</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.length > 0 ? inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku || '-'}</TableCell>
                  <TableCell className="text-right">{item.quantity.toLocaleString('es-CL')}</TableCell>
                  <TableCell className="text-right">{formatCurrencyCLP(item.purchasePrice)}</TableCell>
                  <TableCell>{item.supplier || '-'}</TableCell>
                  <TableCell>{item.lastRestocked ? format(item.lastRestocked, "dd/MM/yy") : '-'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No hay artículos en el inventario.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}