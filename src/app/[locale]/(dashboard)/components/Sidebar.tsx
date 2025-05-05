// app/(dashboard)/_components/sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './components.module.css';
// Assuming getLocalizedContent and SidebarContent are handled in the layout and passed down
// import { getLocalizedContent } from '@/lib/i18n';
import { SidebarContent } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Example icons - you'll need to install react-icons

interface SidebarProps {
    sidebar_content: SidebarContent;
    locale:string
    // isCollapsed state is now managed internally, but you could pass it down
    // if the layout needs to know the sidebar's state (e.g., to adjust main content margin)
    // isCollapsed: boolean;
    // onToggle: () => void;
}

export default function Sidebar({ sidebar_content, locale}: SidebarProps) {
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
        // If the layout needs to react, you would call a prop function here:
        // onToggle();
    };

    return (
        // The container now holds both the sidebar and the toggle button wrapper
        // We'll use CSS to control their layout and the sidebar's width
        <div className={`${styles.sidebarContainer} ${isSidebarCollapsed ? styles.collapsed : ''}`} >

            {/* The sidebar content div is always rendered */}
            <div className={styles.sidebar}>
                 <div className={styles.logo}>
                    {/* Optionally show a smaller logo or just the icon when collapsed */}
                     <Image src="/logo.svg" alt="Logo" width={isSidebarCollapsed ? 30 : 100} height={30} className={styles.logoIcon} />
                     {!isSidebarCollapsed && <span className={styles.logoText}>EMDATA</span>}
                 </div>


                <nav className={styles.navigation}>
                    <ul>
                        <li>
                            <Link href={`/${locale}/lab_results`} className={`${styles.link} ${pathname === `/${locale}/lab_results` ? styles.active : ''}`}>
                                <span className={styles.linkIcon}> {/* Add a span for icon */}
                                    {/* Replace with actual icons */} 🏋️
                                </span>
                                {/* Text label is hidden when collapsed */}
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.labResults}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${locale}/health_statistics`} className={`${styles.link} ${pathname === `/${locale}/health_statistics` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}> {/* Add a span for icon */}
                                    📈 {/* Replace with actual icons */}
                                </span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.healthStatistics}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${locale}/summary`} className={`${styles.link} ${pathname === `/${locale}/summary` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}> {/* Add a span for icon */}
                                    📝 {/* Replace with actual icons */}
                                </span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.summary}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${locale}/health_neighboars`} className={`${styles.link} ${pathname === `/${locale}/health_neighboars` ? styles.active : ''}`}>
                                 <span className={styles.linkIcon}> {/* Add a span for icon */}
                                    🤝 {/* Replace with actual icons */}
                                </span>
                                {!isSidebarCollapsed && <span className={styles.linkLabel}>{sidebar_content.healthNeighbors}</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
                {/* ... user profile or other sidebar elements ... */}
            </div>

            {/* Toggle button wrapper remains, but styling changes */}
            <div className={styles.sidebarToggleButtonWrapper} onClick={toggleSidebar}>
                <button
                    className={styles.sidebarToggle}
                    onClick={toggleSidebar}
                    aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {/* Use imported icons */}
                    {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

        </div>
    );
}