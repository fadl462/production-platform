import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { MessageComposer } from './ui';

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect('/login');
  const { id } = await params;
  const membership = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: user.id } },
    include: {
      conversation: {
        include: {
          project: true,
          members: { include: { user: { select: { id: true, name: true } } } },
          messages: { include: { sender: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' }, take: 200 },
        },
      },
    },
  });
  if (!membership) notFound();
  const other = membership.conversation.members.find(x => x.userId !== user.id)?.user;
  return <main className="container narrow"><Link href="/messages" className="muted">← Messages</Link><div className="page-heading"><div><span className="eyebrow">CONVERSATION</span><h1>{membership.conversation.project?.title || other?.name || 'Conversation'}</h1><p className="muted">{other ? `With ${other.name}` : 'Secure conversation'}</p></div></div><section className="card"><div className="message-thread">{membership.conversation.messages.map(m => <div key={m.id} className={`message-bubble ${m.sender.id === user.id ? 'mine' : ''}`}><div className="small muted">{m.sender.id === user.id ? 'You' : m.sender.name}</div><div>{m.body}</div><div className="small muted" style={{marginTop:5}}>{m.createdAt.toLocaleString()}</div></div>)}</div><MessageComposer conversationId={id}/></section></main>;
}
