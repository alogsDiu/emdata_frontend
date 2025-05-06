// app/(dashboard)/lab_results/[submissionId]/page.tsx
"use client"; // This page is a Client Component

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import styles from './page.module.css'; // Import CSS module for this page
import Link from 'next/link'; // Import Link for potential future use

// Import the context hook to access locale
import { useDashboardContext } from '../../DashboardContext'; // Adjust path as needed

// Import getLocalizedContent to fetch page-specific content
import { getLocalizedContent } from '@/lib/i18n'; // Assuming lib/i18n.ts is correct

// Define expected content structure for the detail page
interface LabResultDetailPageContent {
    pageTitle: string; // e.g., "Lab Result Details"
    loadingMessage: string; // e.g., "Loading lab result details..."
    errorMessage: string; // e.g., "Failed to load lab result details."
    submissionDetailsTitle: string; // e.g., "Submission Details"
    testTypeLabel: string; // e.g., "Test Type:"
    submissionDateLabel: string; // e.g., "Submission Date:"
    testDateLabel: string; // e.g., "Test Date:"
    processingStatusLabel: string; // e.g., "Processing Status:"
    processingDetailsLabel: string; // e.g., "Processing Details:"
    notesLabel: string; // e.g., "Notes:"
    originalFileLabel: string; // e.g., "Original File:"
    downloadAction: string; // e.g., "Download"
    parsedResultsTitle: string; // e.g., "Parsed Results"
    noResultsMessage: string; // e.g., "No results parsed yet."
    analyteNameHeader: string; // e.g., "Analyte"
    valueHeader: string; // e.g., "Value"
    unitHeader: string; // e.g., "Unit"
    referenceRangeHeader: string; // e.g., "Reference Range"
    statusHeader: string; // e.g., "Status"
    // Localized texts for processing statuses
    processingStatusPending: string;
    processingStatusProcessing: string;
    processingStatusCompleted: string;
    processingStatusFailed: string;
    unknownTestType: string; // Localized text for unknown test type
    statusNormal: string; // Localized text for normal status
    statusAbnormal: string; // Localized text for abnormal status
    statusUnknown: string; // Localized text for unknown status
    authenticationRequired: string;
    backButtonText: string; // Text for the back button
}

// Define the structure of the detailed submission object from /api/submissions/<uuid:id>/
interface DetailedSubmission {
    id: string;
    user: any; // User object (simplified)
    test_type: string | null;
    test_type_name: string | null;
    submission_date: string; // ISO 8601 datetime string
    test_date: string | null; // ISO 8601 date string or null
    notes: string | null;
    uploaded_file: string | null; // URL to the uploaded file (relative path from MEDIA_URL)
    file_name: string | null; // Original file name
    processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string; // Allow string for flexibility
    processing_details: string | null;
    extracted_text: string | null; // Raw text (might be large)
    created_at: string; // ISO 8601 datetime string
    updated_at: string; // ISO 8601 datetime string
    results: Array<{
        id: string;
        analyte: string; // Analyte ID or object (depending on serializer depth)
        analyte_name: string; // Analyte name
        value: string; // Original value string
        value_numeric: string | null; // Decimal value as string or null
        unit: string | null; // Reported unit
        reference_range: string | null; // Reference range string
        status_text: string | null; // Text status from PDF
        is_abnormal: boolean | null; // Boolean status
        extracted_at: string; // ISO 8601 datetime string
    }>;
}

// Get the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;


