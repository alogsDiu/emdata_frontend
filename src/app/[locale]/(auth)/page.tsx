import LanguageSwitcher from "@/components/LanguageSwitcher";
import styles from "./page.module.css";
import Footer from "@/components/Footer";

export default async function Auth({
    children
  }: {
    children: React.ReactNode
  }){

    return (
      <div className={styles.page}>
        {children}
        <Footer/>
      </div>
    );
}  