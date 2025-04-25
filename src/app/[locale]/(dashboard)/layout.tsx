import { getLocalizedContent } from '@/lib/i18n';
import Sidebar from './components/Sidebar';
import styles from './page.module.css';
import Link from 'next/link';
import { SidebarContent } from '@/types';

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
        healthNeighbors: "Health Neighbors"
    } 
    
  return (
    <div className={styles.DashboardWrapper}>
      <Sidebar sidebar_content={sidebar_content} /> 
      {children}    
    </div>
  );
}