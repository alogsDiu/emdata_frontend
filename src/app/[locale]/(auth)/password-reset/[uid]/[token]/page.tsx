// app/[locale]/(auth)/password-reset/[uid]/[token]/page.tsx
import { getLocalizedContent } from '@/lib/i18n'; // Убедись, что эта функция работает правильно
import ResetPasswordConfirmForm from '@/components/auth/ResetPasswordConfirmForm'; // Убедись, что путь верный
import styles from '../../../page.module.css'; // Путь к общим стилям (auth)
import Link from 'next/link';
import Image from 'next/image';

// Интерфейс для контента
interface ResetPasswordConfirmContent {
    title: string;
    newPasswordLabel: string;
    newPasswordPlaceholder?: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder?: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
    passwordMismatchError?: string;
    backToLoginLinkText?: string;
}

// Типизация параметров страницы
interface ResetConfirmPageProps {
  // Оборачиваем params в Promise
  params: Promise<{
    locale: string;
    uid: string;
    token: string;
  }>;
}

export default async function ResetPasswordConfirmPage({ params }: ResetConfirmPageProps) {
  // --- ОЖИДАЕМ PARAMS ---
  const resolvedParams = await params;
  const { locale, uid, token } = resolvedParams;
  // ----------------------
  let content: ResetPasswordConfirmContent | null = null;

  try {
    // Используем ключ 'reset-password'
    content = await getLocalizedContent(locale,'reset') as ResetPasswordConfirmContent;
  } catch (error) {
    console.error(`Error loading ${locale}/reset content:`, error);
  }

  // Fallback контент
  if (!content) {
    console.warn(`Content for ${locale}/reset not found, using fallback.`);
    content = {
      title: "Set New Password",
      newPasswordLabel: "New Password",
      confirmPasswordLabel: "Confirm New Password",
      submitButton: "Reset Password",
      loadingText: "Processing...",
      successMessage: "Password reset successful. Redirecting to login...",
      errorMessage: "Failed to reset password. The link might be invalid or expired.",
      passwordMismatchError: "Passwords do not match.",
      backToLoginLinkText: "Back to Login"
    };
  }

  return (
    <div className={styles.pageContainer}>
      {/* Левая колонка */}
      <div className={styles.imageColumn}>
           <Image
              src="/forget_pass.svg" // Замени на свой путь
              alt="Reset password illustration"
              fill
              priority
              className={styles.formImage}
              sizes="(max-width: 768px) 100vw, 50vw"
           />
      </div>

      {/* Правая колонка */}
      <div className={styles.formColumn}>
          <div className={styles.formContainer}>
              <h1 className={styles.title}>{content.title}</h1>
              {/* Передаем uid и token */}
              <ResetPasswordConfirmForm
                content={content}
                locale={locale}
                uid={uid}
                token={token}
              />
              <div className={styles.links} style={{ marginTop: '20px' }}>
                   {content.backToLoginLinkText && (
                       <p>
                           <Link href={`/${locale}/login`} className={styles.link}>
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
