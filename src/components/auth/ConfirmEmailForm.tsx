// components/auth/ConfirmEmailForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Используем стили от других форм для единообразия
import styles from './ForgotPasswordForm.module.css'; // Или SignUpForm.module.css

// Интерфейс для контента
interface ConfirmEmailContent {
    confirmButtonText: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string; // Общая ошибка
    invalidKeyError?: string; // Ошибка неверного ключа
}

// Интерфейс для ответа API
interface ConfirmEmailApiResponse {
    detail?: string; // Сообщение от dj-rest-auth
    key?: string[]; // Возможная ошибка для ключа
    non_field_errors?: string[];
    [key: string]: any;
}

interface ConfirmEmailFormProps {
    content: ConfirmEmailContent;
    locale: string;
    confirmationKey: string; // Ключ подтверждения из URL
}

export default function ConfirmEmailForm({ content, locale, confirmationKey }: ConfirmEmailFormProps) {
    const router = useRouter();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Проверяем ключ при загрузке
    useEffect(() => {
        if (!confirmationKey) {
            setMessage({ type: 'error', text: content.invalidKeyError || 'Invalid confirmation link.' });
        }
    }, [confirmationKey, content.invalidKeyError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!confirmationKey) {
             setMessage({ type: 'error', text: content.invalidKeyError || 'Invalid confirmation key.' });
             setIsLoading(false);
             return;
        }

        try {
            // --- ИСПРАВЛЕНИЕ ЗДЕСЬ: Используем стандартный URL dj-rest-auth ---
            const apiUrl = `${process.env.NEXT_PUBLIC_STARTING_BASE || ''}/api/registration/verify-email/`;
            // ---------------------------------------------------------------
            console.log("Confirm Email API URL:", apiUrl);

            console.log("Confirmation Key:", confirmationKey);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: confirmationKey }), // Отправляем ключ
            });
            console.log("Response Status:", response.status);
            const responseData = await response.json();
            console.log("Response Data:", responseData);
            

            if (!response.ok) {
                let errorMessage = content.errorMessage || 'Email confirmation failed.';
                if (responseData.key && responseData.key.length > 0) {
                    errorMessage = `Key Error: ${responseData.key[0]}`;
                } else if (responseData.non_field_errors && responseData.non_field_errors.length > 0) {
                    errorMessage = responseData.non_field_errors[0];
                } else if (responseData.detail) {
                     errorMessage = responseData.detail; // Например, "Invalid key"
                } else {
                    errorMessage = JSON.stringify(responseData);
                }
                 // console.error("Confirm Email Error Response:", responseData);
                 throw new Error(errorMessage);
            }

            // --- Handle Success ---
            setMessage({ type: 'success', text: responseData.detail || content.successMessage || 'Email confirmed successfully! Redirecting to login...' });

            // Перенаправляем на страницу входа через несколько секунд
            setTimeout(() => {
                router.push(`/${locale}/login`);
            }, 3000); // Редирект через 3 секунды

        } catch (error) {
            // console.error("Confirm Email Submit Error:", error);
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

            {/* Кнопка Отправки */}
            <button
                type="submit"
                disabled={isLoading || !confirmationKey} // Блокируем, если нет ключа
                className={styles.submitButton}
                style={{ marginTop: '10px' }} // Добавим отступ сверху
            >
                {isLoading ? (content.loadingText || 'Confirming...') : content.confirmButtonText}
            </button>
        </form>
    );
}
