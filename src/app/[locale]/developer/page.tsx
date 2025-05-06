// app/[locale]/dev/page.tsx
"use client"; // This page is a Client Component

import { useState, useEffect } from 'react';
// Adjusted styles import path for the new location
import styles from './page.module.css'; // Import the CSS module
import { useRouter, usePathname } from 'next/navigation'; // Import useRouter and usePathname for navigation
import { getLocalizedContent } from '@/lib/i18n';
import LanguageSwitcher from '@/components/general/LanguageSwitcher';
// Removed useDashboardContext as locale comes from page params


// Removed UserDeveloperData interface as API key is not needed
// interface UserDeveloperData {
//     userId: string; // Link to the user account
//     apiKey: string; // Simulated API Key/Token
//     developerAccessEnabledDate: string; // Date developer access was enabled
//     // Potentially add other dev-specific settings
// }

// Define a simplified data structure for the data developers can download
interface HealthDataPoint {
    userId: string; // Link to the user who owns this data
    date: string;
    metricName: string;
    value: number;
    unit: string;
    // Potentially add more fields like reference ranges if available
}


// Define expected content structure for developer_page.json (or default.json)
interface DeveloperPageContent {
    pageTitle: string;
    // Removed API access localization keys
    // apiAccessTitle: string; // Changed title
    // yourApiKeyLabel: string; // Changed label
    // regenerateApiKeyButtonText: string; // New button text
    // apiKeyRegeneratedSuccess: string; // New success message
    loadingMessage: string;
    errorMessage: string;
    // Removed noDeveloperAccessMessage as the page assumes access
    // noDeveloperAccessMessage: string; // New message if dev access is not enabled
    // Localization keys for data download section (reused/updated)
    dataDownloadTitle: string; // Updated title
    startDateLabel: string;
    endDateLabel: string;
    downloadButtonText: string;
    downloadingMessage: string;
    noFilteredDataMessage: string;
    // Removed apiKeySaveReminder
    // apiKeySaveReminder: string; // Reminder to save API key
    // New localization keys for language switcher
    languageSwitcherLabel: string;
    englishLanguage: string;
    kazakhLanguage: string;
    russianLanguage: string;
    // Add other localized strings needed
}

// Removed mockUserDeveloperData as API key is not needed
// --- Mock Data Simulation for User Developer Data ---
// const mockUserDeveloperData: UserDeveloperData[] = [
//     { userId: 'user-abc', apiKey: 'sk-userabc-xxxxxxxxxxxx', developerAccessEnabledDate: '2023-10-01' },
//     { userId: 'user-xyz', apiKey: 'sk-userxyz-yyyyyyyyyyyy', developerAccessEnabledDate: '2023-11-15' },
//     // Add more mock data for other users
// ];

