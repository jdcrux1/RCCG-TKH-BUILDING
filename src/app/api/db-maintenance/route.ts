import { NextResponse } from 'next/server';
import { runMaintenance } from '@/lib/db-maintenance';

export async function GET() {
  try {
    const result = await runMaintenance();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Maintenance error:', error);
    return NextResponse.json({ error: 'Maintenance failed' }, { status: 500 });
  }
}