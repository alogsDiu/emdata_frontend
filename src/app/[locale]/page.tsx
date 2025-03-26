// app/[locale]/page.tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";
import styles from "./page.module.css";
import { getLocalizedContent } from '@/lib/i18n';
import Footer from "@/components/Footer";

export default async function Home({
  params
}: {
  params: { locale: string }
}) {
  const content = await getLocalizedContent((await params).locale, 'default');
  
  // Debug what you're receiving
  //console.log('Page received content:', content);
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2>EMDATA</h2>
        <LanguageSwitcher/>
        <div className="buttons_container">
          <button>
            {content.login}
          </button>
          <button>
            {content.signUp}
          </button>
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