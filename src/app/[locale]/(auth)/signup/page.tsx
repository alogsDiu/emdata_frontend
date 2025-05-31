// app/[locale]/(auth)/signup/page.tsx
import { getLocalizedContent } from '@/lib/i18n';
import SignUpForm from '@/components/auth/SignUpForm'; // Your Client Component
import styles from '../page.module.css'; // Common styles for auth pages
import Link from 'next/link';
import Image from 'next/image';

// Define expected content structure for signup.json (or default.json)
interface SignUpContent {
    title?: string;
    emailLabel: string;
    emailPlaceholder: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    confirmPasswordLabel?: string; // Используем это для password2
    confirmPasswordPlaceholder?: string;
    submitButton: string;
    loadingText?: string;
    passwordMismatchError?: string;
    reg_error?: string;
    successMessage?: string;
    loginPrompt:string;
    loginLinkText:string;
}

type locale = Promise<{ locale: string }>;

export default async function SignUpPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: SignUpContent ={ 
        title : "Create Account",
        emailLabel : "Email Address",
        emailPlaceholder : "you@example.com",
        passwordLabel : "Password",
        passwordPlaceholder : "Create a password (min. 8 characters)",
        confirmPasswordLabel : "Confirm Password",
        confirmPasswordPlaceholder : "Enter password again",
        submitButton : "Sign Up",
        loadingText : "Creating account...",
        loginPrompt : "Already have an account?",
        loginLinkText : "Login",
        passwordMismatchError : "Passwords do not match.",
        usernamePlaceholder :"username",
        usernameLabel :"Username",
        reg_error :"Registration failed. Please change the username or email and try again.",
        successMessage :"Successfully registered! An email has been sent to your address. Please check your inbox (and spam folder) to activate your account."
    };
    // Simplified error handling for brevity
    try {
        content = await getLocalizedContent(locale, 'signup') as SignUpContent;
    } catch (error) { console.error("Error loading signup content:", error); }

    return (
        <div className={styles.pageContainer}>
            {/* Left Column */}
            <div className={styles.imageColumn}>
                 <Image
                    src="/sign_up_cat.png" // Replace with your image path
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