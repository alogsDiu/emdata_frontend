// Ensure this file has "use client" at the top if using Next.js App Router
"use client";

import { usePathname, useRouter } from "next/navigation";
// Make sure the path to your CSS module is correct
import styles from "./page.module.css"; // Or './LanguageSwitcher.module.css' if you created one

// Define the languages you support for easier mapping
const supportedLanguages = [
  { code: 'en', label: 'en' },
  { code: 'ru', label: 'ру' },
  { code: 'kz', label: 'кк' },
  // Add more languages here if needed
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // --- Logic to determine the current locale ---
  // Assumes your URL structure is like /en/dashboard, /ru/profile, etc.
  // It takes the second segment as the locale.
  const segments = pathname.split("/");
  // segments[0] is "", segments[1] should be the locale
  const currentLocale = segments[1] || 'en'; // Fallback to 'en' or your default if needed,
                                             // but ideally your routing handles redirects

  // --- Function to switch language ---
  const switchLanguage = (locale: string) => {
    // Create a mutable copy of segments
    const newSegments = pathname.split("/");
    // Update the locale segment
    newSegments[1] = locale;
    // Join back into a path. Handles cases like /en -> /ru or /en/page -> /ru/page
    const newPathname = newSegments.join("/");
    router.push(newPathname);
  };

  // --- Render the component ---
  return (
    // Container div - uses the class from your CSS module
    <div className={styles.buttons_container}>
      {/* Map over the supported languages to create buttons */}
      {supportedLanguages.map((lang) => (
        <button
          key={lang.code} // React key for list items
          onClick={() => switchLanguage(lang.code)}
          // Conditionally apply the 'active' class from your CSS module
          // Add 'aria-pressed' for accessibility: true if this is the current lang
          className={currentLocale === lang.code ? styles.active : ""}
          aria-pressed={currentLocale === lang.code} // Accessibility attribute
          type="button" // Explicitly set type for buttons
        >
          {/* Display the language label (e.g., 'en', 'ру', 'кк') */}
          {lang.label}
        </button>
      ))}
    </div>
  );
}