// --- Mock Data Simulation for Health Data ---
// This simulates the health data that developers can download.
// In a real application, this would come from your health data storage,
// with each point linked to a user.
const mockHealthData: HealthDataPoint[] = [
    { userId: 'user-abc', date: '2024-01-05', metricName: 'Hemoglobin', value: 145, unit: 'g/L' },
    { userId: 'user-abc', date: '2024-01-05', metricName: 'WBC', value: 7.2, unit: 'x10^9/L' },
    { userId: 'user-xyz', date: '2024-01-11', metricName: 'Hemoglobin', value: 148, unit: 'g/L' },
    { userId: 'user-abc', date: '2024-01-11', metricName: 'Iron', value: 22, unit: 'µmol/L' },
    { userId: 'user-xyz', date: '2024-01-02', metricName: 'Cholesterol', value: 5.5, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-01', metricName: 'Glucose', value: 4.8, unit: 'mmol/L' },
    { userId: 'user-xyz', date: '2024-01-10', metricName: 'Glucose', value: 5.1, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-11', metricName: 'WBC', value: 7.5, unit: 'x10^9/L' },
    { userId: 'user-xyz', date: '2024-01-05', metricName: 'Iron', value: 21, unit: 'µmol/L' },
    { userId: 'user-abc', date: '2024-01-03', metricName: 'Hemoglobin', value: 140, unit: 'g/L' },
    { userId: 'user-xyz', date: '2024-01-01', metricName: 'WBC', value: 6.8, unit: 'x10^9/L' },
    { userId: 'user-abc', date: '2024-01-12', metricName: 'Cholesterol', value: 5.3, unit: 'mmol/L' },
    { userId: 'user-xyz', date: '2024-01-04', metricName: 'Glucose', value: 4.9, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-06', metricName: 'Hemoglobin', value: 146, unit: 'g/L' },
    { userId: 'user-xyz', date: '2024-01-08', metricName: 'WBC', value: 7.0, unit: 'x10^9/L' },
    { userId: 'user-abc', date: '2024-01-09', metricName: 'Iron', value: 23, unit: 'µmol/L' },
    { userId: 'user-xyz', date: '2024-01-03', metricName: 'Cholesterol', value: 5.4, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-04', metricName: 'WBC', value: 7.0, unit: 'x10^9/L' },
    { userId: 'user-xyz', date: '2024-01-11', metricName: 'Glucose', value: 5.0, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-05', metricName: 'Cholesterol', value: 5.6, unit: 'mmol/L' },
    { userId: 'user-xyz', date: '2024-01-09', metricName: 'Glucose', value: 4.7, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-10', metricName: 'Hemoglobin', value: 149, unit: 'g/L' },
    { userId: 'user-xyz', date: '2024-01-05', metricName: 'Glucose', value: 4.9, unit: 'mmol/L' },
    { userId: 'user-abc', date: '2024-01-05', metricName: 'Hemoglobin', value: 144, unit: 'g/L' },
    { userId: 'user-xyz', date: '2024-01-02', metricName: 'Iron', value: 20, unit: 'µmol/L' },
    { userId: 'user-abc', date: '2024-01-03', metricName: 'WBC', value: 7.1, unit: 'x10^9/L' },
    { userId: 'user-xyz', date: '2024-01-02', metricName: 'Glucose', value: 4.6, unit: 'mmol/L' },
];


// --- Simulate Logged-in User ID ---
// In a real application, you would get the logged-in user's ID from your authentication system.
// This is still needed in the simulation to potentially differentiate data sources,
// but the download function itself will fetch for ALL users.
const simulatedLoggedInUserId = 'user-abc'; // Replace with actual user ID context


// Removed fetchLoggedInUserDeveloperData as API key is not needed
// Function to simulate fetching developer data for the logged-in user
// async function fetchLoggedInUserDeveloperData(userId: string): Promise<UserDeveloperData | null> {
//     // Simulate an API call delay
//     await new Promise(resolve => setTimeout(resolve, 500));
//     // In a real backend, fetch the developer data for the given user ID.
//     const userDevData = mockUserDeveloperData.find(data => data.userId === userId);
//     return userDevData || null; // Return data if found, otherwise null
// }

// Removed regenerateApiKey as API key is not needed
// Function to simulate regenerating API key for the logged-in user
// async function regenerateApiKey(userId: string): Promise<string> {
//      // Simulate an API call delay
//     await new Promise(resolve => setTimeout(resolve, 500));
//     // In a real backend, this would generate a new key and update the database.
//     const newApiKey = `sk-user${userId.substring(5)}-${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
//     console.log(`Simulating API key regeneration for ${userId}: ${newApiKey}`);
//     // In a real app, you would update the mockUserDeveloperData or your backend store
//     const userDevData = mockUserDeveloperData.find(data => data.userId === userId);
//     if (userDevData) {
//         userDevData.apiKey = newApiKey; // Update mock data
//     }
//     return newApiKey;
// }


// Function to simulate fetching filtered health data for ALL users
async function fetchFilteredDataForAllUsers(startDate: string, endDate: string): Promise<HealthDataPoint[]> {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 700));

    // In a real backend, you would query your database for ALL health data
    // within the given date range, regardless of user ID.
    // For this simulation, we'll filter the mock data by date range only.
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredData = mockHealthData.filter(point => {
        const pointDate = new Date(point.date);
        // Include data points on the start and end dates as well
        // Removed the userId check here
        return pointDate >= start && pointDate <= end;
    });

    console.log(`Simulating fetching data for ALL users from ${startDate} to ${endDate}`, filteredData);
    return filteredData;
}


// Receive locale as a prop from the page parameters
export default function DeveloperPage({ params }: { params: { locale: string } }) { // Get locale from params
    const router = useRouter(); // Initialize useRouter
    const pathname = usePathname(); // Get the current pathname
    const [locale,setLocale] = useState('en');

    // Removed userDeveloperData state as API key is not needed
    // const [userDeveloperData, setUserDeveloperData] = useState<UserDeveloperData | null>(null);
    // Removed isLoading state related to fetching userDeveloperData
    // const [isLoading, setIsLoading] = useState(true);
    // Removed error state related to fetching userDeveloperData
    // const [error, setError] = useState<string | null>(null);

    // Keep loading state for content
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);
    // Changed content interface
    const [pageContent, setPageContent] = useState<DeveloperPageContent | null>(null);


    // State for data download filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // Removed state for API key regeneration
    // const [isRegeneratingKey, setIsRegeneratingKey] = useState(false); // New state for key regeneration status
    // const [apiKeyRegeneratedSuccess, setApiKeyRegeneratedSuccess] = useState<string | null>(null); // New state for regeneration success message


    // --- Effect to fetch page-specific localized content ---
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                const {locale} = await params;
                setLocale(locale);
                // Use the dynamic locale and updated key for fetching content
                const content = await getLocalizedContent(locale, 'developer_page') as DeveloperPageContent;
                 if (content) {
                    setPageContent(content);
                 } else {
                     // Fallback content if localization fails
                     setPageContent({
                         pageTitle: 'Developer Settings', // Updated title
                         // Removed API access localization keys
                         loadingMessage: 'Loading settings...', // Updated message
                         errorMessage: 'Failed to load settings.', // Updated message
                         // Removed noDeveloperAccessMessage
                         // Fallback for new keys
                         dataDownloadTitle: 'Download All Users\' Health Data', // Updated title
                         startDateLabel: 'Start Date:',
                         endDateLabel: 'End Date:',
                         downloadButtonText: 'Download Data', // Updated button text
                         downloadingMessage: 'Preparing data...',
                         noFilteredDataMessage: 'No data available for the selected date range.',
                         // Removed apiKeySaveReminder
                         // Fallback for language switcher keys
                         languageSwitcherLabel: 'Select Language:',
                         englishLanguage: 'English',
                         kazakhLanguage: 'Kazakh',
                         russianLanguage: 'Russian',
                     });
                 }
            } catch (error: any) {
                console.error("Error loading developer page content:", error);
                setContentError("Failed to load developer page content.");
                 // Set fallback content on error
                  setPageContent({
                      pageTitle: 'Developer Settings', // Updated title
                      // Removed API access localization keys
                      loadingMessage: 'Loading settings...', // Updated message
                      errorMessage: 'Failed to load settings.', // Updated message
                      // Removed noDeveloperAccessMessage
                       // Fallback for new keys
                      dataDownloadTitle: 'Download All Users\' Health Data', // Updated title
                      startDateLabel: 'Start Date:',
                      endDateLabel: 'End Date:',
                      downloadButtonText: 'Download Data', // Updated button text
                      downloadingMessage: 'Preparing data...',
                      noFilteredDataMessage: 'No data available for the selected date range.',
                      // Removed apiKeySaveReminder
                       // Fallback for language switcher keys
                      languageSwitcherLabel: 'Select Language:',
                      englishLanguage: 'English',
                      kazakhLanguage: 'Kazakh',
                      russianLanguage: 'Russian',
                  });
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchPageContent();
    }, [locale]); // Re-fetch content when the locale changes


    // Removed useEffect to fetch logged-in user's developer data as it's not needed without API key
    // --- Effect to fetch logged-in user's developer data ---
    // useEffect(() => {
    //     const loadUserDeveloperData = async () => {
    //         setIsLoading(true);
    //         setError(null);
    //         try {
    //             // Use the simulated logged-in user's authentication status
    //             // In a real app, you might still verify developer access here if needed
    //             // const fetchedUserDevData = await fetchLoggedInUserDeveloperData(simulatedLoggedInUserId);
    //             // setUserDeveloperData(fetchedUserDevData);
    //         } catch (err) {
    //             console.error("Error fetching user developer data:", err);
    //             setError(pageContent?.errorMessage || "Failed to load developer settings.");
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     // Only fetch if page content is loaded
    //     if (!isContentLoading) {
    //          loadUserDeveloperData();
    //     }

    // }, [isContentLoading, pageContent]); // Re-run when page content is loaded


    // Removed Handler for regenerating API Key
    // --- Handler for regenerating API Key ---
    // const handleRegenerateApiKey = async () => {
    //     if (!userDeveloperData) return; // Should not happen if button is enabled

    //     setIsRegeneratingKey(true);
    //     setApiKeyRegeneratedSuccess(null);
    //     setError(null); // Clear any previous errors

    //     try {
    //         // Use the simulated regenerate function
    //         const newKey = await regenerateApiKey(userDeveloperData.userId);
    //         // Update the state with the new key
    //         setUserDeveloperData(prevData => prevData ? { ...prevData, apiKey: newKey } : null);
    //         setApiKeyRegeneratedSuccess(pageContent?.apiKeyRegeneratedSuccess || 'New API key generated successfully!');

    //     } catch (err) {
    //         console.error("Error regenerating API key:", err);
    //         setError("Failed to regenerate API key."); // Use localized error
    //     } finally {
    //         setIsRegeneratingKey(false);
    //          // Clear the success message after a few seconds (optional)
    //          setTimeout(() => setApiKeyRegeneratedSuccess(null), 5000); // Clear after 5 seconds
    //     }
    // };


    // --- Handler for data download button click ---
    const handleDownloadData = async () => {
        // Removed check for userDeveloperData as user is assumed authenticated
        // if (!userDeveloperData) return; // Cannot download if user developer data is not loaded

        setDownloadError(null); // Clear previous error
        setIsDownloading(true);

        if (!startDate || !endDate) {
            setDownloadError("Please select both start and end dates."); // Basic validation
            setIsDownloading(false);
            return;
        }

        // Basic date validation
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            setDownloadError("Start date cannot be after the end date.");
            setIsDownloading(false);
            return;
        }


        try {
            // Use the simulated fetch filtered data function for ALL users
            // Removed simulatedLoggedInUserId from this call
            const data = await fetchFilteredDataForAllUsers(startDate, endDate);

            if (data.length === 0) {
                setDownloadError(pageContent?.noFilteredDataMessage || 'No data available for the selected date range.');
                return; // Stop here if no data
            }

            // --- Actual File Download Logic ---
            // Format the data (e.g., to JSON or CSV)
            const jsonData = JSON.stringify(data, null, 2); // Format as pretty JSON
            const blob = new Blob([jsonData], { type: 'application/json' }); // Create a Blob
            const url = URL.createObjectURL(blob); // Create a URL for the Blob

            // Create a temporary anchor element to trigger the download
            const a = document.createElement('a');
            a.href = url;
            // Set the download filename - updated to indicate data for ALL users
            a.download = `all_users_health_data_${startDate}_to_${endDate}.json`;
            document.body.appendChild(a); // Append to body (necessary for Firefox)
            a.click(); // Programmatically click the anchor to trigger download

            // Clean up the temporary anchor and URL
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log("Data download initiated.");

        } catch (err) {
            console.error("Error fetching or downloading data:", err);
            setDownloadError(pageContent?.errorMessage || "Failed to download data."); // Use localized error
        } finally {
            setIsDownloading(false);
        }
    };

    // --- Handler for language change ---
    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = event.target.value;
        // Construct the new path with the selected locale
        const newPath = `/${newLocale}${pathname.substring(3)}`; // Assuming current path starts with /en, /kz, or /ru
        router.push(newPath); // Navigate to the new path
    };


    // Show loading state while content is fetching
    // Removed checks for isLoading and error related to userDeveloperData
    if (isContentLoading || !pageContent) {
        return (
            <div className={styles.loadingContainer}>
                 <div className={styles.loadingSpinner}></div>
                 {/* Use localized loading message */}
                 <p>{pageContent?.loadingMessage || 'Loading settings...'}</p>
            </div>
        );
    }

    // Removed check for error related to userDeveloperData
    // Show error state if fetching failed
    // if (error) {
    //     return <div className={styles.errorContainer}><p>{error}</p></div>;
    // }

    // Removed check for userDeveloperData as the page assumes developer access for authenticated users
    // Show message if developer access is not enabled for the user
    // if (!userDeveloperData) {
    //     return (
    //         <div className={styles.container}>
    //             <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
    //             <p>{pageContent.noDeveloperAccessMessage}</p>
    //              {/* Potentially add a button here to request developer access */}
    //         </div>
    //     );
    // }


    return (
        <div className={styles.container}>
            {/* Language Switcher */}
            <LanguageSwitcher/>


            {/* Use localized page title */}
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* Data Download Section */}
            <section className={styles.section}>
                 {/* Use localized section title */}
                <h2 className={styles.sectionTitle}>{pageContent.dataDownloadTitle}</h2>
                <div className={styles.dataDownloadForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="startDate">{pageContent.startDateLabel}</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={isDownloading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="endDate">{pageContent.endDateLabel}</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={isDownloading}
                        />
                    </div>
                    <button onClick={handleDownloadData} disabled={isDownloading}>
                        {isDownloading ? pageContent.downloadingMessage : pageContent.downloadButtonText}
                    </button>
                    {downloadError && <p className={styles.errorMessage}>{downloadError}</p>}


                </div>
            </section>

            {/* Removed Registered Developers Section as it's not relevant in this model */}
            {/* If you need to list all developers, that would be a separate admin-only page */}

        </div>
    );
}
