// components/auth/SignUpForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SignUpForm.module.css'; // Убедись, что путь верный
import Link from 'next/link';
import { MdOutlineEmail, MdPersonOutline } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

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
}

interface SignUpFormProps {
    content: SignUpContent;
    locale: string;
}

export default function SignUpForm({ content, locale }: SignUpFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Для поля подтверждения
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPasswordToggle, setShowConfirmPasswordToggle] = useState(false);

    // Поле подтверждения пароля теперь обязательно
    const shouldShowConfirmField = true;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError(content.passwordMismatchError || "Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            // --- API Call ---
            const apiUrl = `${process.env.NEXT_PUBLIC_STARTING_BASE || ''}/api/auth/registration/`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Отправляем username, email, password и password2
                body: JSON.stringify({
                    username,
                    email,
                    password1: password,
                    password2: confirmPassword // Значение из поля подтверждения
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                let errorMessage = content.reg_error || "Registration failed.";
                // Извлекаем ошибки
                if (responseData.username && responseData.username.length > 0) errorMessage = `Username: ${responseData.username[0]}`;
                else if (responseData.email && responseData.email.length > 0) errorMessage = `Email: ${responseData.email[0]}`;
                else if (responseData.password && responseData.password.length > 0) errorMessage = `Password: ${responseData.password[0]}`;
                else if (responseData.password1 && responseData.password1.length > 0) errorMessage = `Password: ${responseData.password1[0]}`; // dj-rest-auth может использовать password1/2
                else if (responseData.password2 && responseData.password2.length > 0) errorMessage = `Confirm Password: ${responseData.password2[0]}`;
                else if (responseData.non_field_errors && responseData.non_field_errors.length > 0) errorMessage = responseData.non_field_errors[0];
                else if (responseData.detail) errorMessage = responseData.detail;
                else errorMessage = JSON.stringify(responseData);
                throw new Error(errorMessage);
            }

            // --- Handle Success ---
            setSuccess(content.successMessage || "Registration successful! Please check your email to verify your account.");
            setEmail('');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            // Не перенаправляем

        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const successStyle = {
        color: '#2E7D32',
        marginTop: '10px',
        padding: '10px',
        border: '1px solid #A5D6A7',
        borderRadius: '4px',
        backgroundColor: '#E8F5E9'
      };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p style={successStyle}>{success}</p>}

            {/* Поле Email */}
            <div className={styles.inputGroup}>
                <label htmlFor="signup-email" className={styles.label}>{content.emailLabel}</label>
                <div className={styles.inputWrapper}>
                    <MdOutlineEmail aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type="email"
                        id="signup-email"
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

            {/* Поле Username (Логин) */}
            <div className={styles.inputGroup}>
                <label htmlFor="signup-username" className={styles.label}>{content.usernameLabel}</label>
                <div className={styles.inputWrapper}>
                    <MdPersonOutline aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type="text"
                        id="signup-username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={content.usernamePlaceholder}
                        required
                        disabled={isLoading}
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Поле Пароля */}
            <div className={styles.inputGroup}>
                <label htmlFor="signup-password" className={styles.label}>{content.passwordLabel}</label>
                <div className={styles.inputWrapper}>
                    <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type={showPassword ? "text" : "password"}
                        id="signup-password"
                        name="password" // Имя поля password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={content.passwordPlaceholder || ''}
                        required
                        minLength={8}
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

            {/* Поле Подтверждения Пароля (password2) */}
            <div className={styles.inputGroup}>
                <label htmlFor="confirm-password" className={styles.label}>
                    {content.confirmPasswordLabel || 'Confirm Password'}
                </label>
                <div className={styles.inputWrapper}>
                     <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type={showConfirmPasswordToggle ? "text" : "password"}
                        id="confirm-password"
                        name="password2" // Имя поля password2
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={content.confirmPasswordPlaceholder || ''}
                        required // Обязательно
                        disabled={isLoading}
                        className={styles.input}
                    />
                     <button
                      type="button"
                      onClick={() => setShowConfirmPasswordToggle(!showConfirmPasswordToggle)}
                      className={styles.visibilityToggle}
                      aria-label={showConfirmPasswordToggle ? "Hide confirm password" : "Show confirm password"}
                      disabled={isLoading}
                    >
                      {showConfirmPasswordToggle ? <FaRegEyeSlash aria-hidden="true"/> : <FaRegEye aria-hidden="true"/>}
                    </button>
                </div>
            </div>

            {/* Кнопка Отправки */}
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Signing up...') : content.submitButton}
            </button>
        </form>
    );
}
