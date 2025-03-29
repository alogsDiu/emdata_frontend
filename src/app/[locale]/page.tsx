// app/[locale]/page.tsx
import LanguageSwitcher from "@/components/general/LanguageSwitcher";
import styles from "./page.module.css";
import { getLocalizedContent } from '@/lib/i18n';
import Footer from "@/components/general/Footer";
import Link from "next/link";

type locale = Promise<{ locale: string }>;

export default async function Home({
  params
}: {
  params: locale
}) {
  let locale = (await params).locale

  const content = await getLocalizedContent( locale, 'default');
  
  // Debug what you're receiving
  //console.log('Page received content:', content);
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2>EMDATA</h2>
        <LanguageSwitcher/>
        <div className="buttons_container">
          <Link href={`/${locale}/login`} className={styles.headerButton}>
            {content.login}
          </Link>
          <Link href={`/${locale}/signup`} className={styles.headerButton}>
            {content.signUp}
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.firstPage}>
            <h1>{content.welcome}</h1>
            <div className={styles.plus}>
              <div className={styles.plusHorizontal}></div>
              <div className={styles.plusVertical}></div>
            </div>
        </div>
        <div className={styles.secondPage}>
          {/* whatever something about us*/}
        </div>
      </main>
      <Footer/>
    </div>
  );
}