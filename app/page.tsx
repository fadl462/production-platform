import Link from 'next/link';
import { db } from '@/lib/db';

export default async function Home(){
  const [projects,users,courses]=await Promise.all([
    db.project.count({where:{status:'OPEN'}}),
    db.user.count(),
    db.course.count({where:{published:true}}),
  ]);
  return <main>
    <section className="hero"><div className="container"><span className="badge">PRODUCTION PLATFORM FOUNDATION</span><h1>One secure ecosystem for people, projects and growth.</h1><p>Discover opportunities, manage projects, communicate securely, build skills and establish trust — through one connected, database-backed application.</p><div className="hero-actions"><Link href="/register" className="btn primary">Create account</Link><Link href="/projects" className="btn secondary">Explore projects</Link></div></div></section>
    <section className="container" style={{marginTop:-45,position:'relative'}}><div className="feature-grid"><div className="card"><div className="muted">Open projects</div><div className="stat">{projects}</div></div><div className="card"><div className="muted">Members</div><div className="stat">{users}</div></div><div className="card"><div className="muted">Published courses</div><div className="stat">{courses}</div></div></div></section>
    <section className="container"><div className="page-heading"><div><span className="eyebrow">CORE CAPABILITIES</span><h2>Built around real workflows</h2></div></div><div className="feature-grid">{[['Verified profiles','Identity, profile completion and verification workflows.'],['Projects & applications','Listings, applications, shortlisting and lifecycle states.'],['Secure communication','Conversation architecture with access-controlled messages and files.'],['Learning & certificates','Courses, modules, progress, assessments and public verification.'],['Governance','Administrative controls, moderation, disputes and audit history.'],['Payments-ready','Server-side payment records designed for Paystack integration.']].map(([title,text])=><article className="card" key={title}><h3>{title}</h3><p className="muted">{text}</p></article>)}</div></section>
  </main>
}
