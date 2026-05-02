import { NextResponse } from 'next/server';
import { runMaintenance } from '@/lib/db-maintenance';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runMaintenance();
    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance completed',
      ...result 
    });
  } catch (error) {
    console.error('Maintenance cron error:', error);
    return NextResponse.json({ error: 'Maintenance failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';