import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function ManageProjects() {
  const user = await getUser();
  if (!user) redirect('/login');
  const projects = await db.project.findMany({ where: { ownerId: user.id }, include: { _count: { select: { applications: true } } }, orderBy: { updatedAt: 'desc' } });
  return <main className="container">
    <div className="page-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Manage your projects</h1><p className="muted">Review applicants, select collaborators and manage project delivery.</p></div><Link href="/projects/new" className="btn primary">Create project</Link></div>
    <div className="stack">{projects.map((p) => <article className="card" key={p.id}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><span className="badge">{p.status}</span><h2 style={{margin:'12px 0 6px'}}>{p.title}</h2><p className="muted">{p.category} · {p.location || 'Remote'}</p></div><div style={{textAlign:'right'}}><div className="stat" style={{fontSize:30}}>{p._count.applications}</div><span className="muted small">applications</span></div></div><div style={{marginTop:16}}><Link className="btn" href={`/manage/projects/${p.id}`}>Open management workspace →</Link></div></article>)}{!projects.length && <div className="card empty"><h3>No projects yet</h3><p className="muted">Create your first project to start receiving applications.</p><Link href="/projects/new" className="btn primary">Create project</Link></div>}</div>
  </main>;
}
