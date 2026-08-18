import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const createSchema = z.object({
  projectId: z.string().optional(),
  participantId: z.string().optional(),
}).refine((v) => Boolean(v.projectId || v.participantId), { message: 'projectId or participantId is required' });

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const memberships = await db.conversationMember.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          project: true,
          members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { name: true } } } },
        },
      },
    },
    orderBy: { conversation: { createdAt: 'desc' } },
  });
  return NextResponse.json(memberships.map((m) => ({ ...m.conversation, lastReadAt: m.lastReadAt })));
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = createSchema.parse(await req.json());

    if (body.projectId) {
      const project = await db.project.findUnique({ where: { id: body.projectId }, include: { applications: { where: { status: 'ACCEPTED' }, take: 1 } } });
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      const isOwner = project.ownerId === user.id;
      const isAccepted = project.applications[0]?.applicantId === user.id;
      if (!isOwner && !isAccepted) return NextResponse.json({ error: 'Project conversation is restricted to the owner and selected applicant' }, { status: 403 });

      const existing = await db.conversation.findUnique({ where: { projectId: body.projectId } });
      if (existing) return NextResponse.json(existing);
      const participantId = isOwner ? project.applications[0]?.applicantId : project.ownerId;
      if (!participantId) return NextResponse.json({ error: 'A selected applicant is required before messaging' }, { status: 400 });
      const conversation = await db.conversation.create({
        data: { projectId: body.projectId, members: { create: [{ userId: user.id }, { userId: participantId }] } },
      });
      return NextResponse.json(conversation, { status: 201 });
    }

    if (body.participantId === user.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    const participant = await db.user.findUnique({ where: { id: body.participantId }, select: { id: true } });
    if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

    const memberships = await db.conversationMember.findMany({ where: { userId: user.id }, select: { conversationId: true } });
    for (const membership of memberships) {
      const conversation = await db.conversation.findUnique({ where: { id: membership.conversationId }, select: { projectId: true } });
      if (conversation?.projectId) continue;
      const members = await db.conversationMember.findMany({ where: { conversationId: membership.conversationId }, select: { userId: true } });
      if (members.length === 2 && members.some((m) => m.userId === body.participantId)) {
        return NextResponse.json({ id: membership.conversationId });
      }
    }

    const conversation = await db.conversation.create({
      data: { members: { create: [{ userId: user.id }, { userId: body.participantId }] } },
    });
    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'Invalid conversation request' }, { status: 400 });
  }
}
