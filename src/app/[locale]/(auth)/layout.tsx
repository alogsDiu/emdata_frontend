import LanguageSwitcher from "@/components/general/LanguageSwitcher";
import styles from "./page.module.css";
import Footer from "@/components/general/Footer";

export default async function Auth({
    children
  }: {
    children: React.ReactNode
  }){

    return (
      <div className={styles.page}>
        <header>
          <h2>EMDATA</h2>
          <LanguageSwitcher/>
        </header>
        {children}
        <Footer/>
      </div>
    );
}  