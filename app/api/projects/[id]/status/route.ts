import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const schema = z.object({ status: z.enum(['OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED']) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const { status } = schema.parse(await req.json());
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (project.status === 'CANCELLED' || project.status === 'COMPLETED') return NextResponse.json({ error: 'Completed or cancelled projects cannot be reopened from this control' }, { status: 400 });

    const updated = await db.project.update({ where: { id }, data: { status } });
    await db.auditLog.create({ data: { actorId: user.id, action: `PROJECT_${status}`, entityType: 'Project', entityId: id } });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'Invalid project status' }, { status: 400 });
  }
}
