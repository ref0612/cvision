"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { VAT_RATE } from "@/lib/types";
import jsPDF from "jspdf";
import { 
  Download, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Search,
  Eye,
  Loader2
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceWithVat: number;
  netUnitPrice: number;
}

interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  rut: string;
  telefono: string;
  status: string;
  description?: string;
  totalAmount: number;
  totalNetAmount: number;
  totalIvaAmount: number;
  items: OrderItem[];
}

interface CompanySettings {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  direccion: string;
  logoUrl?: string;
}

export default function QuotationsHistoryPage() {
  const [quotations, setQuotations] = useState<Order[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Estados para edición
  const [editForm, setEditForm] = useState({
    customerName: "",
    rut: "",
    telefono: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar cotizaciones (solo las que tienen estado COTIZACION_ENVIADA)
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();
      const quotationsOnly = ordersData.filter((order: Order) => 
        order.status === "COTIZACION_ENVIADA"
      );
      setQuotations(quotationsOnly);
      
      // Cargar datos de la empresa
      const companyRes = await fetch("/api/company-settings");
      const companyData = await companyRes.json();
      setCompanySettings(companyData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar las cotizaciones.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(quotation =>
    quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewQuotation = (quotation: Order) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  const handleEditQuotation = (quotation: Order) => {
    setSelectedQuotation(quotation);
    setEditForm({
      customerName: quotation.customerName,
      rut: quotation.rut,
      telefono: quotation.telefono,
      description: quotation.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteQuotation = (quotation: Order) => {
    setSelectedQuotation(quotation);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedQuotation) return;

    try {
      const res = await fetch(`/api/orders/${selectedQuotation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar la cotización");
      }

      toast({ 
        title: "Éxito", 
        description: "Cotización actualizada correctamente." 
      });
      
      setIsEditDialogOpen(false);
      loadData(); // Recargar datos
    } catch (error) {
      console.error("Error updating quotation:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo actualizar la cotización.", 
        variant: "destructive" 
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuotation) return;

    try {
      const res = await fetch(`/api/orders/${selectedQuotation.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la cotización");
      }

      toast({ 
        title: "Éxito", 
        description: "Cotización eliminada correctamente." 
      });
      
      setIsDeleteDialogOpen(false);
      loadData(); // Recargar datos
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar la cotización.", 
        variant: "destructive" 
      });
    }
  };

  const generatePDF = async (quotation: Order) => {
    if (!companySettings) {
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar los datos de la empresa.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Colores y helpers
      const primaryColor = [41, 128, 185]; // Azul profesional
      const secondaryColor = [52, 73, 94]; // Gris oscuro
      const lightGray = [236, 240, 241]; // Gris claro
      const borderRadius = 4;
      const shadowColor = [200, 200, 200];
      const formatCLP = (n: number) => n.toLocaleString('es-CL');

      // Logo centrado y grande
      const addLogo = async () => {
        if (companySettings.logoUrl && companySettings.logoUrl.startsWith('http')) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = companySettings.logoUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              setTimeout(reject, 5000);
            });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            // Centrado
            pdf.addImage(imgData, 'PNG', pageWidth/2-25, yPosition, 50, 25);
            return true;
          } catch {}
        }
        return false;
      };
      const logoAdded = await addLogo();
      if (logoAdded) yPosition += 32;

      // Título principal
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.roundedRect(0, yPosition - 5, pageWidth, 18, borderRadius, borderRadius, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("COTIZACIÓN", pageWidth / 2, yPosition + 8, { align: "center" });
      yPosition += 25;

      // Bloque empresa
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.setDrawColor(shadowColor[0], shadowColor[1], shadowColor[2]);
      pdf.roundedRect(15, yPosition, pageWidth-30, 38, borderRadius, borderRadius, 'FD');
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text(companySettings.nombre, 20, yPosition+8);
      pdf.setFontSize(10);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFont("helvetica", "normal");
      pdf.text(`RUT: ${companySettings.rut}`, 20, yPosition+16);
      pdf.text(`Teléfono: ${companySettings.telefono}`, 20, yPosition+22);
      pdf.text(`Email: ${companySettings.correo}`, 20, yPosition+28);
      pdf.text(`Dirección: ${companySettings.direccion}`, 20, yPosition+34);
      // Fecha, ID y válido hasta
      const fecha = new Date(quotation.orderDate);
      const fechaStr = fecha.toLocaleDateString('es-CL');
      const validoHasta = new Date(fecha.getTime() + 30*24*60*60*1000).toLocaleDateString('es-CL');
      pdf.setFontSize(10);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.text(`Fecha: ${fechaStr}`, pageWidth-20, yPosition+10, {align:'right'});
      pdf.text(`Cotización: ${quotation.id}`, pageWidth-20, yPosition+16, {align:'right'});
      pdf.text(`Válido hasta: ${validoHasta}`, pageWidth-20, yPosition+22, {align:'right'});
      yPosition += 45;

      // Bloque cliente
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.setDrawColor(shadowColor[0], shadowColor[1], shadowColor[2]);
      pdf.roundedRect(15, yPosition, pageWidth-30, 28, borderRadius, borderRadius, 'FD');
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text("DATOS DEL CLIENTE", 20, yPosition+8);
      pdf.setFontSize(10);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Nombre: ${quotation.customerName}`, 20, yPosition+16);
      pdf.text(`RUT: ${quotation.rut}`, 20, yPosition+22);
      pdf.text(`Teléfono: ${quotation.telefono}`, 20, yPosition+28);
      yPosition += 32;

      // Descripción si existe
      if (quotation.description) {
        pdf.setFillColor(255,255,255);
        pdf.setDrawColor(shadowColor[0], shadowColor[1], shadowColor[2]);
        pdf.roundedRect(15, yPosition, pageWidth-30, 12, borderRadius, borderRadius, 'FD');
        pdf.setFontSize(10);
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.setFont("helvetica", "italic");
        pdf.text(`Descripción: ${quotation.description}`, 20, yPosition+8);
        yPosition += 16;
      }

      // Tabla productos
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.roundedRect(15, yPosition, pageWidth-30, 12, borderRadius, borderRadius, 'F');
      pdf.setTextColor(255,255,255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      const colX = [20, 90, 120, 150, pageWidth-20];
      pdf.text("Producto", colX[0], yPosition+8);
      pdf.text("Cant.", colX[1], yPosition+8);
      pdf.text("P.Unit.", colX[2], yPosition+8);
      pdf.text("Total", colX[3], yPosition+8);
      yPosition += 14;
      // Filas alternadas
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      quotation.items.forEach((item, idx) => {
        if (yPosition > pageHeight-60) { pdf.addPage(); yPosition = 20; }
        if (idx%2===0) {
          pdf.setFillColor(248,249,250);
          pdf.roundedRect(15, yPosition-2, pageWidth-30, 9, borderRadius, borderRadius, 'F');
        }
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.text(item.productName, colX[0], yPosition+6);
        pdf.text(item.quantity.toString(), colX[1], yPosition+6, {align:'right'});
        pdf.text(formatCLP(item.unitPriceWithVat), colX[2], yPosition+6, {align:'right'});
        pdf.text(formatCLP(item.quantity*item.unitPriceWithVat), colX[3], yPosition+6, {align:'right'});
        yPosition += 9;
      });
      yPosition += 2;
      // Línea separadora
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setLineWidth(0.7);
      pdf.line(15, yPosition, pageWidth-15, yPosition);
      yPosition += 6;

      // Bloque totales
      pdf.setFillColor(245,245,245);
      pdf.setDrawColor(shadowColor[0], shadowColor[1], shadowColor[2]);
      pdf.roundedRect(pageWidth-80, yPosition, 65, 28, borderRadius, borderRadius, 'FD');
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.text("Subtotal Neto:", pageWidth-78, yPosition+8);
      pdf.text(formatCLP(quotation.totalNetAmount), pageWidth-18, yPosition+8, {align:'right'});
      pdf.text("IVA (19%):", pageWidth-78, yPosition+15);
      pdf.text(formatCLP(quotation.totalIvaAmount), pageWidth-18, yPosition+15, {align:'right'});
      pdf.setFontSize(13);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text("TOTAL:", pageWidth-78, yPosition+24);
      pdf.text(formatCLP(quotation.totalAmount), pageWidth-18, yPosition+24, {align:'right'});
      yPosition += 36;

      // Footer personalizado
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.setLineWidth(0.3);
      pdf.line(15, pageHeight-25, pageWidth-15, pageHeight-25);
      pdf.setFontSize(8);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.text("Esta cotización tiene una validez de 30 días desde la fecha de emisión.", pageWidth/2, pageHeight-20, {align:'center'});
      pdf.text("Para consultas, contacte a nuestra empresa.", pageWidth/2, pageHeight-16, {align:'center'});
      pdf.text(`Email: ${companySettings.correo} | Tel: ${companySettings.telefono}`, pageWidth/2, pageHeight-12, {align:'center'});

      // Descargar PDF
      const fileName = `cotizacion_${quotation.customerName.replace(/\s+/g, '_')}_${fechaStr.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      toast({ 
        title: "PDF generado", 
        description: "La cotización se ha descargado correctamente." 
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo generar el PDF.", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COTIZACION_ENVIADA":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Cotización Enviada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-4 bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <h1 className="text-3xl font-headline font-semibold">Historial de Cotizaciones</h1>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, RUT o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Cotizaciones</CardTitle>
          <CardDescription>
            Historial de todas las cotizaciones enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando cotizaciones...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-32">
                        {searchTerm ? "No se encontraron cotizaciones con ese criterio" : "No hay cotizaciones registradas"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-mono text-sm">{quotation.id.slice(-8)}</TableCell>
                        <TableCell>
                          {new Date(quotation.orderDate).toLocaleDateString('es-CL')}
                        </TableCell>
                        <TableCell className="font-medium">{quotation.customerName}</TableCell>
                        <TableCell>{quotation.rut}</TableCell>
                        <TableCell>{quotation.telefono}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${quotation.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQuotation(quotation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generatePDF(quotation)}
                              disabled={isGeneratingPDF}
                            >
                              {isGeneratingPDF ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuotation(quotation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuotation(quotation)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver cotización */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Cotización</DialogTitle>
            <DialogDescription>
              Información completa de la cotización seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-6">
              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedQuotation.customerName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">RUT</Label>
                  <span>{selectedQuotation.rut}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedQuotation.telefono}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Fecha</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(selectedQuotation.orderDate).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Productos</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuotation.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.unitPriceWithVat.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.quantity * item.unitPriceWithVat).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totales */}
              <div className="flex justify-end">
                <div className="space-y-2 text-right">
                  <div className="text-sm text-muted-foreground">
                    Subtotal Neto: ${selectedQuotation.totalNetAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    IVA (19%): ${selectedQuotation.totalIvaAmount.toLocaleString()}
                  </div>
                  <div className="text-lg font-bold">
                    Total: ${selectedQuotation.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar cotización */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cotización</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre del Cliente</Label>
              <Input
                id="customerName"
                value={editForm.customerName}
                onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                value={editForm.rut}
                onChange={(e) => setEditForm(prev => ({ ...prev, rut: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={editForm.telefono}
                onChange={(e) => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Cotización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta cotización? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 