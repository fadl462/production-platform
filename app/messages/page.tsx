import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  const memberships = await db.conversationMember.findMany({ where: { userId: user.id }, include: { conversation: { include: { project: true, members: { include: { user: { select: { id: true, name: true } } } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } } } }, orderBy: { conversation: { createdAt: 'desc' } } });
  return <main className="container narrow"><div className="page-heading"><div><span className="eyebrow">COMMUNICATION</span><h1>Messages</h1><p className="muted">Secure conversations connected to your work.</p></div></div><div className="stack">{memberships.map(m => { const other = m.conversation.members.find(x => x.userId !== user.id)?.user; const last = m.conversation.messages[0]; return <Link className="card" style={{display:'block'}} href={`/messages/${m.conversation.id}`} key={m.conversation.id}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><h3>{m.conversation.project?.title || other?.name || 'Conversation'}</h3><p className="muted">{last?.body || 'No messages yet.'}</p></div><span className="muted small">{last ? last.createdAt.toLocaleDateString() : ''}</span></div></Link> })}{!memberships.length&&<div className="card empty"><h3>No conversations yet</h3><p className="muted">A project conversation becomes available after a collaborator is selected.</p></div>}</div></main>;
}
