// components/auth/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SignUpForm.module.css'; // Используем стили от SignUp? Проверь путь.
import { MdOutlineEmail, MdPersonOutline } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface LoginContent {
    title?: string;
    loginLabel: string;
    loginPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    submitButton: string;
    loadingText?: string;
    invalidCredentialsError?: string;
}

interface LoginApiResponse {
    key: string;
    user?: { /* ... */ };
    non_field_errors?: string[];
    detail?: string;
    [key: string]: any;
}

interface LoginFormProps {
    content: LoginContent;
    locale: string;
}

export default function LoginForm({ content, locale }: LoginFormProps) {
    const router = useRouter();
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_STARTING_BASE || ''}/api/auth/login/`;

            // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
            // Отправляем введенное значение и как username, и как email.
            // Бэкенд с настройкой 'username_email' сам выберет, по какому полю искать.
            const requestBody = {
                username: loginIdentifier,
                email: loginIdentifier,
                password: password
            };
            // --- КОНЕЦ ИЗМЕНЕНИЯ ---

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const responseData: LoginApiResponse = await response.json();

            if (!response.ok) {
                let errorMessage = content.invalidCredentialsError || "Login failed. Please check your credentials.";
                // Улучшенная обработка ошибок от dj-rest-auth/DRF
                if (responseData.non_field_errors && responseData.non_field_errors.length > 0) {
                    errorMessage = responseData.non_field_errors[0];
                } else if (responseData.detail) {
                     errorMessage = responseData.detail;
                } else {
                    const fieldErrors = Object.entries(responseData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                    if (fieldErrors) {
                        errorMessage = fieldErrors;
                    } else {
                        // Если тело ответа не JSON или пустое
                        errorMessage = `Server responded with status ${response.status}`;
                    }
                }
                 console.error("Login Error Response:", responseData); // Логируем ответ с ошибкой
                 throw new Error(errorMessage);
            }

            const token = responseData.key;

            if (!token) {
                 throw new Error("Authentication successful, but no token received from server.");
            }

            const AUTH_TOKEN_KEY = 'authToken';

            try {
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                localStorage.setItem("loginIdentifier",loginIdentifier)
                setLoginIdentifier("");
                setPassword("");
                const redirectPath = `/${locale}/health_statistics`;
                
                router.push(redirectPath);
            } catch (storageError) {
                console.error("Failed to store auth token:", storageError);
                setError("Could not save your session. Please try again.");
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            console.error("Login Submit Error:", err); // Логируем ошибку в консоль
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.errorMessage}>{error}</p>}

            {/* Поле для Email или Username */}
            <div className={styles.inputGroup}>
                <label htmlFor="login-identifier" className={styles.label}>{content.loginLabel}</label>
                <div className={styles.inputWrapper}>
                    {loginIdentifier.includes('@') ? <MdOutlineEmail aria-hidden="true" className={styles.inputIcon} /> : <MdPersonOutline aria-hidden="true" className={styles.inputIcon} />}
                    <input
                        type="text"
                        id="login-identifier"
                        name="loginIdentifier"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder={content.loginPlaceholder}
                        required
                        disabled={isLoading}
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Поле Пароля */}
            <div className={styles.inputGroup}>
                <label htmlFor="login-password" className={styles.label}>{content.passwordLabel}</label>
                <div className={styles.inputWrapper}>
                    <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={content.passwordPlaceholder || ''}
                        required
                        disabled={isLoading}
                        className={styles.input}
                    />
                     <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.visibilityToggle}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <FaRegEyeSlash aria-hidden="true"/> : <FaRegEye aria-hidden="true"/>}
                    </button>
                </div>
            </div>

            {/* Кнопка Отправки */}
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Logging in...') : content.submitButton}
            </button>
        </form>
    );
}
