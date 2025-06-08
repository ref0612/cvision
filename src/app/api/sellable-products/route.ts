import { NextResponse } from 'next/server';
import { 
  getSellableProducts, 
  createSellableProduct, 
  updateSellableProduct, 
  deleteSellableProduct,
  SellableProduct
} from '@/lib/sellable-products';

export async function GET() {
  try {
    const products = await getSellableProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching sellable products:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    const newProduct = await createSellableProduct({
      ...productData,
      components: productData.components || []
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...productData } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del producto' },
        { status: 400 }
      );
    }
    
    const updatedProduct = await updateSellableProduct(id, productData);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del producto' },
        { status: 400 }
      );
    }
    
    await deleteSellableProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
}
