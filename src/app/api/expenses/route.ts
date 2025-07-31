import prisma from '@/lib/db';
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const expense = await prisma.expense.create({
      data: {
        date: data.date ? new Date(data.date) : new Date(),
        category: data.category,
        amount: data.amount,
        hasInvoice: !!data.hasInvoice,
        description: data.description || null,
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar egreso' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    let where = {};
    if (from && to) {
      where = {
        date: {
          gte: new Date(from),
          lte: new Date(to)
        }
      };
    }
    const expenses = await prisma.expense.findMany({ where });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener egresos' }, { status: 500 });
  }
}
