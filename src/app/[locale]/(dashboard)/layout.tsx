import { getLocalizedContent } from '@/lib/i18n';
import Sidebar from './components/Sidebar';
import styles from './page.module.css';
import { SidebarContent } from '@/types';
import LanguageSwitcher from '@/components/general/LanguageSwitcher';
import Image from 'next/image';
import { DashboardProvider } from './DashboardContext';
import { LogoutButton } from './components/LogoutButton';
import UserProfileHeader from './components/UserProfileHeader';

type locale = Promise<{ locale: string }>;

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params:locale;
}) {
  const locale = (await params).locale;
  const posible_content:SidebarContent = await getLocalizedContent(locale, 'sidebar');
  const sidebar_content = posible_content? posible_content:{
        labResults: "Lab Results",
        healthStatistics: "Health Statistics",
        summary: "Summary",
        healthNeighbors: "Health Neighbors",
        allSummaries:"All summaries"
  }
  return (
    <div className={styles.DashboardWrapper}>
      <Sidebar sidebar_content={sidebar_content} locale={locale}/> 
      <div className={styles.rightPart}>
        <header className={styles.dashboardHeader}>
          <div className={styles.languageSwitcherContainer}>
            {/* LanguageSwitcher component will be rendered here */}
            <LanguageSwitcher/>
          </div>
          <div className={styles.profileElementsController}>
            <UserProfileHeader locale={locale} />
          </div>
        </header>
        <DashboardProvider locale={locale} >
          {children} {/* This is where your page content (e.g., LabResultsPage) will be rendered by Next.js */}
        </DashboardProvider>
      </div>    
    </div>
  );
}