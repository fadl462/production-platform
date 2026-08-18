import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const schema = z.object({ body: z.string().trim().min(1).max(5000) });

async function member(conversationId: string, userId: string) {
  return db.conversationMember.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const membership = await member(id, user.id);
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const messages = await db.message.findMany({ where: { conversationId: id }, include: { sender: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' }, take: 200 });
  await db.conversationMember.update({ where: { conversationId_userId: { conversationId: id, userId: user.id } }, data: { lastReadAt: new Date() } });
  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const membership = await member(id, user.id);
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = schema.parse(await req.json());
    const created = await db.$transaction(async (tx) => {
      const message = await tx.message.create({ data: { conversationId: id, senderId: user.id, body: body.body } });
      const recipients = await tx.conversationMember.findMany({ where: { conversationId: id, userId: { not: user.id } } });
      if (recipients.length) {
        await tx.notification.createMany({ data: recipients.map((r) => ({ userId: r.userId, title: `New message from ${user.name}`, body: body.body.slice(0, 160) })) });
      }
      return message;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'Invalid message' }, { status: 400 });
  }
}
