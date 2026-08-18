'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ApplicationActions({ id, status, projectId }: { id: string; status: string; projectId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function update(nextStatus: 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED') {
    setBusy(true);
    const res = await fetch(`/api/applications/${id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
    setBusy(false);
    if (!res.ok) { const data = await res.json(); alert(data.error || 'Unable to update application'); return; }
    router.refresh();
  }
  async function messageCollaborator() {
    setBusy(true);
    const res = await fetch('/api/conversations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { alert(data.error || 'Unable to open conversation'); return; }
    router.push(`/messages/${data.id}`);
  }
  if (status === 'ACCEPTED') return <div style={{display:'flex',gap:8,marginTop:14}}><button disabled={busy} className="btn primary" onClick={messageCollaborator}>Message collaborator</button></div>;
  if (status === 'REJECTED') return null;
  return <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
    {status !== 'SHORTLISTED' && <button disabled={busy} className="btn" onClick={() => update('SHORTLISTED')}>Shortlist</button>}
    <button disabled={busy} className="btn primary" onClick={() => update('ACCEPTED')}>Accept & hire</button>
    <button disabled={busy} className="btn danger" onClick={() => update('REJECTED')}>Reject</button>
  </div>;
}

export function ProjectStatusActions({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function update(nextStatus: 'OPEN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') {
    setBusy(true);
    const res = await fetch(`/api/projects/${id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { alert(data.error || 'Unable to update project'); return; }
    router.refresh();
  }
  if (status === 'COMPLETED' || status === 'CANCELLED') return <span className="muted small">This project is closed.</span>;
  return <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
    {status !== 'OPEN' && <button disabled={busy} className="btn" onClick={() => update('OPEN')}>Reopen</button>}
    {status !== 'ACTIVE' && <button disabled={busy} className="btn" onClick={() => update('ACTIVE')}>Mark active</button>}
    <button disabled={busy} className="btn primary" onClick={() => update('COMPLETED')}>Complete project</button>
    <button disabled={busy} className="btn danger" onClick={() => update('CANCELLED')}>Cancel project</button>
  </div>;
}
