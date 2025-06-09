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
import { CalendarIcon, PlusCircle, Edit2, Trash2, PackagePlus, PackageMinus, CheckCircle2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from 'react-day-picker';
import { formatCurrencyCLP } from '@/lib/utils';

// Recalculate netUnitPrice based on unitPriceWithVat for initial data
const initialOrderItems = (items: Omit<OrderItem, 'netUnitPrice'>[]): OrderItem[] => {
  return items.map(item => ({
    ...item,
    unitPriceWithVat: Math.round(item.unitPriceWithVat),
    netUnitPrice: Math.round(item.unitPriceWithVat / (1 + VAT_RATE)),
  }));
};

const initialOrdersRaw = [
  {
    id: 'order1',
    orderDate: new Date(2024, 6, 20),
    customerName: 'Cliente Ejemplo 1',
    items: [
      { id: 'item1-1', productName: 'Producto Alpha', quantity: 2, unitPriceWithVat: 50000 },
      { id: 'item1-2', productName: 'Servicio Beta', quantity: 1, unitPriceWithVat: 119000 },
    ],
    status: 'Recibido' as OrderStatus,
    description: 'Pedido de prueba inicial',
  },
   {
    id: 'order2',
    orderDate: new Date(2024, 0, 15), // Older order
    customerName: 'Cliente Antiguo',
    items: [
      { id: 'item2-1', productName: 'Producto Gamma', quantity: 5, unitPriceWithVat: 20000 },
    ],
    status: 'Completado' as OrderStatus,
  },
];

// Calculate order totals based on items where netUnitPrice is already calculated
const calculateOrderTotals = (items: OrderItem[]): Pick<Order, 'totalNetAmount' | 'totalIvaAmount' | 'totalAmount'> => {
  const totalNetAmount = items.reduce((sum, item) => sum + (item.quantity * item.netUnitPrice), 0);
  const totalAmount = items.reduce((sum,item) => sum + (item.quantity * item.unitPriceWithVat), 0); // This is the total with VAT
  const totalIvaAmount = Math.round(totalAmount - totalNetAmount); // IVA is difference between total with VAT and total net

  return { 
    totalNetAmount: Math.round(totalNetAmount), 
    totalIvaAmount, 
    totalAmount: Math.round(totalAmount)
  };
};


export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(() => 
    initialOrdersRaw.map(order => ({
        ...order, 
        items: initialOrderItems(order.items), 
        ...calculateOrderTotals(initialOrderItems(order.items))
    })).sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime())
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const defaultNewOrder: Partial<Order> = { 
    orderDate: new Date(), 
    items: [], 
    status: 'Recibido',
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
      quantity: newItemQuantity, // Quantity can have decimals
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
  
  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!currentOrder.items || currentOrder.items.length === 0) {
      toast({ title: "Error", description: "Un pedido debe tener al menos un artículo.", variant: "destructive" });
      return;
    }

    const totals = calculateOrderTotals(currentOrder.items);

    const orderData: Order = {
      id: editingId || crypto.randomUUID(),
      orderDate: currentOrder.orderDate || new Date(), 
      customerName: formData.get('customerName') as string || undefined,
      items: currentOrder.items,
      ...totals,
      status: currentOrder.status || 'Recibido',
      description: formData.get('description') as string || undefined,
    };

    if (editingId) {
      setOrders(orders.map(o => o.id === editingId ? orderData : o).sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime()));
      toast({ title: "Pedido Actualizado", description: `El pedido #${orderData.id.substring(0,8)}... ha sido actualizado.` });
    } else {
      setOrders([...orders, orderData].sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime()));
      toast({ title: "Pedido Creado", description: `Nuevo pedido #${orderData.id.substring(0,8)}... creado.` });
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

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    toast({ title: "Pedido Eliminado", description: `El pedido #${id.substring(0,8)}... ha sido eliminado.` });
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus };
        if (newStatus === 'Completado' && order.status !== 'Completado') {
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
        }
        return updatedOrder;
      }
      return order;
    }));
  };
  
  const totalNetSales = useMemo(() => filteredOrders.filter(o => o.status === 'Completado').reduce((sum, o) => sum + o.totalNetAmount, 0), [filteredOrders]);
  const totalIvaSales = useMemo(() => filteredOrders.filter(o => o.status === 'Completado').reduce((sum, o) => sum + o.totalIvaAmount, 0), [filteredOrders]);
  const totalSales = useMemo(() => filteredOrders.filter(o => o.status === 'Completado').reduce((sum, o) => sum + o.totalAmount, 0), [filteredOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
              <form onSubmit={handleSaveOrder} className="space-y-4">
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
                </div>
                
                <Card>
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
                    <div className="mt-4 p-3 border rounded-md space-y-2">
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
                   <CardFooter className="text-right space-y-1">
                      <p>Subtotal Neto (sin IVA): {formatCurrencyCLP(currentOrder.totalNetAmount)}</p>
                      <p>IVA ({VAT_RATE*100}%): {formatCurrencyCLP(currentOrder.totalIvaAmount)}</p>
                      <p className="font-bold">Total Pedido (con IVA): {formatCurrencyCLP(currentOrder.totalAmount)}</p>
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
          <CardTitle>Lista de Pedidos</CardTitle>
           <CardDescription>
             Pedidos registrados para el período: {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : 'N/A'} - {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'N/A'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total (c/IVA)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-xs">{order.id.substring(0,8)}...</TableCell>
                  <TableCell>{format(order.orderDate, "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell>{order.customerName || '-'}</TableCell>
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
                  <TableCell colSpan={6} className="text-center h-24">
                    No hay pedidos registrados para el rango de fechas seleccionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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