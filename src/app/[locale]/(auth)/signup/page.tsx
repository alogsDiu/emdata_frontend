// app/(auth)/signup/page.tsx

import { getLocalizedContent } from '@/lib/i18n';
import SignUpForm from '@/components/auth/SignUpForm'; // You need to create this Client Component
import styles from '../../page.module.css'; // Optional: page-specific styles
import Link from 'next/link';

// Define expected content structure for signup.json
interface SignUpContent {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string; // Optional
    confirmPasswordLabel?: string; // Optional
    confirmPasswordPlaceholder?: string; // Optional
    submitButton: string;
    loginPrompt?: string; // Optional "Already have an account?"
    loginLinkText?: string; // Optional "Login"
    loadingText?: string;
    // Add other relevant fields
}

type locale = Promise<{ locale: string }>;

export default async function SignUpPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: SignUpContent | null = null;
    let errorLoadingContent = false;

    try {
        // Fetch content using the 'signup' key
        content = await getLocalizedContent(locale, 'signup') as SignUpContent; // Adjust key if needed
    } catch (error) {
        console.error(`Failed to load localized content for SignUp page [${locale}]:`, error);
        errorLoadingContent = true;
    }

    // Handle content loading failure
    if (errorLoadingContent || !content) {
        return (
            <div className={styles.container ?? styles.fallbackContainer}>
                <h1>Sign Up</h1> {/* Fallback Title */}
                <p>Sorry, we couldn't load the page content. Please try again later.</p>
            </div>
        );
    }

    // Render the page with the Client Component for the form
    return (
        <div className={styles.container}>
            <h1>{content.title}</h1>

            {/* Render the interactive form component */}
            <SignUpForm content={content} locale={locale} />

             <div className={styles.links}>
               {content.loginPrompt && content.loginLinkText && (
                <p>
                  {content.loginPrompt}{' '}
                  <Link href={`/${locale}/login`}>
                    {content.loginLinkText}
                  </Link>
                </p>
              )}
            </div>
        </div>
    );
}