import './globals.css';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import LogoutButton from '@/app/components/LogoutButton';

export const metadata = { title: 'Nexus Platform', description: 'A secure ecosystem for people, projects, learning and trusted collaboration.' };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return <><header className="nav"><div className="nav-inner"><Link href="/" className="brand">NEXUS<span>.</span></Link><nav className="navlinks"><Link href="/projects">Discover</Link><Link href="/courses">Learning</Link>{user ? <><Link href="/dashboard">Dashboard</Link><Link href="/applications">Applications</Link><Link href="/manage/projects">My projects</Link><Link href="/notifications">Activity</Link><Link href="/messages">Messages</Link><Link href="/profile">Profile</Link>{user.role === 'ADMIN' && <Link href="/admin">Admin</Link>}<LogoutButton /></> : <><Link href="/login">Login</Link><Link href="/register" className="btn primary">Get Started</Link></>}</nav></div></header>{children}<footer className="footer"><div className="container footer-grid"><div><div className="brand">NEXUS<span>.</span></div><p className="muted">A production-oriented platform foundation for trusted work, learning and collaboration.</p></div><div><strong>Platform</strong><Link href="/projects">Discover</Link><Link href="/courses">Learning</Link><Link href="/register">Create account</Link></div><div><strong>Account</strong><Link href="/login">Sign in</Link><Link href="/dashboard">Dashboard</Link><Link href="/profile">Profile</Link></div></div></footer></>;
}
