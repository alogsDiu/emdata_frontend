// app/[locale]/(auth)/signup/page.tsx
import { getLocalizedContent } from '@/lib/i18n';
import SignUpForm from '@/components/auth/SignUpForm'; // Your Client Component
import styles from '../page.module.css'; // Common styles for auth pages
import Link from 'next/link';
import Image from 'next/image';

// Define expected content structure for signup.json (or default.json)
interface SignUpContent {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    confirmPasswordLabel?: string;
    confirmPasswordPlaceholder?: string;
    submitButton: string;
    loginPrompt?: string; // "Already have an account?"
    loginLinkText?: string; // "Login"
    loadingText?: string;
    passwordMismatchError?: string;
}

type locale = Promise<{ locale: string }>;

export default async function SignUpPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: SignUpContent | null = null;
    // Simplified error handling for brevity
    try {
        content = await getLocalizedContent(locale, 'signup') as SignUpContent;
    } catch (error) { console.error("Error loading signup content:", error); }

    if (!content) { // Basic fallback if content fails
        content = { title: 'Sign Up', emailLabel: 'Email', emailPlaceholder: 'Enter email', passwordLabel: 'Password', submitButton: 'Sign Up', loginPrompt: 'Already have an account?', loginLinkText: 'Login'};
    }

    return (
        <div className={styles.pageContainer}>
            {/* Left Column */}
            <div className={styles.imageColumn}>
                 <Image
                    src="/sign_up_cat.svg" // Replace with your image path
                    alt="Sign up illustration"
                    fill
                    priority
                    className={styles.formImage}
                    sizes="(max-width: 768px) 100vw, 50vw"
                 />
            </div>

            {/* Right Column */}
            <div className={styles.formColumn}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>{content.title}</h1>
                    <SignUpForm content={content} locale={locale} /> {/* Client Component */}
                    <div className={styles.links}>
                        {content.loginPrompt && content.loginLinkText && (
                            <p>
                                {content.loginPrompt}
                                <Link href={`/${locale}/login`} className={styles.link}>
                                    {content.loginLinkText}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}