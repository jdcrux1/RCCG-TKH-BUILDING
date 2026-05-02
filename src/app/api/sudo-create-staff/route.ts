export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifySudoToken, logAction } from '@/lib/sudo-auth';

export async function POST(request: Request) {
  if (!await verifySudoToken(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username, password, role } = await request.json();
  const hashed = await bcrypt.hash(password, 10);

  const staff = await prisma.staff.create({
    data: { username, password: hashed, role },
  });

  await logAction('SuperAdmin', `Created ${role}`, staff.id, username);

  return NextResponse.json(staff);
}