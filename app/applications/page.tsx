import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function ApplicationsPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  const applications = await db.application.findMany({ where: { applicantId: user.id }, include: { project: { include: { owner: true } } }, orderBy: { createdAt: 'desc' } });
  return <main className="container narrow"><div className="page-heading"><div><span className="eyebrow">OPPORTUNITIES</span><h1>My applications</h1><p className="muted">Track every proposal you have submitted and the next step.</p></div><Link href="/projects" className="btn primary">Find more projects</Link></div><div className="stack">{applications.map(a => <article className="card" key={a.id}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><span className="badge">{a.status}</span><h2 style={{margin:'10px 0 5px'}}>{a.project.title}</h2><p className="muted">{a.project.category} · Owner: {a.project.owner.name}</p></div><span className="muted small">{a.createdAt.toLocaleDateString()}</span></div><p style={{lineHeight:1.7,marginTop:14}}>{a.proposal}</p><Link href={`/projects/${a.projectId}`} className="btn">View project</Link></article>)}{!applications.length&&<div className="card empty"><h3>No applications yet</h3><p className="muted">Explore projects and submit your first proposal.</p><Link href="/projects" className="btn primary">Explore projects</Link></div>}</div></main>;
}
