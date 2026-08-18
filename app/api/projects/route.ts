import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(30).max(10000),
  category: z.string().min(2).max(80),
  skills: z.array(z.string().min(1).max(60)).min(1).max(20),
  location: z.string().max(120).optional().default(''),
  budget: z.number().nonnegative().max(100000000).optional(),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const project = await db.project.create({
      data: {
        ownerId: user.id,
        title: body.title.trim(),
        description: body.description.trim(),
        category: body.category.trim(),
        skills: body.skills.map((s) => s.trim()).filter(Boolean),
        location: body.location.trim() || null,
        budget: body.budget,
      },
    });

    await db.auditLog.create({
      data: { actorId: user.id, action: 'PROJECT_CREATED', entityType: 'Project', entityId: project.id },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'Invalid project data' }, { status: 400 });
  }
}
