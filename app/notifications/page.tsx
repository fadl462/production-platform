'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    const res = await fetch('/api/notifications');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function markAll() {
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    setItems(items.map(n => ({ ...n, readAt: new Date().toISOString() })));
  }
  if (loading) return <main className="container narrow"><p className="muted">Loading activity…</p></main>;
  return <main className="container narrow"><div className="page-heading"><div><span className="eyebrow">ACTIVITY</span><h1>Notifications</h1><p className="muted">Stay on top of applications, projects and account activity.</p></div><button className="btn" onClick={markAll}>Mark all read</button></div><div className="stack">{items.map(n=><article className={`card notification ${n.readAt?'read':''}`} key={n.id}><div><strong>{n.title}</strong><p>{n.body}</p><span className="muted small">{new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'}).format(new Date(n.createdAt))}</span></div></article>)}{!items.length&&<div className="card empty"><h3>You're all caught up</h3><p className="muted">New activity will appear here.</p><Link href="/projects" className="btn primary">Explore projects</Link></div>}</div></main>;
}
