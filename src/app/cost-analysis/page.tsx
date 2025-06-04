'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Product, ProductComponent, InventoryItem } from '@/lib/types';
import { VAT_RATE } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit2, Trash2, PackagePlus, PackageMinus, Coins } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatCurrencyCLP } from '@/lib/utils';

const mockInventoryItems: InventoryItem[] = [
  { id: 'item1', name: 'Componente X', quantity: 100, purchasePrice: 10500, sku: 'CX-001' },
  { id: 'item2', name: 'Materia Prima Y', quantity: 50, purchasePrice: 5750, sku: 'MPY-002' },
  { id: 'item3', name: 'Empaque Genérico', quantity: 200, purchasePrice: 2000, sku: 'PKG-003' },
  { id: 'item4', name: 'Mano de Obra (hora)', quantity: 1000, purchasePrice: 15000, sku: 'LAB-001' },
];

const initialProducts: Product[] = [
  { 
    id: 'prod1', 
    name: 'Producto Alpha Ensamblado', 
    components: [
      { inventoryItemId: 'item1', itemName: 'Componente X', quantity: 1, purchasePriceAtTimeOfAssembly: 10500 },
      { inventoryItemId: 'item2', itemName: 'Materia Prima Y', quantity: 2, purchasePriceAtTimeOfAssembly: 5750 },
      { inventoryItemId: 'item4', itemName: 'Mano de Obra (hora)', quantity: 0.5, purchasePriceAtTimeOfAssembly: 15000 },
    ],
    desiredProfitMargin: 40,
  },
];

