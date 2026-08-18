import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json(items);
}
