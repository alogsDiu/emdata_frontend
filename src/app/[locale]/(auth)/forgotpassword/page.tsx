// app/(auth)/forgot-password/page.tsx

import { getLocalizedContent } from '@/lib/i18n';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'; 
import styles from '../../page.module.css'; // Optional: page-specific styles
import Link from 'next/link';

// Define expected content structure for forgotPassword.json
interface ForgotPasswordContent {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
    backToLoginLinkText?: string; // Optional
}

type locale = Promise<{ locale: string }>;

export default async function ForgotPasswordPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: ForgotPasswordContent | null = null;
    let errorLoadingContent = false;

    try {
        // Fetch content using the 'forgotPassword' key
        content = await getLocalizedContent(locale, 'forgotPassword') as ForgotPasswordContent;
    } catch (error) {
        console.error(`Failed to load localized content for Forgot Password page [${locale}]:`, error);
        errorLoadingContent = true;
    }

    // Handle content loading failure
    if (errorLoadingContent || !content) {
        return (
            <div className={styles.container ?? styles.fallbackContainer}>
                <h1>Forgot Password</h1> {/* Fallback Title */}
                <p>Sorry, we couldn't load the page content. Please try again later.</p>
            </div>
        );
    }

    // Render the page with the Client Component for the form
    return (
        <div className={styles.container}>
            <h1>{content.title}</h1>
            <p>{content.description}</p>

            {/* Render the interactive form component */}
            <ForgotPasswordForm content={content} locale={locale}/>

            <div className={styles.links}>
              {content.backToLoginLinkText && (
                  <Link href={`/${locale}/login`}>
                    {content.backToLoginLinkText}
                  </Link>
              )}
            </div>
        </div>
    );
}