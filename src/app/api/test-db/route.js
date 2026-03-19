import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    await prisma.$connect();
    console.log('Connected to database');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query successful:', result);
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: 'Database connected successfully'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      meta: error.meta,
      clientVersion: error.clientVersion
    }, { status: 500 });
  }
}