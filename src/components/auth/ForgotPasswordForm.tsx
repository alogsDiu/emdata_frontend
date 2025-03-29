// components/auth/ForgotPasswordForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css'; // Create this CSS Module

// Assuming ForgotPasswordContent interface is defined/imported
interface ForgotPasswordContent {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string; // e.g., "If an account exists, a reset link has been sent."
    errorMessage?: string;   // e.g., "Failed to send reset link. Please try again."
}

interface ForgotPasswordFormProps {
    content: ForgotPasswordContent;
    locale: string; // May not be needed here unless API depends on it
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
            // --- API Call ---
            const response = await fetch('/api/auth/request-reset', { // Replace with your API endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // Check if response is okay, even if backend doesn't return specific error messages
            if (!response.ok) {
                // You might get generic network errors, or specific ones if backend sends them
                 throw new Error(content.errorMessage || 'Failed to send reset link. Please try again.');
            }

            // --- Handle Success ---
            // Don't assume account exists, use a generic success message
            setMessage({ type: 'success', text: content.successMessage || 'If an account with that email exists, a password reset link has been sent.' });
            setEmail(''); // Optionally clear email field

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
                <p className={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                    {message.text}
                </p>
            )}
            <div className={styles.formGroup}>
                <label htmlFor="reset-email">{content.emailLabel}</label>
                <input
                    type="email"
                    id="reset-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.emailPlaceholder}
                    required
                    disabled={isLoading}
                />
            </div>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Sending...') : content.submitButton}
            </button>
        </form>
    );
}