// app/[locale]/(auth)/layout.tsx
import LanguageSwitcher from '@/components/general/LanguageSwitcher'; // Adjust path if needed
import styles from './page.module.css'; // Common styles for auth pages
import Link from 'next/link';

// Reuse type if defined elsewhere, otherwise define here

type locale = Promise<{ locale: string }>;

export default async function AuthLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: locale; // Use defined type
}) {
  const locale = (await params).locale;
  const homeHref = `/${locale}`; // Link back to the localized home page

  return (
    // Applying a general page class if needed, e.g., for background
    <div className={styles.authPageWrapper}> 
      <header className={styles.authHeader}> {/* Use specific header style */}
        <Link href={homeHref}>
          {/* Removed h2 for simpler structure, style span if needed */}
          <span className={styles.authLogoText}>EMDATA</span>
        </Link>
        <LanguageSwitcher />
      </header>
      {/* The children (signup, login, forgotpassword pages) will contain the two-column layout */}
      <main className={styles.authMainContent}>
         {children}
      </main>
    </div>
  );
}