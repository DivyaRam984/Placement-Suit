import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import styles from './Layout.module.css';

const NAV = [
  { path: '/', label: 'Home' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/analyze', label: 'Analyze' },
  { path: '/resume', label: 'Resume' },
  { path: '/applications', label: 'Applications' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/settings', label: 'Settings' },
  { path: '/proof', label: 'Proof' },
] as const;

export default function Layout() {
  const location = useLocation();
  const notifications = usePlatformStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Placement Suite
        </Link>
        <nav className={styles.nav}>
          {NAV.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={path === location.pathname ? styles.navActive : styles.navLink}
            >
              {label}
            </Link>
          ))}
          {unread > 0 && (
            <span className={styles.badge} aria-label={`${unread} unread notifications`}>
              {unread}
            </span>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