export default function LabResultDetailPage() {
    const { locale } = useDashboardContext();
    const params = useParams();
    const router = useRouter(); // Get router instance
    const submissionId = params.submissionId as string;

    const [pageContent, setPageContent] = useState<LabResultDetailPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    const [submission, setSubmission] = useState<DetailedSubmission | null>(null);
    const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);
    const [fetchSubmissionError, setFetchSubmissionError] = useState<string | null>(null);


    // --- Effect Hook to Fetch Localized Page Content ---
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                const content = await getLocalizedContent(locale, 'lab_result_detail') as LabResultDetailPageContent;
                 if (content) {
                    setPageContent(content);
                 } else {
                    console.warn(`Localized content for locale '${locale}' and key 'lab_result_detail' not found. Using fallback.`);
                    // Fallback content
                    setPageContent({
                        pageTitle: 'Lab Result Details',
                        loadingMessage: 'Loading lab result details...',
                        errorMessage: 'Failed to load lab result details.',
                        submissionDetailsTitle: 'Submission Details',
                        testTypeLabel: 'Test Type:',
                        submissionDateLabel: 'Submission Date:',
                        testDateLabel: 'Test Date:',
                        processingStatusLabel: 'Processing Status:',
                        processingDetailsLabel: 'Processing Details:',
                        notesLabel: 'Notes:',
                        originalFileLabel: 'Original File:',
                        downloadAction: 'Download',
                        parsedResultsTitle: 'Parsed Results',
                        noResultsMessage: 'No results parsed yet.',
                        analyteNameHeader: 'Analyte',
                        valueHeader: 'Value',
                        unitHeader: 'Unit',
                        referenceRangeHeader: 'Reference Range',
                        statusHeader: 'Status',
                        processingStatusPending: 'Pending',
                        processingStatusProcessing: 'Processing',
                        processingStatusCompleted: 'Completed',
                        processingStatusFailed: 'Failed',
                        unknownTestType: 'Unknown Type',
                        statusNormal: 'Normal',
                        statusAbnormal: 'Abnormal',
                        statusUnknown: 'Unknown',
                        authenticationRequired: 'Authentication Required.',
                        backButtonText: 'Назад к списку', // Fallback text for back button
                    });
                 }
            } catch (error: any) {
                console.error("Error loading page content:", error);
                setContentError("Failed to load page content.");
                 // Ensure fallback content is set even on error
                 setPageContent({
                     pageTitle: 'Lab Result Details',
                     loadingMessage: 'Loading lab result details...',
                     errorMessage: 'Failed to load page content.',
                     submissionDetailsTitle: 'Submission Details',
                     testTypeLabel: 'Test Type:',
                     submissionDateLabel: 'Submission Date:',
                     testDateLabel: 'Test Date:',
                     processingStatusLabel: 'Processing Status:',
                     processingDetailsLabel: 'Processing Details:',
                     notesLabel: 'Notes:',
                     originalFileLabel: 'Original File:',
                     downloadAction: 'Download',
                     parsedResultsTitle: 'Parsed Results',
                     noResultsMessage: 'No results parsed yet.',
                     analyteNameHeader: 'Analyte',
                     valueHeader: 'Value',
                     unitHeader: 'Unit',
                     referenceRangeHeader: 'Reference Range',
                     statusHeader: 'Status',
                     processingStatusPending: 'Pending',
                     processingStatusProcessing: 'Processing',
                     processingStatusCompleted: 'Completed',
                     processingStatusFailed: 'Failed',
                     unknownTestType: 'Unknown Type',
                     statusNormal: 'Normal',
                     statusAbnormal: 'Abnormal',
                     statusUnknown: 'Unknown',
                     authenticationRequired: 'Authentication Required.',
                     backButtonText: 'Назад к списку', // Fallback text for back button here too
                 });
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchPageContent();

    }, [locale]);


    // --- Function to Fetch Submission Details ---
    useEffect(() => {
        // Ensure page content is loaded and submissionId is available
        if (!pageContent || !submissionId) {
             if (!submissionId) console.warn("Submission ID not available in URL params.");
             if (!pageContent) console.log("Page content not yet loaded, waiting to fetch submission details.");
             return;
        }

        const fetchSubmissionDetails = async () => {
            setIsLoadingSubmission(true);
            setFetchSubmissionError(null);

            try {
                // --- Get Authentication Token ---
                const token = localStorage.getItem('authToken');
                if (!token) {
                     console.warn("Authentication token not found. Cannot fetch submission details.");
                     setFetchSubmissionError(pageContent.authenticationRequired || 'Authentication required.');
                     setIsLoadingSubmission(false);
                     return;
                }
                // --- End Get Authentication Token ---

                // Construct the API URL for the specific submission
                const apiUrl = `${CLEANED_API_BASE_URL}/api/submissions/${submissionId}/`;
                console.log(`Fetching submission details from: ${apiUrl}`); // Log the URL being fetched

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                });

                if (response.ok) {
                    const data: DetailedSubmission = await response.json();
                    setSubmission(data);
                    console.log('Submission details fetched successfully:', data);
                } else {
                    const errorText = await response.text();
                    console.error(`Failed to fetch submission details for ID ${submissionId}: ${response.status}`, errorText);
                    setFetchSubmissionError(pageContent.errorMessage || 'Failed to load lab result details.');
                }
            } catch (error: any) {
                console.error('Error fetching submission details:', error);
                setFetchSubmissionError(pageContent.errorMessage || 'Failed to load lab result details.');
            } finally {
                setIsLoadingSubmission(false);
            }
        };

        fetchSubmissionDetails();

    }, [submissionId, pageContent]); // Re-fetch if submissionId or pageContent changes


    // --- Helper to Get Localized Processing Status ---
    const getLocalizedProcessingStatus = (status: DetailedSubmission['processing_status'] | null | undefined): string => {
        if (!pageContent || !status) return String(status || 'Unknown Status');
        const statusUpper = String(status).toUpperCase(); // Make comparison case-insensitive
        switch (statusUpper) {
            case 'PENDING': return pageContent.processingStatusPending;
            case 'PROCESSING': return pageContent.processingStatusProcessing;
            case 'COMPLETED': return pageContent.processingStatusCompleted;
            case 'FAILED': return pageContent.processingStatusFailed;
            default: return String(status); // Fallback for any unexpected status values
        }
    };

    // --- Helper to Get Localized Result Status (Normal/Abnormal) ---
     const getLocalizedResultStatus = (isAbnormal: boolean | null | undefined, statusText: string | null | undefined): string => {
         const fallbackStatus = statusText || (isAbnormal === true ? 'Abnormal' : isAbnormal === false ? 'Normal' : 'Unknown');
         if (!pageContent) return fallbackStatus;

         if (statusText) return statusText; // Prioritize text from PDF if available

         if (isAbnormal === true) return pageContent.statusAbnormal;
         if (isAbnormal === false) return pageContent.statusNormal;

         return pageContent.statusUnknown; // Fallback for null/undefined isAbnormal
     };


    // --- Render Loading or Error States ---
    if (isContentLoading || isLoadingSubmission) {
        // Show loading message from pageContent if available, otherwise a generic one
        return (
            <div className={styles.loadingPageContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>{pageContent?.loadingMessage || 'Loading...'}</p>
            </div>
        );
    }

    // Handle errors: content loading error, submission fetch error, or missing data
    if (contentError || fetchSubmissionError || !pageContent || !submission) {
        const displayError = contentError || fetchSubmissionError || pageContent?.errorMessage || 'An error occurred.';
        return (
            <div className={styles.errorPageContainer}>
                 {/* Add back button even on error */}
                 {pageContent?.backButtonText && (
                     <button onClick={() => router.back()} className={styles.backButton}>
                         {pageContent.backButtonText}
                     </button>
                 )}
                <p className={styles.errorMessage}>{displayError}</p>
            </div>
        );
    }

    // --- Main Component Render (only if no loading/errors and data is present) ---
    return (
        <div className={styles.pageContainer}>
             {/* Back Button at the top */}
             <button onClick={() => router.back()} className={styles.backButton}>
                 {pageContent.backButtonText}
             </button>

            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* --- Submission Details Section --- */}
            <div className={styles.detailsSection}>
                <h2 className={styles.sectionTitle}>{pageContent.submissionDetailsTitle}</h2>
                <div className={styles.detailsGrid}>
                    {/* Test Type */}
                    <div className={styles.detailLabel}>{pageContent.testTypeLabel}</div>
                    <div className={styles.detailValue}>{submission.test_type_name || pageContent.unknownTestType}</div>

                    {/* Submission Date */}
                    <div className={styles.detailLabel}>{pageContent.submissionDateLabel}</div>
                    <div className={styles.detailValue}>
                        {new Date(submission.submission_date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                        {' '}
                        {new Date(submission.submission_date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Test Date */}
                    <div className={styles.detailLabel}>{pageContent.testDateLabel}</div>
                    <div className={styles.detailValue}>
                        {submission.test_date ? new Date(submission.test_date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </div>

                    {/* Processing Status */}
                    <div className={styles.detailLabel}>{pageContent.processingStatusLabel}</div>
                    <div className={styles.detailValue}>
                        {getLocalizedProcessingStatus(submission.processing_status)}
                        {/* Optionally display processing details if status is FAILED */}
                        {submission.processing_status?.toUpperCase() === 'FAILED' && submission.processing_details && (
                            <span className={styles.processingErrorDetails}>
                                ({pageContent.processingDetailsLabel} {submission.processing_details})
                            </span>
                        )}
                    </div>

                    {/* Notes */}
                    {submission.notes && (
                         <>
                             <div className={styles.detailLabel}>{pageContent.notesLabel}</div>
                             {/* Use pre-wrap to preserve whitespace/newlines in notes */}
                             <div className={`${styles.detailValue} ${styles.notesValue}`}>{submission.notes}</div>
                         </>
                    )}

                    {/* Original File Link */}
                    {submission.uploaded_file && (
                         <>
                             <div className={styles.detailLabel}>{pageContent.originalFileLabel}</div>
                             <div className={styles.detailValue}>
                                 <a
                                     // Construct the full URL for the file using the base URL and the relative path from backend
                                     href={`${CLEANED_API_BASE_URL}${submission.uploaded_file}`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className={styles.actionLink}
                                     // Suggest the original filename for download
                                     download={submission.file_name || 'download'}
                                 >
                                     {/* Display filename or fallback, plus localized download action text */}
                                     {submission.file_name || submission.uploaded_file.split('/').pop()} ({pageContent.downloadAction})
                                 </a>
                             </div>
                         </>
                    )}
                </div>
            </div>

            {/* --- Parsed Results Section --- */}
            <div className={styles.resultsSection}>
                <h2 className={styles.sectionTitle}>{pageContent.parsedResultsTitle}</h2>

                {/* Display message if processing is not completed */}
                {submission.processing_status?.toUpperCase() !== 'COMPLETED' ? (
                     <p className={styles.infoMessage}>
                        {pageContent.noResultsMessage} (Processing Status: {getLocalizedProcessingStatus(submission.processing_status)})
                     </p>
                ) : submission.results.length === 0 ? (
                    // Display message if processing is completed but no results were parsed
                    <p className={styles.infoMessage}>{pageContent.noResultsMessage}</p>
                ) : (
                    // Display the results table if processing is completed and results exist
                    <div className={styles.resultsTableWrapper}>
                        <table className={styles.resultsTable}>
                            <thead>
                                <tr>
                                    <th>{pageContent.analyteNameHeader}</th>
                                    <th>{pageContent.valueHeader}</th>
                                    <th>{pageContent.unitHeader}</th>
                                    <th>{pageContent.referenceRangeHeader}</th>
                                    <th>{pageContent.statusHeader}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submission.results.map(result => (
                                    <tr key={result.id} className={result.is_abnormal ? styles.abnormalRow : ''}>
                                        <td>{result.analyte_name}</td>
                                        {/* Prefer numeric value if available, otherwise use original string value */}
                                        <td>{result.value_numeric ?? result.value}</td>
                                        <td>{result.unit || '-'}</td>
                                        <td>{result.reference_range || '-'}</td>
                                        <td>
                                            {/* Use helper for localized status (Normal/Abnormal/Text) */}
                                            {getLocalizedResultStatus(result.is_abnormal, result.status_text)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Optional: Generated Report Section (Example) */}
            {/* {submission.processing_status?.toUpperCase() === 'COMPLETED' && submission.results.length > 0 && (
                 <div className={styles.generatedReportSection}>
                     <h3 className={styles.sectionTitle}>Generated Report</h3>
                     <a
                         href={`${CLEANED_API_BASE_URL}/api/submissions/${submission.id}/report/`} // Example endpoint
                         target="_blank"
                         rel="noopener noreferrer"
                         className={styles.actionLink}
                     >
                         Download Generated Report (PDF)
                     </a>
                 </div>
            )} */}

        </div>
    );
}
