// app/(auth)/forgotpassword/page.tsx

import { getLocalizedContent } from '@/lib/i18n';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'; // Your Client Component
import styles from '../page.module.css'; // Common styles for auth pages
import Link from 'next/link';
import Image from 'next/image'; // Import Image

// Interface for expected content
interface ForgotPasswordContent {
    title: string;
    subTitle?: string; // Changed from 'description' to match common CSS class name 'subTitle'
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
    backToLoginLinkText?: string;
}

// Type for params
type locale = Promise<{ locale: string }>;

export default async function ForgotPasswordPage({ params }: { params: locale }) { // Use specific type
    const locale = (await params).locale;
    let content: ForgotPasswordContent | null = null;
    let errorLoadingContent = false;

    try {
        // Fetch content using the 'forgotpassword' key (Verify this key matches your i18n setup)
        content = await getLocalizedContent(locale, 'forgetpassword') as ForgotPasswordContent;
    } catch (error) {
        console.error(`Failed to load localized content for Forgot Password page [${locale}]:`, error);
        errorLoadingContent = true;
    }

    // Handle content loading failure - use a common container class
    if (errorLoadingContent || !content) {
        // Basic fallback using common styles if available, else just text
        content = { title: 'Forgot Password', subTitle: 'Enter your email address below and we\'ll send you a link to reset your password.', emailLabel: 'Email', emailPlaceholder: 'your@email.com', submitButton: 'Send Reset Link', backToLoginLinkText: 'Back to Login' };
         // Optionally render a more robust fallback page structure here
         // For now, just using the fallback content object below
    }

    // Render the page using the two-column layout
    return (
        // *** USE THE TWO-COLUMN CONTAINER ***
        <div className={styles.pageContainer}>

            {/* Left Column: Image */}
            <div className={styles.imageColumn}>
                 <Image
                    src="/forget_pass.svg" // Consistent image path
                    alt="Forgot password illustration" // Alt text
                    fill // Use fill to cover column
                    priority
                    className={styles.formImage} // Use common image style
                    sizes="(max-width: 768px) 100vw, 50vw" // Optimize loading
                 />
            </div>

            {/* Right Column: Form Content */}
            <div className={styles.formColumn}>
                <div className={styles.formContainer}> {/* Inner container for form width/alignment */}

                    <h1 className={styles.title}>{content.title}</h1>

                    {/* *** APPLY SUBTITLE STYLE *** */}
                    {content.subTitle && <p className={styles.subTitle}>{content.subTitle}</p>}

                    {/* Render the interactive form component */}
                    <ForgotPasswordForm content={content} locale={locale}/>

                    {/* Links Section */}
                    <div className={styles.links}>
                        {content.backToLoginLinkText && (
                            // Wrap link in a <p> if it's the only item, or just the link if needed
                            <p> 
                                <Link href={`/${locale}/login`} className={styles.link}> {/* Use common link style */}
                                    {content.backToLoginLinkText}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}