import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  return <main className="container narrow"><div className="page-heading"><div><span className="eyebrow">ACTIVITY</span><h1>Notifications</h1><p className="muted">Stay on top of applications, projects and account activity.</p></div></div><div className="stack">{items.map(n=><article className={`card notification ${n.readAt?'read':''}`} key={n.id}><div><strong>{n.title}</strong><p>{n.body}</p><span className="muted small">{new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'}).format(n.createdAt)}</span></div></article>)}{!items.length&&<div className="card empty"><h3>You're all caught up</h3><p className="muted">New activity will appear here.</p></div>}</div></main>;
}
