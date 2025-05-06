// app/[locale]/(auth)/confirm-email/[key]/page.tsx
import { getLocalizedContent } from '@/lib/i18n';
import ConfirmEmailForm from '@/components/auth/ConfirmEmailForm'; // Укажи правильный путь
import styles from '../../page.module.css'; // Общие стили для страниц auth
import Link from 'next/link';
import Image from 'next/image';

// Интерфейс для контента страницы
interface ConfirmEmailPageContent {
    pageTitle: string;
    description?: string;
    // Поля, необходимые для ConfirmEmailForm
    confirmButtonText: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
    invalidKeyError?: string;
    backToLoginLinkText?: string;
}

// Типизация параметров страницы
interface ConfirmEmailPageProps {
    params: {
      locale: string;
      key: string;
    };
  }
    

export default async function ConfirmEmailPage({ params }: ConfirmEmailPageProps) {
  const resolvedParams = await params; // Дожидаемся параметров
  const { locale, key } = resolvedParams;
  let content: ConfirmEmailPageContent | null = null;

  console.log('KEEY',resolvedParams.key);
  console.log('LOCALE',resolvedParams.locale);

  try {
    // Загружаем контент для ключа 'confirm-email'
    content = await getLocalizedContent(locale, 'confirm-email') as ConfirmEmailPageContent;
    if (!content) throw new Error('Content is null');
  } catch (error) {
    console.error(`Error loading ${locale}/confirm-email content:`, error);
  }

  // Fallback контент
  if (!content) {
    console.warn(`Content for ${locale}/confirm-email not found, using fallback.`);
    content = {
      pageTitle: "Confirm Your Email",
      description: "Please click the button below to activate your account.",
      confirmButtonText: "Confirm Email",
      loadingText: "Confirming...",
      successMessage: "Email confirmed successfully! Redirecting to login...",
      errorMessage: "Failed to confirm email. The link might be invalid or expired.",
      invalidKeyError: "Invalid confirmation link.",
      backToLoginLinkText: "Back to Login"
    };
  }

  return (
    <div className={styles.pageContainer}>
      {/* Левая колонка */}
      <div className={styles.imageColumn}>
           <Image
              src="/forget_pass.svg" // Замени на релевантное изображение
              alt="Email confirmation illustration"
              fill
              priority
              className={styles.formImage}
              sizes="(max-width: 768px) 100vw, 50vw"
           />
      </div>

      {/* Правая колонка */}
      <div className={styles.formColumn}>
          <div className={styles.formContainer}>
              <h1 className={styles.title}>{content.pageTitle}</h1>
              {content.description && <p className="text-center text-gray-600 mb-6">{content.description}</p>}
              {/* Передаем ключ в компонент формы */}
              <ConfirmEmailForm
                content={content}
                locale={locale}
                confirmationKey={key} // Передаем ключ из URL
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
