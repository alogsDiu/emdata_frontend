// components/auth/ResetPasswordConfirmForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Для редиректа после успеха
// Используем те же стили для единообразия
import styles from './ForgotPasswordForm.module.css'; // Используем стили от ForgotPassword
import { RiLockPasswordLine } from 'react-icons/ri';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// Интерфейс для контента (можно передавать через props)
interface ResetConfirmContent {
    title?: string;
    newPasswordLabel: string;
    newPasswordPlaceholder?: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder?: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string; // Общая ошибка
    passwordMismatchError?: string;
}

// Интерфейс для ответа API
interface ResetConfirmApiResponse {
    detail?: string; // Сообщение об успехе или ошибке от dj-rest-auth
    // Ошибки валидации по полям
    uid?: string[];
    token?: string[];
    new_password1?: string[];
    new_password2?: string[];
    non_field_errors?: string[];
    [key: string]: any;
}

interface ResetPasswordConfirmFormProps {
    content: ResetConfirmContent;
    locale: string;
    uid: string;    // Получаем из параметров URL
    token: string; // Получаем из параметров URL
}

export default function ResetPasswordConfirmForm({ content, locale, uid, token }: ResetPasswordConfirmFormProps) {
    const router = useRouter();
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    // Проверяем наличие uid и token при монтировании компонента
    useEffect(() => {
        if (!uid || !token) {
            // Исправлена опечатка: contepassword -> content
            setMessage({ type: 'error', text: content.errorMessage || 'Invalid password reset link.' });
        }
    }, [uid, token, content.errorMessage]); // Добавляем content в массив зависимостей

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (newPassword1 !== newPassword2) {
            setMessage({ type: 'error', text: content.passwordMismatchError || 'Passwords do not match.' });
            setIsLoading(false);
            return;
        }

        if (!uid || !token) {
             setMessage({ type: 'error', text: content.errorMessage || 'Invalid password reset link parameters.' });
             setIsLoading(false);
             return;
        }

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_STARTING_BASE || ''}/api/auth/password/reset/confirm/`;
            // console.log("Reset Confirm API URL:", apiUrl); // Убрано

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password1: newPassword1,
                    new_password2: newPassword2
                }),
            });

            const responseData: ResetConfirmApiResponse = await response.json();

            if (!response.ok) {
                let errorMessage = content.errorMessage || 'Password reset failed. Please try again.';
                if (responseData.non_field_errors && responseData.non_field_errors.length > 0) {
                    errorMessage = responseData.non_field_errors[0];
                } else if (responseData.new_password2 && responseData.new_password2.length > 0) {
                    errorMessage = `Confirm Password: ${responseData.new_password2[0]}`;
                } else if (responseData.new_password1 && responseData.new_password1.length > 0) {
                    errorMessage = `Password: ${responseData.new_password1[0]}`;
                } else if (responseData.uid && responseData.uid.length > 0) {
                    errorMessage = `UID Error: ${responseData.uid[0]}`;
                } else if (responseData.token && responseData.token.length > 0) {
                    errorMessage = `Token Error: ${responseData.token[0]}`;
                } else if (responseData.detail) {
                     errorMessage = responseData.detail;
                } else {
                    errorMessage = JSON.stringify(responseData);
                }
                 // console.error("Reset Confirm Error Response:", responseData); // Убрано
                 throw new Error(errorMessage);
            }

            setMessage({ type: 'success', text: responseData.detail || content.successMessage || 'Your password has been reset successfully. You can now log in.' });
            setNewPassword1('');
            setNewPassword2('');

            setTimeout(() => {
                router.push(`/${locale}/login`);
            }, 3000);

        } catch (error) {
            // console.error("Reset Confirm Submit Error:", error); // Убрано
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

            {/* Поле Новый Пароль */}
            <div className={styles.inputGroup}>
                <label htmlFor="new_password1" className={styles.label}>{content.newPasswordLabel}</label>
                <div className={styles.inputWrapper}>
                    <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type={showPassword1 ? "text" : "password"}
                        id="new_password1"
                        name="new_password1"
                        value={newPassword1}
                        onChange={(e) => setNewPassword1(e.target.value)}
                        placeholder={content.newPasswordPlaceholder || ''}
                        required
                        minLength={8}
                        disabled={isLoading}
                        className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword1(!showPassword1)}
                      className={styles.visibilityToggle}
                      aria-label={showPassword1 ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword1 ? <FaRegEyeSlash aria-hidden="true"/> : <FaRegEye aria-hidden="true"/>}
                    </button>
                </div>
            </div>

            {/* Поле Подтверждение Нового Пароля */}
            <div className={styles.inputGroup}>
                <label htmlFor="new_password2" className={styles.label}>{content.confirmPasswordLabel}</label>
                <div className={styles.inputWrapper}>
                    <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type={showPassword2 ? "text" : "password"}
                        id="new_password2"
                        name="new_password2"
                        value={newPassword2}
                        onChange={(e) => setNewPassword2(e.target.value)}
                        placeholder={content.confirmPasswordPlaceholder || ''}
                        required
                        disabled={isLoading}
                        className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      className={styles.visibilityToggle}
                      aria-label={showPassword2 ? "Hide confirm password" : "Show confirm password"}
                      disabled={isLoading}
                    >
                      {showPassword2 ? <FaRegEyeSlash aria-hidden="true"/> : <FaRegEye aria-hidden="true"/>}
                    </button>
                </div>
            </div>

            {/* Кнопка Отправки */}
            <button type="submit" disabled={isLoading || !uid || !token} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Resetting...') : content.submitButton}
            </button>
        </form>
    );
}
