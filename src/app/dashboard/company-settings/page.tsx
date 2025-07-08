"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';

interface CompanySettings {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  direccion: string;
  logoUrl?: string;
}

export default function CompanySettingsPage() {
  const [data, setData] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/company-settings")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLogoPreview(d.logoUrl || null);
        setLogoUrl(d.logoUrl || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!data) return;
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setLogoUrl(""); // Limpiar URL si se sube archivo
    }
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
    if (url) {
      setLogoPreview(url);
      // Limpiar archivo seleccionado
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    if (data) {
      formData.append("nombre", data.nombre || "");
      formData.append("rut", data.rut || "");
      formData.append("telefono", data.telefono || "");
      formData.append("correo", data.correo || "");
      formData.append("direccion", data.direccion || "");
    }
    if (logoInputRef.current?.files?.[0]) {
      formData.append("logo", logoInputRef.current.files[0]);
    }
    if (logoUrl && !logoInputRef.current?.files?.[0]) {
      formData.append("logoUrl", logoUrl);
    }
    const res = await fetch("/api/company-settings", {
      method: "PUT",
      body: formData,
    });
    if (res.ok) {
      const updated = await res.json();
      setData(updated);
      setLogoPreview(updated.logoUrl || null);
      setLogoUrl(updated.logoUrl || "");
      toast({ title: "Datos guardados", description: "La información de la empresa se actualizó correctamente." });
    } else {
      toast({ title: "Error", description: "No se pudo guardar la información.", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[300px]">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-[22px]">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Configuración de Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la empresa</Label>
                <Input name="nombre" id="nombre" value={data?.nombre || ""} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="rut">RUT</Label>
                <Input name="rut" id="rut" value={data?.rut || ""} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input name="telefono" id="telefono" value={data?.telefono || ""} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="correo">Correo</Label>
                <Input name="correo" id="correo" type="email" value={data?.correo || ""} onChange={handleChange} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input name="direccion" id="direccion" value={data?.direccion || ""} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Logo de la empresa</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo" className="text-sm text-muted-foreground">Subir archivo</Label>
                  <Input 
                    ref={logoInputRef} 
                    name="logo" 
                    id="logo" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="logoUrl" className="text-sm text-muted-foreground">O ingresar URL</Label>
                  <Input 
                    name="logoUrl" 
                    id="logoUrl" 
                    type="url" 
                    placeholder="https://ejemplo.com/logo.png"
                    value={logoUrl}
                    onChange={handleLogoUrlChange}
                    className="text-sm"
                  />
                </div>
              </div>
              
              {logoPreview && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <Label className="text-sm text-muted-foreground mb-2 block">Vista previa del logo:</Label>
                  <img 
                    src={logoPreview} 
                    alt="Logo de la empresa" 
                    className="h-24 object-contain rounded shadow"
                    onError={() => {
                      setLogoPreview(null);
                      toast({ 
                        title: "Error", 
                        description: "No se pudo cargar la imagen. Verifica la URL.", 
                        variant: "destructive" 
                      });
                    }}
                  />
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                <p>• Puedes subir un archivo de imagen (JPG, PNG, GIF) o</p>
                <p>• Ingresar una URL externa (ej: Imgur, Cloudinary, etc.)</p>
                <p>• El logo aparecerá en las cotizaciones generadas</p>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 