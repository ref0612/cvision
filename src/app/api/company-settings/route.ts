import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Obtener datos de la empresa
export async function GET() {
  const settings = await prisma.companySettings.findUnique({ where: { id: 1 } });
  return NextResponse.json(settings || {});
}

// PUT: Actualizar datos de la empresa (incluye logo)
export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const nombre = formData.get('nombre') as string;
  const rut = formData.get('rut') as string;
  const telefono = formData.get('telefono') as string;
  const correo = formData.get('correo') as string;
  const direccion = formData.get('direccion') as string;
  const logoFile = formData.get('logo') as File | null;
  const logoUrl = formData.get('logoUrl') as string | null; // Para URLs externas

  let finalLogoUrl: string | undefined = undefined;

  // Si se subió un archivo, procesarlo
  if (logoFile && logoFile.size > 0) {
    // Por ahora, vamos a usar una URL externa de ejemplo
    // En producción, deberías usar Vercel Blob, AWS S3, o similar
    finalLogoUrl = 'https://via.placeholder.com/200x100/3498db/ffffff?text=LOGO';
    
    // Alternativa: puedes subir a servicios como Imgur, Cloudinary, etc.
    // Ejemplo con Imgur (requiere API key):
    // const imgurResponse = await fetch('https://api.imgur.com/3/image', {
    //   method: 'POST',
    //   headers: { 'Authorization': 'Client-ID YOUR_CLIENT_ID' },
    //   body: formData
    // });
    // const imgurData = await imgurResponse.json();
    // finalLogoUrl = imgurData.data.link;
  }
  // Si se proporcionó una URL externa
  else if (logoUrl && logoUrl.trim()) {
    finalLogoUrl = logoUrl.trim();
  }

  // Upsert (crea o actualiza el registro único)
  const updated = await prisma.companySettings.upsert({
    where: { id: 1 },
    update: {
      nombre, rut, telefono, correo, direccion,
      ...(finalLogoUrl ? { logoUrl: finalLogoUrl } : {}),
    },
    create: {
      id: 1, nombre, rut, telefono, correo, direccion, logoUrl: finalLogoUrl || '',
    },
  });

  return NextResponse.json(updated);
} 