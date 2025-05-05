// components/auth/ForgotPasswordForm.tsx
'use client';

import { useState, FormEvent } from 'react';
// *** CHANGE CSS IMPORT ***
import styles from './ForgotPasswordForm.module.css'; // Use its own CSS module
import { MdOutlineEmail } from 'react-icons/md'; // Import email icon

// Keep interface definition
interface ForgotPasswordContent {
    title?: string; // Title usually rendered by parent page
    description?: string; // Description usually rendered by parent page
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
}

interface ForgotPasswordFormProps {
    content: ForgotPasswordContent;
    locale: string;
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
            const response = await fetch(`${process.env.NEXT_STARTING_BASE}/api/auth/request-reset`, { // Your API endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                let errorMessage = content.errorMessage || 'Failed to send reset link. Please try again.';
                try {
                    // Attempt to get more specific error from backend if available
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                     // Ignore parsing error, use default message
                }
                throw new Error(errorMessage);
            }

            setMessage({ type: 'success', text: content.successMessage || 'If an account with that email exists, a password reset link has been sent.' });
            // setEmail(''); // Keep email or clear it based on preference

        } catch (error) {
            console.error("Forgot Password Error:", error);
            setMessage({ type: 'error', text: error instanceof Error ? error.message : (content.errorMessage || 'An unexpected error occurred.') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Use styles from ForgotPasswordForm.module.css
        <form onSubmit={handleSubmit} className={styles.form}>
            {message && (
                <p className={`${styles.message} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
                    {message.text}
                </p>
            )}

            {/* Email Field with Icon */}
            <div className={styles.inputGroup}>
                <label htmlFor="reset-email" className={styles.label}>{content.emailLabel}</label>
                 {/* *** ADD WRAPPER AND ICON *** */}
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