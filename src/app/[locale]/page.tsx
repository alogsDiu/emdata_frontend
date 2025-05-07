import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css'; // Assuming this CSS file exists
import LanguageSwitcher from '@/components/general/LanguageSwitcher'; // Assuming path is correct
import { getLocalizedContent } from '@/lib/i18n'; // Assuming path is correct
import { motion } from 'framer-motion';
import PlusThingy from '@/components/dashboard/PlusThingy';

type locale = Promise<{ locale: string }>;

export default async function Home({
  params
}: {
  params: locale
}) {
  let locale = (await params).locale;
  const content = await getLocalizedContent( locale, 'default');

  return (
    <div className={styles.pageContainer}>
      {/* Header Section (Keep as is) */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/logo.svg" alt="" width={30} height={30} className={styles.logoIcon} />
          <span className={styles.logoText}>Emdata</span>
        </div>
        <LanguageSwitcher/>
        <div className={styles.buttonsContainer}>
          <Link href={`/${locale}/signup`} className={`${styles.headerButton} ${styles.signUpButton}`}>
            {content.signUp}
          </Link>
          <Link href={`/${locale}/login`} className={`${styles.headerButton} ${styles.signInButton}`}>
            {content.login}
          </Link>
        </div>
      </header>

      {/* Main Content Section */}
      <main className={styles.mainContent}>
        {/* Use the correct title key from your content */}
        <h1 className={styles.title}>{content.title || content.welcome}</h1> 

        {/* === START: MODIFICATION FOR INTERACTION === */}
        {/* Container for the Plus and Cats interaction */}
        <div className={styles.interactionContainer}>

          {/* Plus Symbol (Now inside interaction container) */}
          <PlusThingy/>

          {/* Cat Images (Now inside interaction container) */}
          {/* Add specific classes for positioning */}
          <Image
            src="/home_doctor_cat.svg" // Your first cat image
            alt="Cat looking up" // Update alt text
            width={400} // Keep your desired dimensions
            height={480}
            className={`${styles.catImage} ${styles.catLeft}`} // ADD .catLeft
            priority
          />
          <Image
            src="/home_n_doctor_cat.svg" // Your second cat image
            alt="Cat dressed as a doctor" // Update alt text
            width={400} // Keep your desired dimensions
            height={480}
            className={`${styles.catImage} ${styles.catRight}`} // ADD .catRight
            priority
          />
        </div>
        {/* === END: MODIFICATION FOR INTERACTION === */}

      </main>
      <div className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          {/* Left Column: Image */}
          <div className={styles.aboutImageColumn}>
            <Image
              src="/about_us_cat.svg" // PLACEHOLDER: Put your illustration image in /public
              alt="Illustration of a cat using a computer with medical data charts"
              width={500} // Adjust width based on your image
              height={450} // Adjust height based on your image
              className={styles.aboutIllustration}
            />
          </div>
          {/* Right Column: Text */}
          <div className={styles.aboutTextColumn}>
            <h2 className={styles.aboutHeading}>{content.header}</h2>
            <p className={styles.aboutParagraph}>{content.p1}</p>
            <p className={styles.aboutParagraph}>{content.p2}</p>
            <p className={styles.aboutParagraph}>{content.p3}</p>
            <p className={styles.aboutParagraph}>{content.p4}</p>
            <p className={styles.aboutParagraph}>{content.p5}</p>
          </div>
        </div>
      </div>
      <section className={styles.devLoginLinkSection}>
        <div className={styles.devLoginLinkContent}>
          <h2 className={styles.devLoginSectionTitle}>{content.developerPortalSectionTitle}</h2>
          <p className={styles.devLoginSectionDescription}>{content.developerPortalDescription}</p>
          <Link href={`/${locale}/logindev`} className={styles.devLoginLinkButton}>
            {content.developerPortalLinkText}
          </Link>
        </div>
      </section>
      <section className={styles.donateSection}>
        <h2 className={styles.donateTitle}>{content.donateHeading}</h2>
        <p className={styles.donateDescription}>{content.donateDescription}</p>

        <div className={styles.donateImageContainer}>
          <Link href="/" className={styles.donateLink}>
            <Image
              src="/donate.svg"
              alt="cat with a sign saying please donate"
              width={600} // Adjust to your actual image width
              height={450} // Adjust to your actual image height
              // priority // Only add priority if it's very high on the page
              className={styles.donateImage}
            />
            {/* <span className={styles.visuallyHidden}>Donate Now</span> */}
          </Link>
        </div>
      </section>

    </div>
    
  );
}