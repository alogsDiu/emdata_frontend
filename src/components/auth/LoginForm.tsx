// components/auth/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import styles from './page.module.css'; // Create this CSS Module

// Assuming LoginContent interface is defined/imported similarly to the page component
interface LoginContent {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    submitButton: string;
    loadingText?: string;
    // Potentially add keys for specific error messages if needed from content
    // e.g., invalidCredentialsError: string;
}

interface LoginFormProps {
    content: LoginContent;
    locale: string; // Pass locale if needed for redirects or API
}

export default function LoginForm({ content, locale }: LoginFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // --- API Call ---
            const response = await fetch('/api/auth/login', { // Replace with your actual API endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // Try to parse error message from backend, otherwise use generic one
                let errorMessage = "Login failed. Please check your credentials.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    // Ignore if response is not JSON or empty
                }
                 throw new Error(errorMessage);
            }

            // --- Handle Success ---
            // Optionally parse success data if needed
            // const data = await response.json();

            // Redirect to dashboard or desired page on success
            // Use locale if your dashboard route is localized e.g., `/${locale}/dashboard`
            router.push('/dashboard'); // Adjust redirect path as needed
            // router.refresh(); // Optionally refresh server components

        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.formGroup}>
                <label htmlFor="email">{content.emailLabel}</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.emailPlaceholder}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password">{content.passwordLabel}</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={content.passwordPlaceholder}
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Logging in...') : content.submitButton}
            </button>
        </form>
    );
}