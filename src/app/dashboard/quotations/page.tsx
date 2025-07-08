"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { VAT_RATE } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceWithVat: number;
  netUnitPrice: number;
}

interface CompanySettings {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  direccion: string;
  logoUrl?: string;
}

export default function QuotationsPage() {
  const [customerName, setCustomerName] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Cargar inventario
    fetch("/api/productos")
      .then(res => res.json())
      .then(data => setInventory(data));
    
    // Cargar datos de la empresa
    fetch("/api/company-settings")
      .then(res => res.json())
      .then(data => setCompanySettings(data));
  }, []);

  const handleAddItem = () => {
    const product = inventory.find(i => i.id === selectedProductId);
    if (!product || selectedQuantity <= 0 || selectedUnitPrice <= 0) {
      toast({ title: "Error", description: "Selecciona producto, cantidad y precio válidos.", variant: "destructive" });
      return;
    }
    if (selectedQuantity > product.quantity) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${product.quantity} unidades disponibles.`, variant: "destructive" });
      return;
    }
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity: selectedQuantity,
        unitPriceWithVat: selectedUnitPrice,
        netUnitPrice: Math.round(selectedUnitPrice / (1 + VAT_RATE)),
      },
    ]);
    setSelectedProductId("");
    setSelectedQuantity(1);
    setSelectedUnitPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const totalNet = items.reduce((sum, i) => sum + i.netUnitPrice * i.quantity, 0);
  const totalIva = items.reduce((sum, i) => sum + (i.unitPriceWithVat - i.netUnitPrice) * i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.unitPriceWithVat * i.quantity, 0);

  const generatePDF = async () => {
    if (!companySettings) {
      toast({ title: "Error", description: "No se pudieron cargar los datos de la empresa.", variant: "destructive" });
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Configurar colores
    const primaryColor = [41, 128, 185]; // Azul profesional
    const secondaryColor = [52, 73, 94]; // Gris oscuro
    const lightGray = [236, 240, 241]; // Gris claro

    // Función para agregar logo
    const addLogo = async () => {
      if (companySettings.logoUrl && companySettings.logoUrl.startsWith('http')) {
        try {
          // Intentar cargar logo desde URL externa
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = companySettings.logoUrl;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(reject, 5000); // Timeout de 5 segundos
          });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 20, yPosition, 30, 15);
          return true;
        } catch (error) {
          console.log('No se pudo cargar el logo:', error);
        }
      }
      return false;
    };

    // Intentar agregar logo
    const logoAdded = await addLogo();
    if (logoAdded) {
      yPosition += 20; // Espacio para el logo
    }

    // Título principal con estilo profesional
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, yPosition - 5, pageWidth, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("COTIZACIÓN", pageWidth / 2, yPosition + 5, { align: "center" });
    
    // Resetear color de texto
    pdf.setTextColor(0, 0, 0);
    yPosition += 25;

    // Información de la empresa
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 35, 'F');
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(companySettings.nombre, 25, yPosition);
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`RUT: ${companySettings.rut}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Teléfono: ${companySettings.telefono}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${companySettings.correo}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Dirección: ${companySettings.direccion}`, 25, yPosition);
    yPosition += 15;

    // Fecha y número de cotización
    const fecha = new Date().toLocaleDateString('es-CL');
    const cotizacionId = `COT-${Date.now().toString().slice(-6)}`;
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`Fecha: ${fecha}`, pageWidth - 25, yPosition - 10, { align: "right" });
    pdf.text(`Cotización: ${cotizacionId}`, pageWidth - 25, yPosition - 5, { align: "right" });

    // Datos del cliente
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("DATOS DEL CLIENTE", 25, yPosition);
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`Nombre: ${customerName}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`RUT: ${rut}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Teléfono: ${telefono}`, 25, yPosition);
    yPosition += 15;

    // Tabla de productos con diseño profesional
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    
    // Encabezados de tabla
    const colX = [25, 80, 110, 140, 170];
    pdf.text("Producto", colX[0], yPosition);
    pdf.text("Cant.", colX[1], yPosition);
    pdf.text("P.Unit.", colX[2], yPosition);
    pdf.text("Total", colX[3], yPosition);
    yPosition += 12;

    // Línea separadora
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Productos
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    
    for (const item of items) {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Fondo alternado para filas
      const rowIndex = items.indexOf(item);
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'F');
      }
      
      pdf.text(item.productName, colX[0], yPosition);
      pdf.text(item.quantity.toString(), colX[1], yPosition);
      pdf.text(item.unitPriceWithVat.toLocaleString(), colX[2], yPosition);
      pdf.text((item.quantity * item.unitPriceWithVat).toLocaleString(), colX[3], yPosition);
      yPosition += 8;
    }

    // Totales con diseño profesional
    yPosition += 5;
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;
    
    // Fondo para totales
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(120, yPosition - 5, 70, 25, 'F');
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text("Subtotal Neto:", pageWidth - 80, yPosition, { align: "right" });
    pdf.text(totalNet.toLocaleString(), pageWidth - 25, yPosition, { align: "right" });
    yPosition += 6;
    
    pdf.text("IVA (19%):", pageWidth - 80, yPosition, { align: "right" });
    pdf.text(totalIva.toLocaleString(), pageWidth - 25, yPosition, { align: "right" });
    yPosition += 6;
    
    pdf.setFontSize(12);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("TOTAL:", pageWidth - 80, yPosition, { align: "right" });
    pdf.text(total.toLocaleString(), pageWidth - 25, yPosition, { align: "right" });

    // Pie de página
    yPosition = pageHeight - 20;
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;
    pdf.setFontSize(8);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text("Esta cotización tiene una validez de 30 días desde la fecha de emisión.", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 4;
    pdf.text("Para consultas, contacte a nuestra empresa.", pageWidth / 2, yPosition, { align: "center" });

    // Descargar PDF
    const fileName = `cotizacion_${customerName.replace(/\s+/g, '_')}_${fecha.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
  };

  const handleGenerate = async () => {
    if (!customerName || !rut || !telefono || items.length === 0) {
      toast({ title: "Completa todos los campos y agrega al menos un producto.", variant: "destructive" });
      return;
    }
    if (!companySettings) {
      toast({ title: "Error", description: "No se pudieron cargar los datos de la empresa.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Guardar cotización como pedido (estado Cotización Enviada)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          rut,
          telefono,
          items,
          totalAmount: total,
          totalNetAmount: totalNet,
          totalIvaAmount: totalIva,
          status: "COTIZACION_ENVIADA",
        }),
      });
      if (!res.ok) {
        toast({ title: "Error al guardar la cotización" });
        return;
      }

      // 2. Generar y descargar PDF
      await generatePDF();
      
      toast({ title: "Cotización generada y guardada", description: "PDF descargado exitosamente." });
      
      // Limpiar formulario
      setCustomerName("");
      setRut("");
      setTelefono("");
      setItems([]);
    } catch (error) {
      toast({ title: "Error", description: "Error al generar la cotización.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Generar Cotización</CardTitle>
        </CardHeader>
        <form onSubmit={e => { e.preventDefault(); handleGenerate(); }}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nombre Cliente</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div>
                <Label>RUT</Label>
                <Input value={rut} onChange={e => setRut(e.target.value)} required />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={e => setTelefono(e.target.value)} required />
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-2">Productos</h4>
              <div className="flex flex-col md:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Label>Producto</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map(item => (
                        <SelectItem key={item.id} value={item.id}>{item.name} (Stock: {item.quantity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input type="number" min={1} value={selectedQuantity} onChange={e => setSelectedQuantity(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Precio Unitario (c/IVA)</Label>
                  <Input type="number" min={0} value={selectedUnitPrice} onChange={e => setSelectedUnitPrice(Number(e.target.value))} />
                </div>
                <Button type="button" variant="outline" onClick={handleAddItem}>Agregar</Button>
              </div>
              <div className="mt-4 space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 border rounded p-2">
                    <div className="flex-1">
                      <span className="font-medium">{item.productName}</span> x {item.quantity} @ {item.unitPriceWithVat} CLP
                    </div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(item.id)}>Quitar</Button>
                  </div>
                ))}
                {items.length === 0 && <div className="text-muted-foreground text-sm">No hay productos agregados.</div>}
              </div>
            </div>
            <div className="border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>Subtotal Neto: <span className="font-semibold">{totalNet.toLocaleString()} CLP</span></div>
              <div>IVA: <span className="font-semibold">{totalIva.toLocaleString()} CLP</span></div>
              <div>Total: <span className="font-bold text-primary">{total.toLocaleString()} CLP</span></div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? "Generando..." : "Generar Cotización"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 