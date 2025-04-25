// app/(dashboard)/_components/sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './components.module.css';
import { getLocalizedContent } from '@/lib/i18n';
import { SidebarContent } from '@/types';

interface SidebarProps {
    sidebar_content: SidebarContent;
    // You might still need the locale prop if it's used elsewhere,
    // but it's not needed for fetching content internally anymore.
    // locale: string;
  }

export default function Sidebar({sidebar_content}:SidebarProps) {
    const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Your App Logo</div>
      <nav className={styles.navigation}>
        <ul>

          <li>
            <Link href="/lab_results" className={`${styles.link} ${pathname === '/lab_results' ? styles.active : ''}`}>
                {sidebar_content.labResults}
            </Link>
          </li>
          <li>
            <Link href="/health_statistics" className={`${styles.link} ${pathname === '/health_statistics' ? styles.active : ''}`}>
              {sidebar_content.healthStatistics}
            </Link>
          </li>
          <li>
            <Link href="/summary" className={`${styles.link} ${pathname === '/summary' ? styles.active : ''}`}>
              {sidebar_content.summary}
            </Link>
          </li>
          <li>
            <Link href="/health_neighboars" className={`${styles.link} ${pathname === '/health_neighboars' ? styles.active : ''}`}>
              {sidebar_content.healthNeighbors}
            </Link>
          </li>

        </ul>
      </nav>
      {/* ... user profile ... */}
    </aside>
  );
}