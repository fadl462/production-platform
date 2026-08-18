import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApplicationActions, ProjectStatusActions } from './ui';

export default async function ManageProject({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect('/login');
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, include: { applications: { include: { applicant: { include: { profile: true } } }, orderBy: { createdAt: 'desc' } }, milestones: { orderBy: { dueDate: 'asc' } } } });
  if (!project) notFound();
  if (project.ownerId !== user.id) redirect('/manage/projects');
  return <main className="container">
    <Link href="/manage/projects" className="muted">← Back to projects</Link>
    <div className="page-heading" style={{marginTop:12}}><div><span className="badge">{project.status}</span><h1>{project.title}</h1><p className="muted">{project.description}</p></div><Link href={`/projects/${project.id}`} className="btn">Public view</Link></div>
    <div className="grid" style={{gridTemplateColumns:'2fr 1fr'}}>
      <section className="card"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><h2>Applications</h2><span className="badge">{project.applications.length} total</span></div><div className="stack" style={{marginTop:16}}>{project.applications.map((a) => <article key={a.id} style={{border:'1px solid #e8edf5',borderRadius:16,padding:16}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><h3 style={{marginBottom:4}}>{a.applicant.name}</h3><p className="muted small">{a.applicant.location || 'Location not provided'} · profile {a.applicant.profile?.completion || 0}% complete</p></div><span className="badge">{a.status}</span></div><p style={{lineHeight:1.7,marginTop:12}}>{a.proposal}</p><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{(a.applicant.profile?.skills || []).slice(0,8).map(s => <span className="badge" key={s}>{s}</span>)}</div><ApplicationActions id={a.id} status={a.status} projectId={project.id}/></article>)}{!project.applications.length && <p className="muted">No applications yet. Keep the project open while you build your applicant pool.</p>}</div></section>
      <aside className="card"><h2>Project controls</h2><ProjectStatusActions id={project.id} status={project.status}/><div className="stack" style={{marginTop:14}}><div><span className="muted small">STATUS</span><p><b>{project.status}</b></p></div><div><span className="muted small">BUDGET</span><p><b>{project.budget ? `GHS ${project.budget.toLocaleString()}` : 'Negotiable'}</b></p></div><div><span className="muted small">SKILLS</span><p>{project.skills.join(', ')}</p></div></div><hr style={{border:0,borderTop:'1px solid #eef1f6',margin:'18px 0'}}/><h3>Milestones</h3>{project.milestones.map(m=><div key={m.id} style={{padding:'10px 0',borderBottom:'1px solid #eef1f6'}}><b>{m.title}</b><p className="muted small">{m.dueDate ? `Due ${m.dueDate.toLocaleDateString()}` : 'No due date'}</p></div>)}{!project.milestones.length&&<p className="muted small">Milestones can be added as the delivery workspace is expanded.</p>}</aside>
    </div>
  </main>;
}
