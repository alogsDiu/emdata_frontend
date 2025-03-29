// components/auth/SignUpForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Create this CSS Module

// Assuming SignUpContent interface is defined/imported
interface SignUpContent {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    confirmPasswordLabel?: string; // Optional based on JSON content
    confirmPasswordPlaceholder?: string; // Optional based on JSON content
    submitButton: string;
    loadingText?: string;
    passwordMismatchError?: string; // Optional localized error message
}

interface SignUpFormProps {
    content: SignUpContent;
    locale: string;
}

export default function SignUpForm({ content, locale }: SignUpFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // FIX APPLIED HERE: Ensure showConfirmPassword is a boolean
    const showConfirmPassword = !!(content.confirmPasswordLabel && content.confirmPasswordPlaceholder);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        // Basic client-side validation using the boolean showConfirmPassword
        if (showConfirmPassword && password !== confirmPassword) {
            setError(content.passwordMismatchError || "Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            // --- API Call ---
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

             if (!response.ok) {
                let errorMessage = "Sign up failed. Please try again.";
                 try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (parseError) {}
                 throw new Error(errorMessage);
            }

            // --- Handle Success ---
            router.push(`/${locale}/login?signedUp=true`);

        } catch (err) {
             setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
             {error && <p className={styles.errorMessage}>{error}</p>}

            {/* ... email input (required is fine here) */}
             <div className={styles.formGroup}>
                <label htmlFor="signup-email">{content.emailLabel}</label>
                <input
                    type="email" id="signup-email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.emailPlaceholder} required disabled={isLoading}
                />
            </div>

            {/* ... password input (required is fine here) */}
            <div className={styles.formGroup}>
                <label htmlFor="signup-password">{content.passwordLabel}</label>
                <input
                    type="password" id="signup-password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={content.passwordPlaceholder} required minLength={8} disabled={isLoading}
                />
            </div>

            {/* Conditional rendering block */}
            {showConfirmPassword && (
                <div className={styles.formGroup}>
                    <label htmlFor="confirm-password">{content.confirmPasswordLabel}</label>
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={content.confirmPasswordPlaceholder}
                        // THIS NOW WORKS because showConfirmPassword is guaranteed to be true/false
                        required={showConfirmPassword}
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* ... submit button */}
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                 {isLoading ? (content.loadingText || 'Signing up...') : content.submitButton}
            </button>
        </form>
    );
}