// app/(dashboard)/_components/sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './components.module.css';
// Assuming getLocalizedContent and SidebarContent are handled in the layout and passed down
// import { getLocalizedContent } from '@/lib/i18n';
import { SidebarContent } from '@/types'; // Make sure SidebarContent includes 'allSummaries'
import Image from 'next/image';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiArchive } from 'react-icons/fi'; // Example icons - you'll need to install react-icons. Added FiArchive for the new link.

interface SidebarProps {
    sidebar_content: SidebarContent;
    locale: string;
}

export default function Sidebar({ sidebar_content, locale }: SidebarProps) {
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className={`${styles.sidebarContainer} ${isSidebarCollapsed ? styles.collapsed : ''}`} >
            <div className={styles.sidebar}>
                 <div className={styles.logo}>
                     <Image src="/logo.svg" alt="Logo" width={isSidebarCollapsed ? 30 : 100} height={30} className={styles.logoIcon} />
                     {!isSidebarCollapsed && <span className={styles.logoText}>EMDATA</span>}
                 </div>

                <nav className={styles.navigation}>
                    <ul>
                        <li>
                            <Link href={`/${locale}/lab_results`} className={`${styles.link} ${pathname === `/${locale}/lab_results` ? styles.active : ''}`}>
                                <span className={styles.linkIcon}>🏋️</span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.labResults}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${locale}/health_statistics`} className={`${styles.link} ${pathname === `/${locale}/health_statistics` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}>📈</span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.healthStatistics}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${locale}/summary`} className={`${styles.link} ${pathname === `/${locale}/summary` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}>📝</span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.summary}</span>}
                            </Link>
                        </li>
                        {/* New Link for All Summaries */}
                        <li>
                            <Link href={`/${locale}/all_summaries_page`} className={`${styles.link} ${pathname === `/${locale}/all_summaries_page` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}>
                                    <FiArchive /> {/* Example Icon: Replace with your preferred icon */}
                                 </span>
                                {/* Ensure sidebar_content.allSummaries exists and is translated */}
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.allSummaries}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${locale}/health_neighboars`} className={`${styles.link} ${pathname === `/${locale}/health_neighboars` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}>🤝</span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.healthNeighbors}</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className={styles.sidebarToggleButtonWrapper} onClick={toggleSidebar}>
                <button
                    className={styles.sidebarToggle}
                    onClick={toggleSidebar}
                    aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>
        </div>
    );
}
