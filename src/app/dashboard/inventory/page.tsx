'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit2, Trash2, Archive, DollarSign, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrencyCLP } from '@/lib/utils';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem, InventoryItem } from '@/lib/inventory';

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    purchasePrice: 0,
    description: null,
    supplier: null,
    size: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar los artículos del inventario
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const items = await getInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error('Error al cargar el inventario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, []);

  // Filtrar ítems según el término de búsqueda
  const filteredItems = inventoryItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.description?.toLowerCase().includes(searchLower) ?? false) ||
      (item.sku?.toLowerCase().includes(searchLower) ?? false) ||
      (item.supplier?.toLowerCase().includes(searchLower) ?? false) ||
      (item.size?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Calcular totales basados en los ítems filtrados
  const totalStockUnits = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalInventoryValue = filteredItems.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);

  // Manejar abrir diálogo para nuevo ítem
  const handleNewItem = () => {
    setCurrentItem({
      name: '',
      quantity: 0,
      purchasePrice: 0,
      description: null,
      supplier: null,
      size: null,
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  // Manejar editar ítem
  const handleEdit = (item: InventoryItem) => {
    setCurrentItem({
      ...item,
      description: item.description || null,
      supplier: item.supplier || null,
      size: item.size || null,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  // Manejar eliminar ítem
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este ítem?')) {
      try {
        await deleteInventoryItem(id);
        setInventoryItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error al eliminar el ítem:', error);
      }
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem.name || currentItem.quantity === undefined || currentItem.purchasePrice === undefined) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        name: currentItem.name,
        quantity: Number(currentItem.quantity),
        purchasePrice: Number(currentItem.purchasePrice),
        description: currentItem.description?.trim() || null,
        supplier: currentItem.supplier?.trim() || null,
        size: currentItem.size?.trim() || null,
        // SKU se generará automáticamente en createInventoryItem
        sku: null
      } as const;

      if (editingId) {
        // Para actualizar, enviamos el objeto completo con el ID
        const updatedItem = await updateInventoryItem({
          ...itemData,
          id: editingId
        });
        setInventoryItems(prev => 
          prev.map(item => item.id === editingId ? updatedItem : item)
        );
      } else {
        // Para crear, enviamos todos los datos
        const newItem = await createInventoryItem(itemData);
        setInventoryItems(prev => [...prev, newItem]);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al guardar el ítem:', error);
      alert('Ocurrió un error al guardar el ítem');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventario</h1>
        
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos Totales</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length.toLocaleString('es-CL')}</div>
          </CardContent>
        </Card>
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
        <Button onClick={handleNewItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Artículo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Lista de Componentes y Materias Primas</CardTitle>
              <CardDescription>Todos los artículos base en tu inventario.</CardDescription>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Compra</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg
                        className="h-12 w-12 text-muted-foreground"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <path d="M15 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                        <path d="m3 21 1.65-3.8a9 9 0 0 1 1.1-1.6" />
                        <path d="M6.2 15.6a9 9 0 0 0 1.2 1.4" />
                        <path d="M21 21h-6" />
                        <path d="m17 11 1 1" />
                      </svg>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'No se encontraron artículos que coincidan con tu búsqueda.'
                          : 'No hay artículos en el inventario.'}
                      </p>
                      {searchTerm && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSearchTerm('')}
                          className="mt-2"
                        >
                          Limpiar búsqueda
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.description || ''}>
                      {item.description || '-'}
                    </TableCell>
                    <TableCell>{item.size || '-'}</TableCell>
                    <TableCell>{item.sku || '-'}</TableCell>
                    <TableCell className="text-right">{item.quantity.toLocaleString('es-CL')}</TableCell>
                    <TableCell className="text-right">{formatCurrencyCLP(item.purchasePrice)}</TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para agregar/editar ítem */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Artículo' : 'Agregar Nuevo Artículo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={currentItem.name || ''}
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Ej: Camiseta blanca"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={currentItem.description || ''}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Descripción detallada del producto"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="size" className="text-right">
                  Talla
                </Label>
                <Input
                  id="size"
                  value={currentItem.size || ''}
                  onChange={(e) => setCurrentItem({...currentItem, size: e.target.value})}
                  className="col-span-3"
                  placeholder="Ej: M, 42, Única"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={currentItem.sku || ''}
                  onChange={(e) => setCurrentItem({...currentItem, sku: e.target.value})}
                  className="col-span-3"
                  placeholder="Código único de referencia"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Cantidad *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={currentItem.quantity || 0}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purchasePrice" className="text-right">
                  Precio Compra *
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  value={currentItem.purchasePrice || 0}
                  onChange={(e) => setCurrentItem({...currentItem, purchasePrice: parseInt(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  Proveedor
                </Label>
                <Input
                  id="supplier"
                  value={currentItem.supplier || ''}
                  onChange={(e) => setCurrentItem({...currentItem, supplier: e.target.value})}
                  className="col-span-3"
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
