'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit2, Trash2, PackagePlus, PackageMinus, Coins, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatCurrencyCLP } from '@/lib/utils';
import { 
  SellableProduct, 
  ProductComponent,
  createSellableProduct, 
  updateSellableProduct, 
  deleteSellableProduct 
} from '@/lib/sellable-products';
import { getInventoryItems } from '@/lib/inventory';

const VAT_RATE = 0.19; // 19% de IVA

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  sku?: string;
}

export default function CostAnalysisPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<SellableProduct[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  const defaultNewProduct: Partial<SellableProduct> = { 
    name: '',
    components: [], 
    desiredProfitMargin: 30,
    totalComponentCost: 0,
    netSalePriceWithoutIVA: 0,
    ivaAmountOnSale: 0,
    finalSalePriceWithIVA: 0,
  };
  
  const [currentProduct, setCurrentProduct] = useState<Partial<SellableProduct>>(defaultNewProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Cargar productos e ítems de inventario al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar productos desde la API
        const productsResponse = await fetch('/api/sellable-products');
        if (!productsResponse.ok) {
          throw new Error('Error al cargar los productos');
        }
        const productsData = await productsResponse.json();
        
        // Cargar ítems de inventario
        const inventoryItems = await getInventoryItems();
        
        setProducts(productsData);
        setInventoryItems(inventoryItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          sku: item.sku || undefined
        })));
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos. Intente nuevamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Calcular precios cuando cambian los componentes o el margen
  useEffect(() => {
    if (!isProductDialogOpen) return;
    
    const calculatePricing = () => {
      if (!currentProduct.components || currentProduct.components.length === 0) {
        return {
          totalComponentCost: 0,
          netSalePriceWithoutIVA: 0,
          ivaAmountOnSale: 0,
          finalSalePriceWithIVA: 0,
        };
      }
      
      const totalCost = currentProduct.components.reduce<number>(
        (sum, comp) => sum + ((comp.purchasePriceAtTimeOfAssembly || 0) * (comp.quantity || 0)), 0
      );
      
      const margin = currentProduct.desiredProfitMargin || 0;
      let netSalePrice = totalCost;
      
      if (margin < 100 && margin >= 0) {
        netSalePrice = totalCost / (1 - (margin / 100));
      }
      
      const iva = netSalePrice * VAT_RATE;
      const finalPrice = netSalePrice + iva;
      
      return {
        totalComponentCost: Math.round(totalCost),
        netSalePriceWithoutIVA: Math.round(netSalePrice),
        ivaAmountOnSale: Math.round(iva),
        finalSalePriceWithIVA: Math.round(finalPrice),
      };
    };
    
    const newPricing = calculatePricing();
    setCurrentProduct(prev => ({
      ...prev,
      ...newPricing,
    }));
  }, [currentProduct.components, currentProduct.desiredProfitMargin, isProductDialogOpen]);

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
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
        toast({ 
          title: "Error en Componente", 
          description: `Revisa el componente "${component.itemName || 'Nuevo'}": nombre, cantidad (>0) y costo (>=0) son obligatorios.`, 
          variant: "destructive" 
        });
        return;
      }
    }
    
    if ((currentProduct.desiredProfitMargin ?? 0) < 0) {
      toast({
        title: "Error", 
        description: "El margen de ganancia no puede ser negativo.", 
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingProductId) {
        // Actualizar producto existente a través de la API
        const response = await fetch('/api/sellable-products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingProductId,
            ...currentProduct,
            name: currentProduct.name || '',
            components: currentProduct.components || [],
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al actualizar el producto');
        }

        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === editingProductId ? updatedProduct : p));
        
        toast({
          title: '¡Producto actualizado!',
          description: 'El producto se ha actualizado correctamente.',
        });
      } else {
        // Crear nuevo producto a través de la API
        const response = await fetch('/api/sellable-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...currentProduct,
            components: currentProduct.components || [],
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear el producto');
        }

        const newProduct = await response.json();
        setProducts([...products, newProduct]);
        
        toast({
          title: '¡Producto creado!',
          description: 'El producto se ha creado correctamente.',
        });
      }
      
      // Cerrar el diálogo y limpiar el estado
      setIsProductDialogOpen(false);
      setCurrentProduct(defaultNewProduct);
      setEditingProductId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el producto. Intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: SellableProduct) => {
    setCurrentProduct(JSON.parse(JSON.stringify(product)));
    setEditingProductId(product.id);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/sellable-products?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar el producto');
      }
      
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Producto Eliminado", 
        description: "El producto ha sido eliminado correctamente."
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el producto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComponent = () => {
    setCurrentProduct(prev => ({
      ...prev,
      components: [
        ...(prev?.components || []), 
        { 
          itemName: '', 
          quantity: 1, 
          purchasePriceAtTimeOfAssembly: 0,
          inventoryItemId: null,
        }
      ]
    }));
  };

  const handleRemoveComponent = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      components: prev.components?.filter((_, i) => i !== index) || []
    }));
  };
  
  type ProductComponentField = keyof ProductComponent | 'inventoryItemSelection';

  const handleComponentChange = (index: number, field: ProductComponentField, value: string | number | null) => {
    setCurrentProduct(prev => {
      const updatedComponents = JSON.parse(JSON.stringify(prev.components || [])) as ProductComponent[];
      const targetComponent = updatedComponents[index];

      if (!targetComponent) return prev;

      if (field === 'inventoryItemSelection') {
        if (value === 'MANUAL_ENTRY' || value === null) {
          targetComponent.inventoryItemId = null;
          // No borrar nombre o precio, permitir edición manual
        } else {
          const selectedItem = inventoryItems.find(item => item.id === value);
          if (selectedItem) {
            targetComponent.inventoryItemId = selectedItem.id;
            targetComponent.itemName = selectedItem.name;
            targetComponent.purchasePriceAtTimeOfAssembly = selectedItem.purchasePrice;
          }
        }
      } else if (field === 'itemName') {
        targetComponent.itemName = value as string;
      } else if (field === 'quantity') {
        targetComponent.quantity = Number(value) || 0; // Permitir decimales para cantidad
      } else if (field === 'purchasePriceAtTimeOfAssembly') {
        targetComponent.purchasePriceAtTimeOfAssembly = Math.round(Number(value) || 0);
      }
      
      // Validaciones
      if (typeof targetComponent.purchasePriceAtTimeOfAssembly !== 'number' || 
          isNaN(targetComponent.purchasePriceAtTimeOfAssembly)) {
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
    setCurrentProduct(prev => ({
      ...prev, 
      desiredProfitMargin: isNaN(marginValue) ? 0 : marginValue 
    }));
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
                                    {inventoryItems.map((item: InventoryItem) => (
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
                <TableHead className="text-right">IVA ({(VAT_RATE * 100).toFixed(0)}%)</TableHead>
                <TableHead className="text-right">Precio Final (c/IVA)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando productos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product: SellableProduct) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No hay productos vendibles definidos. Crea tu primer producto para comenzar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
