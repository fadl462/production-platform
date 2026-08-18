import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const schema = z.object({ status: z.enum(['SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const { status } = schema.parse(await req.json());
    const application = await db.application.findUnique({
      where: { id },
      include: { project: true, applicant: true },
    });
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    if (application.project.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (application.status === 'WITHDRAWN') return NextResponse.json({ error: 'Withdrawn applications cannot be changed' }, { status: 400 });

    const updated = await db.$transaction(async (tx) => {
      const next = await tx.application.update({ where: { id }, data: { status } });

      if (status === 'ACCEPTED') {
        await tx.project.update({ where: { id: application.projectId }, data: { status: 'ACTIVE' } });
        await tx.application.updateMany({
          where: { projectId: application.projectId, id: { not: id }, status: { in: ['SUBMITTED', 'SHORTLISTED'] } },
          data: { status: 'REJECTED' },
        });
      }

      await tx.notification.create({
        data: {
          userId: application.applicantId,
          title: status === 'ACCEPTED' ? 'Application accepted' : 'Application status updated',
          body: status === 'ACCEPTED'
            ? `Your application for “${application.project.title}” was accepted.`
            : `Your application for “${application.project.title}” is now ${status.toLowerCase().replace('_', ' ')}.`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: `APPLICATION_${status}`,
          entityType: 'Application',
          entityId: id,
          metadata: { projectId: application.projectId, applicantId: application.applicantId },
        },
      });
      return next;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'Invalid status' }, { status: 400 });
  }
}