export default function CostAnalysisPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(() => 
    initialProducts.map(p => calculateProductPricingDetails(p))
  );
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  const defaultNewProduct: Partial<Product> = { 
    name: '',
    components: [], 
    desiredProfitMargin: 30,
    totalComponentCost: 0,
    netSalePriceWithoutIVA: 0,
    ivaAmountOnSale: 0,
    finalSalePriceWithIVA: 0,
  };
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>(defaultNewProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!isProductDialogOpen) return;

    const cost = (currentProduct.components || []).reduce((sum, comp) => {
      return sum + (comp.purchasePriceAtTimeOfAssembly * comp.quantity);
    }, 0);

    const margin = currentProduct.desiredProfitMargin ?? 0;
    let netSalePrice = cost;

    if (margin < 100 && margin >= 0) {
      netSalePrice = cost / (1 - (margin / 100));
    } else if (margin < 0) {
      netSalePrice = cost; 
    }
    
    const iva = netSalePrice * VAT_RATE;
    const finalPrice = netSalePrice + iva;

    setCurrentProduct(prev => ({ 
      ...prev, 
      totalComponentCost: Math.round(cost),
      netSalePriceWithoutIVA: Math.round(netSalePrice),
      ivaAmountOnSale: Math.round(iva),
      finalSalePriceWithIVA: Math.round(finalPrice),
    }));

  }, [currentProduct.components, currentProduct.desiredProfitMargin, isProductDialogOpen, toast]);


  function calculateProductPricingDetails(product: Product): Product {
    const cost = (product.components || []).reduce((sum, comp) => {
      return sum + (comp.purchasePriceAtTimeOfAssembly * comp.quantity);
    }, 0);

    let netSalePrice = cost;
    const margin = product.desiredProfitMargin ?? 0;

    if (margin < 100 && margin >= 0) {
      netSalePrice = cost / (1 - (margin / 100));
    }
    
    const iva = netSalePrice * VAT_RATE;
    const finalPrice = netSalePrice + iva;

    return {
      ...product,
      totalComponentCost: Math.round(cost),
      netSalePriceWithoutIVA: Math.round(netSalePrice),
      ivaAmountOnSale: Math.round(iva),
      finalSalePriceWithIVA: Math.round(finalPrice),
    };
  }
  
  const productsWithCalculatedPrices = useMemo(() => {
    return products.map(p => calculateProductPricingDetails(p));
  }, [products]);


  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentProduct.name?.trim()) {
      toast({ title: "Error", description: "El nombre del producto es obligatorio.", variant: "destructive" });
      return;
    }
    if (!currentProduct.components || currentProduct.components.length === 0) {
      toast({ title: "Error", description: "Un producto debe tener al menos un componente/costo.", variant: "destructive" });
      return;
    }
     for (const component of currentProduct.components) {
      if (!component.itemName?.trim() || component.quantity <= 0 || component.purchasePriceAtTimeOfAssembly < 0) {
        toast({ title: "Error en Componente", description: `Revisa el componente "${component.itemName || 'Nuevo'}": nombre, cantidad (>0) y costo (>=0) son obligatorios.`, variant: "destructive" });
        return;
      }
    }
    if ((currentProduct.desiredProfitMargin ?? 0) < 0) {
        toast({title: "Error", description: "El margen de ganancia no puede ser negativo.", variant: "destructive"});
        return;
    }
     if ((currentProduct.desiredProfitMargin ?? 0) >= 100) {
        toast({title: "Advertencia", description: "Un margen >= 100% basado en precio de venta puede no ser lo esperado. Considere un margen sobre costo para valores tan altos.", variant: "default"});
    }

    const productData: Product = {
      id: editingProductId || crypto.randomUUID(),
      name: currentProduct.name as string,
      description: currentProduct.description,
      components: currentProduct.components || [],
      desiredProfitMargin: currentProduct.desiredProfitMargin ?? 0,
      totalComponentCost: currentProduct.totalComponentCost,
      netSalePriceWithoutIVA: currentProduct.netSalePriceWithoutIVA,
      ivaAmountOnSale: currentProduct.ivaAmountOnSale,
      finalSalePriceWithIVA: currentProduct.finalSalePriceWithIVA,
    };

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? productData : p));
      toast({title: "Producto Actualizado", description: `El producto "${productData.name}" ha sido actualizado.`});
    } else {
      setProducts([...products, productData]);
      toast({title: "Producto Creado", description: `El producto "${productData.name}" ha sido creado.`});
    }
    setIsProductDialogOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    const productToEdit = JSON.parse(JSON.stringify(product));
    setCurrentProduct(productToEdit);
    setEditingProductId(product.id);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({title: "Producto Eliminado", description: "El producto ha sido eliminado."});
  };

  const handleAddComponent = () => {
    setCurrentProduct(prev => ({
      ...prev,
      components: [...(prev?.components || []), { inventoryItemId: null, itemName: '', quantity: 1, purchasePriceAtTimeOfAssembly: 0 }]
    }));
  };

  const handleRemoveComponent = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      components: prev.components?.filter((_, i) => i !== index)
    }));
  };
  
  type ProductComponentField = keyof ProductComponent | 'inventoryItemSelection';

  const handleComponentChange = (index: number, field: ProductComponentField, value: string | number | null) => {
    setCurrentProduct(prev => {
        const updatedComponents = JSON.parse(JSON.stringify(prev.components || [])) as ProductComponent[];
        const targetComponent = updatedComponents[index];

        if (field === 'inventoryItemSelection') {
            if (value === 'MANUAL_ENTRY' || value === null) {
                targetComponent.inventoryItemId = null;
                // Do not clear itemName or purchasePrice here, let user edit them
            } else {
                const selectedItem = mockInventoryItems.find(item => item.id === value);
                if (selectedItem) {
                    targetComponent.inventoryItemId = selectedItem.id;
                    targetComponent.itemName = selectedItem.name;
                    targetComponent.purchasePriceAtTimeOfAssembly = selectedItem.purchasePrice;
                }
            }
        } else if (field === 'itemName') {
            targetComponent.itemName = value as string;
        } else if (field === 'quantity') {
            targetComponent.quantity = Number(value) || 0; // Allow decimals for quantity
        } else if (field === 'purchasePriceAtTimeOfAssembly') {
            targetComponent.purchasePriceAtTimeOfAssembly = Math.round(Number(value) || 0);
        }
        
        if (typeof targetComponent.purchasePriceAtTimeOfAssembly !== 'number' || isNaN(targetComponent.purchasePriceAtTimeOfAssembly)) {
            targetComponent.purchasePriceAtTimeOfAssembly = 0;
        }
        if (typeof targetComponent.quantity !== 'number' || isNaN(targetComponent.quantity)) {
            targetComponent.quantity = 1;
        }


        return { ...prev, components: updatedComponents };
    });
  };
  
  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const marginValue = parseFloat(e.target.value);
    setCurrentProduct(prev => ({...prev, desiredProfitMargin: isNaN(marginValue) ? 0 : marginValue }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Análisis de Costos de Productos Vendibles</h1>
        <Dialog open={isProductDialogOpen} onOpenChange={(isOpen) => {
          setIsProductDialogOpen(isOpen);
          if (!isOpen) {
            setCurrentProduct(defaultNewProduct);
            setEditingProductId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setCurrentProduct(defaultNewProduct); setEditingProductId(null); setIsProductDialogOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Producto Vendible
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProductId ? 'Editar' : 'Crear Nuevo'} Producto Vendible</DialogTitle>
              <DialogDescription>
                Define tu producto, sus componentes/costos y el margen de ganancia deseado. Los precios se mostrarán en CLP.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Nombre del Producto Vendible</Label>
                  <Input id="productName" name="productName" value={currentProduct.name || ''} 
                         onChange={(e) => setCurrentProduct(prev => ({...prev, name: e.target.value}))}
                         required />
                </div>
                <div>
                  <Label htmlFor="desiredProfitMargin">Margen de Ganancia Deseado (%)</Label>
                  <Input id="desiredProfitMargin" name="desiredProfitMargin" type="number" step="0.1" 
                         value={currentProduct.desiredProfitMargin ?? ''} 
                         onChange={handleMarginChange}
                         placeholder="Ej: 30 para 30%"
                         min="0"
                         required />
                  <p className="text-xs text-muted-foreground mt-1">Margen sobre el precio de venta neto (antes de IVA).</p>       
                </div>
              </div>
              <div>
                <Label htmlFor="productDescription">Descripción (Opcional)</Label>
                <Textarea id="productDescription" name="productDescription" value={currentProduct.description || ''}
                          onChange={(e) => setCurrentProduct(prev => ({...prev, description: e.target.value}))} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Componentes y Costos del Producto</CardTitle>
                   <CardDescription>Añade componentes de inventario o ingresa costos manualmente.</CardDescription>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddComponent} className="mt-2">
                    <PackagePlus className="mr-2 h-4 w-4" /> Añadir Componente/Costo
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentProduct.components?.map((component, index) => (
                    <div key={index} className="p-3 border rounded-md space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_auto] gap-2 items-end">
                        <div>
                            <Label htmlFor={`componentType-${index}`}>Fuente</Label>
                            <Select
                                value={component.inventoryItemId || 'MANUAL_ENTRY'}
                                onValueChange={(value) => handleComponentChange(index, 'inventoryItemSelection', value)}
                            >
                                <SelectTrigger id={`componentType-${index}`}>
                                    <SelectValue placeholder="Selecciona fuente"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MANUAL_ENTRY">Ingresar Manualmente</SelectItem>
                                    {mockInventoryItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name} (Inventario)
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor={`componentName-${index}`}>Nombre Componente/Costo</Label>
                            <Input
                            id={`componentName-${index}`}
                            value={component.itemName}
                            onChange={(e) => handleComponentChange(index, 'itemName', e.target.value)}
                            readOnly={!!component.inventoryItemId && component.inventoryItemId !== 'MANUAL_ENTRY'}
                            required
                            />
                        </div>
                        <div className="w-full md:w-28">
                            <Label htmlFor={`componentPurchasePrice-${index}`}>Costo Unit. (CLP)</Label>
                            <Input
                            id={`componentPurchasePrice-${index}`}
                            type="number"
                            step="1"
                            value={component.purchasePriceAtTimeOfAssembly ?? 0}
                            onChange={(e) => handleComponentChange(index, 'purchasePriceAtTimeOfAssembly', parseFloat(e.target.value))}
                            readOnly={!!component.inventoryItemId && component.inventoryItemId !== 'MANUAL_ENTRY'}
                            required
                            />
                        </div>
                        <div className="w-full md:w-24">
                            <Label htmlFor={`componentQty-${index}`}>Cantidad</Label>
                            <Input
                            id={`componentQty-${index}`}
                            type="number"
                            value={component.quantity}
                            onChange={(e) => handleComponentChange(index, 'quantity', parseFloat(e.target.value))}
                            min="0" step="any" // Allow decimal for quantity
                            required
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveComponent(index)} aria-label="Eliminar componente">
                            <PackageMinus className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!currentProduct.components || currentProduct.components.length === 0) && (
                    <p className="text-sm text-muted-foreground p-2">Aún no has añadido componentes o costos.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4 bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Coins className="mr-2 h-5 w-5 text-primary"/>Resumen de Precios Calculados (CLP)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Costo Total de Componentes/Costos:</span> <span className="font-semibold">{formatCurrencyCLP(currentProduct.totalComponentCost)}</span></div>
                    <div className="flex justify-between"><span>Precio de Venta Neto (sin IVA):</span> <span className="font-semibold">{formatCurrencyCLP(currentProduct.netSalePriceWithoutIVA)}</span></div>
                    <div className="flex justify-between"><span>IVA ({VAT_RATE*100}%):</span> <span className="font-semibold">{formatCurrencyCLP(currentProduct.ivaAmountOnSale)}</span></div>
                    <div className="flex justify-between font-bold text-base"><span>Precio de Venta Final (con IVA):</span> <span>{formatCurrencyCLP(currentProduct.finalSalePriceWithIVA)}</span></div>
                </CardContent>
              </Card>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingProductId ? 'Actualizar' : 'Guardar'} Producto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos Vendibles</CardTitle>
          <CardDescription>Productos definidos con sus costos y precios calculados según margen (en CLP).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Costo Componentes</TableHead>
                <TableHead className="text-right">Margen Deseado</TableHead>
                <TableHead className="text-right">Precio Neto (s/IVA)</TableHead>
                <TableHead className="text-right">IVA ({VAT_RATE*100}%)</TableHead>
                <TableHead className="text-right">Precio Final (c/IVA)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsWithCalculatedPrices.length > 0 ? productsWithCalculatedPrices.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{formatCurrencyCLP(product.totalComponentCost)}</TableCell>
                  <TableCell className="text-right">{(product.desiredProfitMargin ?? 0).toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{formatCurrencyCLP(product.netSalePriceWithoutIVA)}</TableCell>
                  <TableCell className="text-right">{formatCurrencyCLP(product.ivaAmountOnSale)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrencyCLP(product.finalSalePriceWithIVA)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} aria-label="Editar producto">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} aria-label="Eliminar producto">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">No hay productos vendibles definidos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
