'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { VAT_RATE, ORDER_STATUSES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Edit2, Trash2, PackagePlus, PackageMinus, CheckCircle2, FileText } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from 'react-day-picker';
import { formatCurrencyCLP } from '@/lib/utils';

// Calculate order totals based on items where netUnitPrice is already calculated
const calculateOrderTotals = (items: OrderItem[]): Pick<Order, 'totalNetAmount' | 'totalIvaAmount' | 'totalAmount'> => {
  const totalNetAmount = items.reduce((sum, item) => sum + (item.quantity * item.netUnitPrice), 0);
  const totalAmount = items.reduce((sum,item) => sum + (item.quantity * item.unitPriceWithVat), 0);
  const totalIvaAmount = Math.round(totalAmount - totalNetAmount);

  return { 
    totalNetAmount: Math.round(totalNetAmount), 
    totalIvaAmount, 
    totalAmount: Math.round(totalAmount)
  };
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const defaultNewOrder: Partial<Order> = { 
    orderDate: new Date(), 
    items: [], 
    status: 'RECIBIDO',
    totalNetAmount: 0,
    totalIvaAmount: 0,
    totalAmount: 0,
  };
  const [currentOrder, setCurrentOrder] = useState<Partial<Order>>(defaultNewOrder);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultDateRangeFrom = startOfMonth(addMonths(new Date(), -5));
  const defaultDateRangeTo = endOfMonth(new Date());

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultDateRangeFrom,
    to: defaultDateRangeTo,
  });

  // Cargar pedidos desde la API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Convertir fechas de string a Date
        const ordersWithDates = data.map((order: any) => ({
          ...order,
          orderDate: new Date(order.orderDate),
        }));
        setOrders(ordersWithDates);
      } else {
        toast({ title: "Error", description: "No se pudieron cargar los pedidos.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al cargar los pedidos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!dateRange?.from) return orders;

    const fromDate = dateRange.from;
    const toDate = dateRange.to || new Date(8640000000000000);

    return orders.filter(order => {
      const recordDate = order.orderDate;
      if (!recordDate) return false;
      
      const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
      const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

      return recordDateOnly >= fromDateOnly && recordDateOnly <= toDateOnly;
    });
  }, [orders, dateRange]);

  // For managing items in the form
  const [newItemProductName, setNewItemProductName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnitPriceWithVat, setNewItemUnitPriceWithVat] = useState(0);

  useEffect(() => {
    if (currentOrder.items) {
      const totals = calculateOrderTotals(currentOrder.items);
      setCurrentOrder(prev => ({ ...prev, ...totals }));
    }
  }, [currentOrder.items]);

  const handleAddItemToOrder = () => {
    if (!newItemProductName || newItemQuantity <= 0 || newItemUnitPriceWithVat < 0) {
      toast({ title: "Error", description: "Por favor, completa nombre, cantidad (>0) y precio unitario con IVA (>=0) del artículo.", variant: "destructive" });
      return;
    }
    const roundedUnitPriceWithVat = Math.round(newItemUnitPriceWithVat);
    const calculatedNetUnitPrice = Math.round(roundedUnitPriceWithVat / (1 + VAT_RATE));
    
    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      productName: newItemProductName,
      quantity: newItemQuantity,
      unitPriceWithVat: roundedUnitPriceWithVat,
      netUnitPrice: calculatedNetUnitPrice,
    };
    setCurrentOrder(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    setNewItemProductName('');
    setNewItemQuantity(1);
    setNewItemUnitPriceWithVat(0);
  };

  const handleRemoveItemFromOrder = (itemId: string) => {
    setCurrentOrder(prev => ({ ...prev, items: prev.items?.filter(item => item.id !== itemId) }));
  };
  
  const handleSaveOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!currentOrder.items || currentOrder.items.length === 0) {
      toast({ title: "Error", description: "Un pedido debe tener al menos un artículo.", variant: "destructive" });
      return;
    }

    const totals = calculateOrderTotals(currentOrder.items);

    const orderData = {
      customerName: formData.get('customerName') as string || undefined,
      rut: formData.get('rut') as string || undefined,
      telefono: formData.get('telefono') as string || undefined,
      items: currentOrder.items,
      totalAmount: totals.totalAmount,
      totalNetAmount: totals.totalNetAmount,
      totalIvaAmount: totals.totalIvaAmount,
      status: currentOrder.status || 'Recibido',
      description: formData.get('description') as string || undefined,
    };

    try {
      if (editingId) {
        // Actualizar pedido existente
        const response = await fetch(`/api/orders/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (response.ok) {
          await fetchOrders(); // Recargar datos
          toast({ title: "Pedido Actualizado", description: `El pedido #${editingId.substring(0,8)}... ha sido actualizado.` });
        } else {
          toast({ title: "Error", description: "No se pudo actualizar el pedido.", variant: "destructive" });
        }
      } else {
        // Crear nuevo pedido
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (response.ok) {
          await fetchOrders(); // Recargar datos
          toast({ title: "Pedido Creado", description: "Nuevo pedido creado exitosamente." });
        } else {
          toast({ title: "Error", description: "No se pudo crear el pedido.", variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al guardar el pedido.", variant: "destructive" });
    }

    setIsDialogOpen(false);
    setCurrentOrder(defaultNewOrder);
    setEditingId(null);
  };

  const handleEditOrder = (order: Order) => {
    setCurrentOrder(JSON.parse(JSON.stringify(order))); 
    setEditingId(order.id);
    setIsDialogOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchOrders(); // Recargar datos
        toast({ title: "Pedido Eliminado", description: `El pedido #${id.substring(0,8)}... ha sido eliminado.` });
      } else {
        toast({ title: "Error", description: "No se pudo eliminar el pedido.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al eliminar el pedido.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchOrders(); // Recargar datos
        const order = orders.find(o => o.id === orderId);
        if (newStatus === 'COMPLETADO' && order && order.status !== 'COMPLETADO') {
          toast({
            title: "Pedido Completado",
            description: (
              <div>
                <p>El pedido #{order.id.substring(0,8)}... se marcó como completado.</p>
                <p>Neto (sin IVA): {formatCurrencyCLP(order.totalNetAmount)}, IVA: {formatCurrencyCLP(order.totalIvaAmount)}, Total (con IVA): {formatCurrencyCLP(order.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">Este ingreso debería registrarse en la sección de Ingresos.</p>
              </div>
            ),
            action: <CheckCircle2 className="text-green-500" />,
          });
        } else if (newStatus === 'ANULADO' && order && order.status === 'COTIZACION_ENVIADA') {
          toast({
            title: "Cotización Anulada",
            description: "El stock bloqueado ha sido liberado.",
          });
        }
      } else {
        toast({ title: "Error", description: "No se pudo actualizar el estado del pedido.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al actualizar el estado del pedido.", variant: "destructive" });
    }
  };
  
  const totalNetSales = useMemo(() => filteredOrders.filter(o => o.status === 'COMPLETADO').reduce((sum, o) => sum + o.totalNetAmount, 0), [filteredOrders]);
  const totalIvaSales = useMemo(() => filteredOrders.filter(o => o.status === 'COMPLETADO').reduce((sum, o) => sum + o.totalIvaAmount, 0), [filteredOrders]);
  const totalSales = useMemo(() => filteredOrders.filter(o => o.status === 'COMPLETADO').reduce((sum, o) => sum + o.totalAmount, 0), [filteredOrders]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col gap-4 bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <h1 className="text-3xl font-headline font-semibold">Gestión de Pedidos</h1>
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
              setCurrentOrder(defaultNewOrder);
              setEditingId(null);
              setNewItemProductName('');
              setNewItemQuantity(1);
              setNewItemUnitPriceWithVat(0);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => { setCurrentOrder(defaultNewOrder); setEditingId(null); setIsDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar' : 'Crear Nuevo'} Pedido</DialogTitle>
                <DialogDescription>
                  Define los detalles del pedido. Ingresa precios unitarios con IVA (en CLP). El neto y los totales se calcularán.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderDate">Fecha del Pedido</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentOrder.orderDate ? format(currentOrder.orderDate, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={currentOrder.orderDate} onSelect={(date) => setCurrentOrder(prev => ({ ...prev, orderDate: date || new Date() }))} initialFocus locale={es} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="customerName">Nombre del Cliente (Opcional)</Label>
                    <Input id="customerName" name="customerName" defaultValue={currentOrder.customerName} />
                  </div>
                  <div>
                    <Label htmlFor="rut">RUT (Opcional)</Label>
                    <Input id="rut" name="rut" defaultValue={currentOrder.rut} />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                    <Input id="telefono" name="telefono" defaultValue={currentOrder.telefono} />
                  </div>
                </div>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Artículos del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {formatCurrencyCLP(item.unitPriceWithVat)} (c/IVA) = {formatCurrencyCLP(item.quantity * item.unitPriceWithVat)}
                          </p>
                           <p className="text-xs text-muted-foreground">
                            (Neto Unitario: {formatCurrencyCLP(item.netUnitPrice)})
                          </p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItemFromOrder(item.id)}>
                          <PackageMinus className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {(!currentOrder.items || currentOrder.items.length === 0) && (
                      <p className="text-sm text-muted-foreground">No hay artículos en el pedido.</p>
                    )}
                    
                    <div className="border-t pt-4">
                      <h4 className="text-md font-semibold">Añadir Nuevo Artículo</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                          <div>
                              <Label htmlFor="newItemName">Nombre Producto</Label>
                              <Input id="newItemName" value={newItemProductName} onChange={(e) => setNewItemProductName(e.target.value)} placeholder="Ej: Camisa Azul" />
                          </div>
                          <div>
                              <Label htmlFor="newItemQty">Cantidad</Label>
                              <Input id="newItemQty" type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(parseFloat(e.target.value) || 1)} min="0" step="any" />
                          </div>
                          <div>
                              <Label htmlFor="newItemUnitPriceWithVat">Precio Unit. (c/IVA, CLP)</Label>
                              <Input id="newItemUnitPriceWithVat" type="number" step="1" value={newItemUnitPriceWithVat} onChange={(e) => setNewItemUnitPriceWithVat(parseFloat(e.target.value) || 0)} min="0" placeholder="0"/>
                          </div>
                      </div>
                       <Button type="button" size="sm" variant="outline" onClick={handleAddItemToOrder} className="mt-2">
                          <PackagePlus className="mr-2 h-4 w-4" /> Añadir Artículo al Pedido
                        </Button>
                    </div>
                  </CardContent>
                   <CardFooter className="flex flex-col items-end space-y-2">
                      <p>Subtotal Neto (sin IVA): {formatCurrencyCLP(currentOrder.totalNetAmount || 0)}</p>
                      <p>IVA ({VAT_RATE*100}%): {formatCurrencyCLP(currentOrder.totalIvaAmount || 0)}</p>
                      <p className="font-bold">Total Pedido (con IVA): {formatCurrencyCLP(currentOrder.totalAmount || 0)}</p>
                   </CardFooter>
                </Card>

                <div>
                  <Label htmlFor="description">Descripción/Notas (Opcional)</Label>
                  <Textarea id="description" name="description" defaultValue={currentOrder.description} />
                </div>
                 <div>
                  <Label htmlFor="status">Estado del Pedido</Label>
                  <Select 
                    name="status"
                    value={currentOrder.status}
                    onValueChange={(value) => setCurrentOrder(prev => ({ ...prev, status: value as OrderStatus}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map(stat => (
                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'} Pedido</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lista de Pedidos y Cotizaciones</CardTitle>
          <CardDescription>Pedidos y cotizaciones registrados para el período seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Total (c/IVA)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-1">
                        {order.status === 'COTIZACION_ENVIADA' && <FileText className="h-3 w-3 text-blue-500" />}
                        {order.id.substring(0,8)}...
                      </div>
                    </TableCell>
                    <TableCell>{format(order.orderDate, "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell>{order.customerName || '-'}</TableCell>
                    <TableCell>{order.rut || '-'}</TableCell>
                    <TableCell>{order.telefono || '-'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrencyCLP(order.totalAmount)}</TableCell>
                    <TableCell>
                       <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus as OrderStatus)}>
                          <SelectTrigger className="h-8 text-xs w-[130px]">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              {ORDER_STATUSES.map(stat => (
                              <SelectItem key={stat} value={stat} className="text-xs">{stat}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No hay pedidos registrados para el rango de fechas seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-semibold text-sm">
            <div>Ventas (Neto): {formatCurrencyCLP(totalNetSales)}</div>
            <div>IVA (Ventas): {formatCurrencyCLP(totalIvaSales)}</div>
            <div>Ventas (Total c/IVA): {formatCurrencyCLP(totalSales)}</div>
        </CardFooter>
      </Card>
    </div>
  );
}