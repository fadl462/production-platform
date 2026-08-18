import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const applications = await db.application.findMany({
    where: { applicantId: user.id },
    include: { project: { include: { owner: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(applications);
}
