// components/auth/ForgotPasswordForm.tsx
'use client';

import { useState, FormEvent } from 'react';
// *** CHANGE CSS IMPORT ***
import styles from './ForgotPasswordForm.module.css'; // Use its own CSS module
import { MdOutlineEmail } from 'react-icons/md'; // Import email icon

// Keep interface definition
interface ForgotPasswordContent {
    title?: string;
    description?: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
}

interface ForgotPasswordFormProps {
    content: ForgotPasswordContent;
    locale: string; // Не используется здесь, но оставлено для консистентности
}

export default function ForgotPasswordForm({ content, locale }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Используем стандартный URL dj-rest-auth ---
            const apiUrl = `${process.env.NEXT_PUBLIC_STARTING_BASE || ''}/api/auth/password/reset/`;
            console.log("Forgot Password API URL:", apiUrl); // Отладка

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // dj-rest-auth обычно возвращает 200 OK даже если email не найден,
            // чтобы не раскрывать информацию о существовании email.
            // Но он может вернуть 400, если email невалиден.
            if (!response.ok && response.status !== 400) { // Обрабатываем неожидаемые ошибки сервера
                 throw new Error(content.errorMessage || `Server error: ${response.status}`);
            }

            const responseData = await response.json();

            // Проверяем на ошибки валидации (например, невалидный email)
            if (response.status === 400 && responseData.email) {
                 throw new Error(responseData.email[0]);
            }
             // Если ответ не ОК, но не 400 с ошибкой email, считаем общей ошибкой
             else if (!response.ok) {
                 throw new Error(content.errorMessage || `Failed to send reset link. Status: ${response.status}`);
             }


            // Вне зависимости от того, найден email или нет, показываем общее сообщение
            setMessage({ type: 'success', text: content.successMessage || 'If an account with that email exists, a password reset link has been sent.' });
            // setEmail(''); // Оставляем email в поле для удобства

        } catch (error) {
            console.error("Forgot Password Error:", error);
            setMessage({ type: 'error', text: error instanceof Error ? error.message : (content.errorMessage || 'An unexpected error occurred.') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {message && (
                <p className={`${styles.message} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
                    {message.text}
                </p>
            )}

            {/* Email Field with Icon */}
            <div className={styles.inputGroup}>
                <label htmlFor="reset-email" className={styles.label}>{content.emailLabel}</label>
                <div className={styles.inputWrapper}>
                    <MdOutlineEmail aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type="email"
                        id="reset-email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={content.emailPlaceholder}
                        required
                        disabled={isLoading}
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Sending...') : content.submitButton}
            </button>
        </form>
    );
}
