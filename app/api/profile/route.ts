import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(2000).optional().default(''),
  location: z.string().max(120).optional().default(''),
  skills: z.array(z.string().min(1).max(60)).max(30).default([]),
  categories: z.array(z.string().min(1).max(60)).max(20).default([]),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
});

function completion(input: z.infer<typeof schema>) {
  const checks = [input.name.trim().length >= 2, input.bio.trim().length >= 50, input.location.trim().length > 0, input.skills.length >= 3, input.categories.length > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ name: user.name, email: user.email, bio: user.bio || '', location: user.location || '', visibility: user.visibility, skills: user.profile?.skills || [], categories: user.profile?.categories || [], completion: user.profile?.completion || 0 });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const updated = await db.user.update({ where: { id: user.id }, data: { name: body.name.trim(), bio: body.bio.trim(), location: body.location.trim(), visibility: body.visibility, profile: { upsert: { create: { skills: body.skills, categories: body.categories, completion: completion(body) }, update: { skills: body.skills, categories: body.categories, completion: completion(body) } } } }, include: { profile: true } });
    await db.auditLog.create({ data: { actorId: user.id, action: 'PROFILE_UPDATED', entityType: 'User', entityId: user.id } });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'Invalid profile data' }, { status: 400 });
  }
}
