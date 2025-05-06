// app/[locale]/(auth)/login/page.tsx
import { getLocalizedContent } from '@/lib/i18n'; // Предполагается, что эта функция существует
import styles from '../page.module.css'; // Общие стили для страниц auth
import Link from 'next/link';
import Image from 'next/image';
import LoginDeveloperForm from '@/components/auth/LoginDeveloperForm';

// Определяем структуру контента, ожидаемую LoginForm
interface LoginContent {
    title: string;
    loginLabel: string; // <-- Изменено с emailLabel
    loginPlaceholder: string; // <-- Изменено с emailPlaceholder
    passwordLabel: string;
    passwordPlaceholder?: string;
    rememberMeLabel?: string;
    forgotPasswordLinkText?: string;
    submitButton: string;
    signUpPrompt?: string;
    signUpLinkText?: string;
    loadingText?: string;
    googleSignInButton?: string;
    orSeparatorText?: string;
    invalidCredentialsError?: string; // Добавим поле для ошибки, если нужно
}

// Типизация параметров (оставляем как есть)
type locale = Promise<{ locale: string }>;


export default async function LoginPage({ params }: { params: locale }) {
    const locale = (await params).locale;
    let content: LoginContent | null = null;
    try {
        // Загружаем контент (убедись, что твой login.json содержит loginLabel и loginPlaceholder)
        content = await getLocalizedContent(locale, 'logindev') as LoginContent;
    } catch (error) { console.error("Error loading login content:", error); }

    // Базовый fallback контент с новыми ключами
    if (!content) {
        content = {
            title: 'Sign in',
            loginLabel: 'Login or Email', // <-- Изменено
            loginPlaceholder: 'Enter username or email', // <-- Изменено
            passwordLabel: 'Password',
            submitButton: 'Sign in',
            signUpPrompt: 'No Account?',
            signUpLinkText: 'Sign up'
        };
    }

    return (
        <div className={styles.pageContainer}>
            {/* Left Column */}
            <div className={styles.imageColumn}>
                 <Image
                    src="/sign_in_cat.svg" // Замени на свой путь
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
                    {/* Теперь интерфейсы совпадают */}
                    <LoginDeveloperForm content={content} locale={locale} />

                    {/* Links */}
                    <div className={styles.links}>
                         {content.forgotPasswordLinkText && (
                             <div style={{ width: '100%', textAlign: 'right', marginBottom: '15px' }}>
                                <Link href={`/${locale}/forgotpassword`} className={styles.link} style={{marginLeft: 0}}>
                                    {content.forgotPasswordLinkText}
                                </Link>
                             </div>
                         )}

                         {content.orSeparatorText && <p>{content.orSeparatorText}</p>}
                         {content.googleSignInButton && (
                              <button className={styles.googleButton}>
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
