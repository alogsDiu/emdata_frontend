// app/components/LogoutButton.js (or your preferred location)
'use client'; // This directive makes it a Client Component

import styles from './components.module.css'; // Assuming this path is correct
import { useRouter } from 'next/navigation'; // Import for App Router

export function LogoutButton({ locale }: { locale: string }) {
    const router = useRouter(); // Hook for navigation

    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');
        const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
        const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

        try {
            const response = await fetch(`${CLEANED_API_BASE_URL}/api/auth/logout`, { // EXAMPLE endpoint
                method: 'POST', // Or 'GET', 'DELETE', etc., based on your backend
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                // body: JSON.stringify({ someData: 'if_needed' }) // If your backend expects a body
            });

            if (response.ok) {
                console.log('Logout successful on backend');
                // --- Client-side cleanup (IMPORTANT) ---
                // If you are manually managing tokens (e.g., in localStorage/sessionStorage),
                // clear them here.
                // localStorage.removeItem('authToken');
                // sessionStorage.removeItem('userSession');

                // If using a library like NextAuth.js, its signOut() function
                // might handle this and the redirection for you.
                // Consider if you need to call a specific client-side logout function
                // from your auth provider here.
            } else {
                const errorData = await response.text(); // Get more error info
                console.error('Backend logout failed:', response.status, errorData);
            }
        } catch (error) {
            // Handle network errors or other issues with the fetch call
            console.error('Error during logout request:', error);
            // You might want to display an error message to the user.
        }

        // 2. Redirect to the home page
        // This will navigate the user to the homepage ('/') using Next.js client-side routing.
        // This happens after the try...catch block, so it will redirect even if the
        // backend call fails. If you only want to redirect on successful logout,
        // move this line into the `if (response.ok)` block.
        router.push('/');
    };

    return (
        <button onClick={handleLogout} className={styles.logoutButton}>
            {locale === "en" ? "Log out" : (locale === "ru" ? "Выход" : "Шыгу")}
        </button>
    );
}