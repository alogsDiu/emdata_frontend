// app/[locale]/(auth)/login/page.tsx
import { getLocalizedContent } from '@/lib/i18n';
import LoginForm from '@/components/auth/LoginForm'; // CREATE THIS CLIENT COMPONENT
import styles from '../page.module.css'; // Common styles for auth pages
import Link from 'next/link';
import Image from 'next/image';

// Define expected content structure for login.json (or default.json)
interface LoginContent {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    rememberMeLabel?: string; // Optional
    forgotPasswordLinkText?: string; // Optional
    submitButton: string;
    signUpPrompt?: string; // "No Account?"
    signUpLinkText?: string; // "Sign up"
    loadingText?: string;
    googleSignInButton?: string; // Optional
    orSeparatorText?: string; // Optional "Or"
}

type locale = Promise<{ locale: string }>;


export default async function LoginPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: LoginContent | null = null;
    try {
        content = await getLocalizedContent(locale, 'login') as LoginContent;
    } catch (error) { console.error("Error loading login content:", error); }

    if (!content) { // Basic fallback
        content = { title: 'Sign in', emailLabel: 'Email', emailPlaceholder: 'Enter email', passwordLabel: 'Password', submitButton: 'Sign in', signUpPrompt: 'No Account?', signUpLinkText: 'Sign up' };
    }

    return (
        <div className={styles.pageContainer}>
            {/* Left Column */}
            <div className={styles.imageColumn}>
                 <Image
                    src="/sign_in_cat.svg" // Replace with your image path
                    alt="Login illustration"
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
                    <LoginForm content={content} locale={locale} /> {/* Client Component */}

                    {/* Links */}
                    <div className={styles.links}>
                         {/* Optional Forgot Password Link */}
                         {content.forgotPasswordLinkText && (
                             <div style={{ width: '100%', textAlign: 'right', marginBottom: '15px' }}> {/* Align right */}
                                <Link href={`/${locale}/forgotpassword`} className={styles.link} style={{marginLeft: 0}}>
                                    {content.forgotPasswordLinkText}
                                </Link>
                             </div>
                         )}

                         {/* Optional Google Sign In */}
                         {content.orSeparatorText && <p>{content.orSeparatorText}</p>}
                         {content.googleSignInButton && (
                              <button className={styles.googleButton}> {/* Style this button */}
                                {/* Add Google Icon here */}
                                {content.googleSignInButton}
                              </button>
                         )}


                        {content.signUpPrompt && content.signUpLinkText && (
                            <p>
                                {content.signUpPrompt}
                                <Link href={`/${locale}/signup`} className={styles.link}>
                                    {content.signUpLinkText}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}