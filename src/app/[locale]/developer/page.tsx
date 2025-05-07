"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css'; // Ensure this CSS module is styled accordingly
import { getLocalizedContent } from '@/lib/i18n';
import LanguageSwitcher from '@/components/general/LanguageSwitcher';

// Updated content structure for localization
interface DownloadPageContent {
    pageTitle: string;
    downloadButtonText: string;
    downloadingMessage: string;
    downloadErrorOccurred: string; // For actual download errors
    tokenUnavailableError: string; // Specifically if token can't be found client-side
    loadingMessage: string;
    // languageSwitcherLabel?: string; // If your LanguageSwitcher component needs it
}

// This function interacts with your backend to get the CSV file.
async function triggerBackendCsvDownload(token: string, apiUrl: string): Promise<Response> {
    // Token presence is now asserted before calling this function by UI logic
    console.log(`Workspaceing CSV from: ${apiUrl} with token.`);
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        let errorDetails = `Server error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json(); // If backend sends JSON error
            errorDetails = errorData.message || errorData.error || errorDetails;
        } catch (e) {
            // If error response is not JSON
            const textError = await response.text();
            errorDetails = textError || errorDetails; // Use textError if available
        }
        throw new Error(`Failed to initiate download: ${errorDetails}`);
    }
    return response;
}

export default function DeveloperDownloadPage({ params }: { params: { locale: string } }) {
    const { locale } = params;

    const [pageContent, setPageContent] = useState<DownloadPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string | null; type: 'info' | 'error' | 'success' }>({ message: null, type: 'info' });
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isAuthTokenChecked, setIsAuthTokenChecked] = useState(false); // To know when token check is done

    // **IMPORTANT**: Define the actual backend URL that serves the CSV
    const BACKEND_CSV_API_URL = `${process.env.NEXT_PUBLIC_STARTING_BASE || ''}/api/data/export-all-csv`;

    // Load auth token from localStorage on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken'); // Or however your app makes the token available client-side
        setAuthToken(token);
        setIsAuthTokenChecked(true); // Mark that we've attempted to load the token
    }, []);

    // Fetch localized content
    useEffect(() => {
        const fetchContent = async () => {
            setIsContentLoading(true);
            // setFeedback({ message: null, type: 'info' }); // Cleared when attempting download
            try {
                const content = await getLocalizedContent(locale, 'dev_download_page') as DownloadPageContent;
                if (content) {
                    setPageContent(content);
                } else {
                    throw new Error(`Localization for '${locale}' on 'dev_download_page' not found.`);
                }
            } catch (error: any) {
                console.error("Error loading page content:", error.message);
                setPageContent({ // Basic English Fallback
                    pageTitle: 'Secure Data Export',
                    downloadButtonText: 'Download Full Data Archive (CSV)',
                    downloadingMessage: 'Preparing your download...',
                    downloadErrorOccurred: 'Download failed. Please try again later.',
                    tokenUnavailableError: 'Authentication token not found. Please ensure you are logged in correctly and try again.',
                    loadingMessage: 'Loading Page...',
                });
                setFeedback({ message: `Error: Could not load page text. (${error.message})`, type: 'error' });
            } finally {
                setIsContentLoading(false);
            }
        };
        if (locale) fetchContent();
    }, [locale]);

    const handleDownload = async () => {
        if (!authToken) {
            // This case should ideally not be hit if auth is handled upstream,
            // but it's a client-side safeguard.
            setFeedback({ message: pageContent?.tokenUnavailableError || "Authentication token is missing. Please re-login.", type: 'error' });
            return;
        }

        setFeedback({ message: pageContent?.downloadingMessage || "Initiating download...", type: 'info' });
        setIsDownloading(true);

        try {
            const response = await triggerBackendCsvDownload(authToken, BACKEND_CSV_API_URL);

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `data_export_${new Date().toISOString().slice(0,10)}.csv`; // Default
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none'; a.href = url; a.download = filename;
            document.body.appendChild(a); a.click();
            window.URL.revokeObjectURL(url); document.body.removeChild(a);

            setFeedback({ message: `Download "${filename}" started successfully! Check your downloads folder.`, type: 'success' });
            setTimeout(() => setFeedback({ message: null, type: 'info' }), 7000);

        } catch (err: any) {
            console.error("Download process error:", err);
            setFeedback({ message: err.message || pageContent?.downloadErrorOccurred || "An error occurred during download.", type: 'error' });
        } finally {
            setIsDownloading(false);
        }
    };

    // Initial loading state for content or token check
    if (isContentLoading || !pageContent || !isAuthTokenChecked) {
        return (
            <div className={styles.loadingPageContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>{pageContent?.loadingMessage || 'Loading...'}</p>
            </div>
        );
    }

    // If token check is done and token is still missing (safeguard)
    if (!authToken) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.pageContainer}>
                     <div className={styles.controlsHeaderMinimal}>
                        <LanguageSwitcher />
                    </div>
                    <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                    <div className={styles.errorMessageSection}> {/* Consistent section styling */}
                        <p className={`${styles.feedbackMessage} ${styles.error}`}>
                            {pageContent.tokenUnavailableError}
                        </p>
                        {/* Optionally, you could add a button here to redirect to login or homepage */}
                        {/* <button onClick={() => router.push('/login')} className={styles.button}>Go to Login</button> */}
                    </div>
                </div>
            </div>
        );
    }

    // Main content: Download button
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageContainer}>
                <div className={styles.controlsHeaderMinimal}> {/* More discreet header */}
                    <LanguageSwitcher />
                    {/* Logout button is removed from this page as per requirement */}
                </div>

                <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

                <div className={styles.downloadActionSection}>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`${styles.button} ${styles.mainDownloadButton}`}
                    >
                        {isDownloading ? pageContent.downloadingMessage : pageContent.downloadButtonText}
                    </button>
                </div>

                {feedback.message && (
                    <p className={`${styles.feedbackMessage} ${feedback.type === 'error' ? styles.error : (feedback.type === 'success' ? styles.success : styles.info)}`}>
                        {feedback.message}
                    </p>
                )}
            </div>
        </div>
    );
}