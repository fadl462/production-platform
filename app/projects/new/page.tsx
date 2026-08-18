'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', category: '', skills: '', location: '', budget: '' });
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault(); setError('');
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, skills: form.skills.split(',').map((x) => x.trim()).filter(Boolean), budget: form.budget ? Number(form.budget) : undefined }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Could not create project');
    router.push(`/projects/${data.id}`);
  }

  return <main className="container narrow"><div className="page-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Create a project</h1><p className="muted">Publish a real, database-backed opportunity for qualified applicants.</p></div></div><form className="card form-card" onSubmit={submit}><div className="form-grid"><label className="full">Project title<input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></label><label className="full">Description<textarea className="input textarea" rows={8} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required /></label><label>Category<input className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required /></label><label>Skills<input className="input" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="Research, Data, Reporting" required /></label><label>Location<input className="input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Remote" /></label><label>Budget (GHS)<input className="input" type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} /></label></div>{error&&<p className="error">{error}</p>}<div className="form-actions"><button className="btn primary">Publish project</button></div></form></main>;
}
