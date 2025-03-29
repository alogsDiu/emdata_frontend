// app/(auth)/login/page.tsx

import { getLocalizedContent } from '@/lib/i18n';
import LoginForm from '@/components/auth/LoginForm'; // You need to create this Client Component
import styles from '../../page.module.css'; // Optional: page-specific styles
import Link from 'next/link'; // For links like "Forgot Password?" or "Sign Up"

// Define expected content structure for login.json
interface LoginContent {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string; // Optional
    submitButton: string;
    forgotPasswordLinkText?: string; // Optional
    signUpPrompt?: string; // Optional "Don't have an account?"
    signUpLinkText?: string; // Optional "Sign Up"
    loadingText?: string;
    // Add other relevant fields like error messages if handled via content prop
}
type locale = Promise<{ locale: string }>;

export default async function LoginPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: LoginContent | null = null;
    let errorLoadingContent = false;

    try {
        // Fetch content using the 'login' key
        content = await getLocalizedContent(locale, 'login') as LoginContent;
    } catch (error) {
        console.error(`Failed to load localized content for Login page [${locale}]:`, error);
        errorLoadingContent = true;
    }

    // Handle content loading failure
    if (errorLoadingContent || !content) {
        return (
            <div className={styles.container ?? styles.fallbackContainer}>
                <h1>Login</h1> {/* Fallback Title */}
                <p>Sorry, we couldn't load the page content. Please try again later.</p>
                {/* You could render a basic, non-localized form here if essential */}
            </div>
        );
    }

    // Render the page with the Client Component for the form
    return (
        <div className={styles.container}>
            <h1>{content.title}</h1>

            {/* Render the interactive form component */}
            <LoginForm content={content} locale={locale} />

            <div className={styles.links}>
              {content.forgotPasswordLinkText && (
                <Link href={`/${locale}/forgot-password`}>
                  {content.forgotPasswordLinkText}
                </Link>
              )}
              {content.signUpPrompt && content.signUpLinkText && (
                <p>
                  {content.signUpPrompt}{' '}
                  <Link href={`/${locale}/signup`}>
                    {content.signUpLinkText}
                  </Link>
                </p>
              )}
            </div>
        </div>
    );
}