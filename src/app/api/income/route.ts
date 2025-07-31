import prisma from '@/lib/db';
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newIncome = await prisma.income.create({
      data: {
        date: data.date ? new Date(data.date) : new Date(),
        source: data.source,
        amount: data.amount,
        netAmount: data.netAmount,
        ivaAmount: data.ivaAmount,
        description: data.description || null,
      }
    });
    return NextResponse.json(newIncome);
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar ingreso' }, { status: 500 });
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
    const income = await prisma.income.findMany({ where });
    return NextResponse.json(income);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ingresos' }, { status: 500 });
  }
}
