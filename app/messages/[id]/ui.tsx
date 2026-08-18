'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ body }) });
    setBusy(false);
    if (!res.ok) { const data = await res.json(); alert(data.error || 'Unable to send message'); return; }
    setBody('');
    router.refresh();
  }
  return <form onSubmit={submit} style={{marginTop:18,display:'flex',gap:10,alignItems:'flex-end'}}><textarea className="input textarea" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write a secure message…"/><button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Send'}</button></form>;
}
