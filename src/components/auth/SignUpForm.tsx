// components/auth/SignUpForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// *** CHANGE CSS IMPORT ***
import styles from './SignUpForm.module.css'; // Use its own CSS module
import Link from 'next/link'; // Import Link if needed within the form (though usually outside)
import { MdOutlineEmail,MdPersonOutline } from 'react-icons/md'; // Email Icon
import { RiLockPasswordLine } from 'react-icons/ri'; // Lock Icon
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Visibility Icons

// Assuming SignUpContent interface is defined/imported from page.tsx or a types file
interface SignUpContent {
    title?: string; // Title is likely rendered in the parent page component
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder?: string;
    confirmPasswordLabel?: string;
    confirmPasswordPlaceholder?: string;
    submitButton: string;
    loadingText?: string;
    passwordMismatchError?: string;
    usernamePlaceholder:string;
    usernameLabel:string;
    reg_error:string;
    successMessage:string;
}

// Keep existing interfaces if needed
interface SignupApiResponse{
    token: string;
    message?: string;
    user?: { id: string; };
}

interface SignUpFormProps {
    content: SignUpContent;
    locale: string;
}
function delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function SignUpForm({ content, locale }: SignUpFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPasswordToggle, setShowConfirmPasswordToggle] = useState(false); // Separate state for confirm field

    // Check if confirm password field should be shown based on content prop
    const shouldShowConfirmField = !!(content.confirmPasswordLabel);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (shouldShowConfirmField && password !== confirmPassword) {
            setError(content.passwordMismatchError || "Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const role = "USER";
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STARTING_BASE}/api/auth/register/`, { // Ensure API route is correct
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username,role}),
            });

            if (!response.ok) {
                let errorMessage = content.reg_error;
                try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (parseError) {}
                throw new Error(errorMessage);
            }

            const responseData = await response.json() as SignupApiResponse;
            const token = responseData.token;
            const AUTH_TOKEN_KEY = 'authToken';
            setSuccess(content.successMessage)
            
            await delay(10000);

            try {
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                const redirectPath = `/${locale}/login`; // Adjust destination
                router.push(redirectPath);
            } catch (storageError) {
                console.error("Failed to store auth token:", storageError);
                setError("Could not save your session. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const successStyle = {
        color: '#2E7D32', // A standard success green color
        marginTop: '10px', // Add some space above the message
        padding: '10px',   // Give it some padding
        border: '1px solid #A5D6A7', // Subtle border
        borderRadius: '4px',        // Rounded corners
        backgroundColor: '#E8F5E9' // Light green background
      };

    return (
        // Use the specific form style from SignUpForm.module.css
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p style={successStyle}>{success}</p>}

            {/* Email Field with Icon */}
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
                        className={styles.input} // Apply input style
                    />
                </div>
            </div>
            <div className={styles.inputGroup}>
            <label htmlFor="signup-username" className={styles.label}>{content.usernameLabel}</label>
            <div className={styles.inputWrapper}>
                {/* Replace MdPersonOutline with your desired user icon */}
                <MdPersonOutline aria-hidden="true" className={styles.inputIcon} />
                <input
                    type="text" // Changed type to "text" for username
                    id="signup-username" // Updated id to match label htmlFor
                    name="username" // Updated name attribute
                    value={username} // Bind to your username state variable
                    onChange={(e) => setUsername(e.target.value)} // Update username state
                    placeholder={content.usernamePlaceholder} // Use username placeholder text
                    required // Keep if username is required
                    disabled={isLoading} // Keep disabled state logic
                    className={styles.input} // Apply same input style
                />
            </div>
        </div>

            {/* Password Field with Icon and Toggle */}
            <div className={styles.inputGroup}>
                <label htmlFor="signup-password" className={styles.label}>{content.passwordLabel}</label>
                <div className={styles.inputWrapper}>
                    <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                    <input
                        type={showPassword ? "text" : "password"} // Toggle type
                        id="signup-password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={content.passwordPlaceholder || ''}
                        required
                        minLength={8} // Keep validation
                        disabled={isLoading}
                        className={styles.input} // Apply input style
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

            {/* Confirm Password Field (Conditional) */}
            {shouldShowConfirmField && (
                <div className={styles.inputGroup}>
                    <label htmlFor="confirm-password" className={styles.label}>
                        {content.confirmPasswordLabel}
                    </label>
                    <div className={styles.inputWrapper}>
                         <RiLockPasswordLine aria-hidden="true" className={styles.inputIcon} />
                        <input
                            type={showConfirmPasswordToggle ? "text" : "password"} // Separate toggle type
                            id="confirm-password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={content.confirmPasswordPlaceholder || ''}
                            required={shouldShowConfirmField} // Required only if shown
                            disabled={isLoading}
                            className={styles.input} // Apply input style
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
            )}

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (content.loadingText || 'Signing up...') : content.submitButton}
            </button>
        </form>
    );
}