// app/[locale]/(auth)/layout.tsx
import LanguageSwitcher from '@/components/general/LanguageSwitcher'; // Adjust path if needed
import styles from './page.module.css'; // Common styles for auth pages
import Link from 'next/link';
import React from 'react'; // Import React if using React.ReactNode

// 1. Define the props type correctly
interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string; // params is an object containing the locale string directly
  }>;
}

// 2. Use the correct props type in the function signature
export default async function AuthLayout({
  children,
  params // params is now correctly typed as { locale: string }
}: AuthLayoutProps) {

  // 3. Access locale directly from the params object - NO 'await'!
  const { locale } = await params;

  // You can now use the locale variable directly
  const homeHref = `/${locale}`; // Link back to the localized home page

  // You can still perform other async operations here if needed
  // Example: const someServerData = await fetchSomeData(locale);

  return (
    <div className={styles.authPageWrapper}>
      <header className={styles.authHeader}>
        <Link href={homeHref}>
          <span className={styles.authLogoText}>EMDATA</span>
        </Link>
        <LanguageSwitcher />
      </header>
      <main className={styles.authMainContent}>
         {children}
      </main>
    </div>
  );
}