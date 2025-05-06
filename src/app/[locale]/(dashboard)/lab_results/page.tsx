// app/(dashboard)/lab_results/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useDashboardContext } from '../DashboardContext';
import { getLocalizedContent } from '@/lib/i18n';

// Define expected content structure for lab_results.json
interface LabResultsPageContent {
    pageTitle: string;
    bloodTestsSectionTitle: string;
    urineTestsSectionTitle: string;
    poopTestsSectionTitle: string;
    noDocumentsMessage: string;
    viewDetailsAction: string;
    downloadFileAction: string;
    uploadSectionTitle: string;
    uploadFormPrompt: string;
    selectedFilesTitle: string;
    confirmUploadButtonText: string;
    uploadingMessage: string;
    uploadErrorMessage: string;
    uploadSuccessMessage: string;
    loadingSubmissionsMessage: string;
    fetchSubmissionsErrorMessage: string;
    processingStatusPending: string;
    processingStatusProcessing: string;
    processingStatusCompleted: string;
    processingStatusFailed: string;
    unknownTestType: string;
    authenticationRequired: string;
    invalidTestType: string;
    invalidDateFormat: string;
    uploadStatusSectionTitle: string;
    fileStatusSelected: string;
    fileStatusUploading: string;
    fileStatusUploadFailed: string;
    fileStatusProcessing: string;
    fileStatusCompleted: string;
    fileStatusFailed: string;
    fileStatusErrorDetails: string;
    refreshListButton: string;
    clearSelectedButton: string;
    clearCompletedFailedButton: string;
    pdfOnlyError: string;
    fileMissingError: string;
    noSubmissionIdError: string;
    networkError: string;
    internalError: string;
    downloadError: string; // NEW: Error message for download failure
    downloadingMessage: string; // NEW: Message while download is preparing
}

// Define the structure of a submission object from /api/submissions/
interface Submission {
    id: string;
    submission_date: string;
    test_date: string | null;
    test_type_name: string | null;
    processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;
    file_name: string | null;
    processing_details?: string | null;
}

// Helper interface for grouping submissions
interface GroupedSubmissions {
    [key: string]: Submission[];
}

// Interface for tracking file status
type FileProcessingStatus = 'SELECTED' | 'UPLOADING' | 'UPLOAD_FAILED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;

interface FileStatus {
    tempId: string;
    file?: File;
    fileName: string;
    status: FileProcessingStatus;
    submissionId: string | null;
    errorMessage: string | null;
}

// Get the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

// --- Fallback Content Function ---
const getFallbackContent = (): LabResultsPageContent => ({
    pageTitle: 'Lab Results',
    bloodTestsSectionTitle: 'Blood Tests',
    urineTestsSectionTitle: 'Urine Tests',
    poopTestsSectionTitle: 'Other Tests',
    noDocumentsMessage: 'No documents uploaded yet.',
    viewDetailsAction: 'View Details',
    downloadFileAction: 'Download File',
    uploadSectionTitle: 'Upload New Document',
    uploadFormPrompt: 'Drag and drop PDF files here, or click to select.',
    selectedFilesTitle: 'Selected Files:',
    confirmUploadButtonText: 'Confirm Upload',
    uploadingMessage: 'Uploading files...',
    uploadErrorMessage: 'Upload failed:',
    uploadSuccessMessage: 'Upload successful!',
    loadingSubmissionsMessage: 'Loading lab results...',
    fetchSubmissionsErrorMessage: 'Failed to load lab results.',
    processingStatusPending: 'Pending',
    processingStatusProcessing: 'Processing',
    processingStatusCompleted: 'Completed',
    processingStatusFailed: 'Failed',
    unknownTestType: 'Unknown Type',
    authenticationRequired: 'Authentication required. Please log in.',
    invalidTestType: 'Invalid test type specified.',
    invalidDateFormat: 'Invalid date format (YYYY-MM-DD).',
    uploadStatusSectionTitle: 'Upload Status',
    fileStatusSelected: 'Selected',
    fileStatusUploading: 'Uploading...',
    fileStatusUploadFailed: 'Upload Failed',
    fileStatusProcessing: 'Processing...',
    fileStatusCompleted: 'Completed',
    fileStatusFailed: 'Failed',
    fileStatusErrorDetails: 'Details:',
    refreshListButton: 'Refresh List',
    clearSelectedButton: 'Clear Selected',
    clearCompletedFailedButton: 'Clear Completed/Failed',
    pdfOnlyError: 'Only PDF files are allowed.',
    fileMissingError: 'Internal error: File data missing.',
    noSubmissionIdError: 'Server did not return submission ID.',
    networkError: 'Network error occurred.',
    internalError: 'An internal error occurred.',
    downloadError: 'Failed to download file.', // Fallback download error
    downloadingMessage: 'Preparing download...', // Fallback downloading message
});


export default function LabResultsPage() {
    const { locale } = useDashboardContext();
    const [pageContent, setPageContent] = useState<LabResultsPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);
    const [uploadedSubmissions, setUploadedSubmissions] = useState<Submission[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [fetchSubmissionsError, setFetchSubmissionsError] = useState<string | null>(null);
    const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [batchUploadError, setBatchUploadError] = useState<string | null>(null);
    const [batchUploadSuccess, setBatchUploadSuccess] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null); // Track which file is being downloaded
    const [downloadError, setDownloadError] = useState<string | null>(null); // Specific error for download

    // --- Effect Hook to Fetch Localized Page Content ---
    useEffect(() => {
        const loadPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                const contentData = await getLocalizedContent(locale, 'lab_results');
                const validatedContent = { ...getFallbackContent(), ...(contentData as Partial<LabResultsPageContent>) };
                setPageContent(validatedContent);
            } catch (error: any) {
                console.error("Error loading page content:", error);
                setContentError("Failed to load page content.");
                setPageContent(getFallbackContent());
            } finally {
                setIsContentLoading(false);
            }
        };
        loadPageContent();
    }, [locale]);

    // --- Function to Fetch Submissions ---
    const fetchSubmissions = useCallback(async (showLoading = true) => {
        if (!pageContent) return;
        if (showLoading) setIsLoadingSubmissions(true);
        setFetchSubmissionsError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                 setFetchSubmissionsError(pageContent.authenticationRequired); return;
            }
            const apiUrl = `${CLEANED_API_BASE_URL}/api/submissions/`;
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Token ${token}` } });
            if (response.ok) {
                const data: Submission[] = await response.json();
                setUploadedSubmissions(data);
                // Update fileStatuses (simplified)
                setFileStatuses(prev => prev.map(item => {
                    if (!item.submissionId) return item;
                    const match = data.find(sub => sub.id === item.submissionId);
                    return match ? { ...item, status: match.processing_status || 'FAILED', errorMessage: match.processing_status?.toUpperCase() === 'FAILED' ? match.processing_details || pageContent.processingStatusFailed : null, file: undefined } : item;
                }));
            } else {
                setFetchSubmissionsError(pageContent.fetchSubmissionsErrorMessage);
            }
        } catch (error: any) {
            setFetchSubmissionsError(pageContent.fetchSubmissionsErrorMessage + ` (${pageContent.networkError})`);
        } finally {
            if (showLoading) setIsLoadingSubmissions(false);
        }
    }, [pageContent]);

    // --- Fetch Submissions on Mount ---
    useEffect(() => {
        if (pageContent) fetchSubmissions();
    }, [pageContent, fetchSubmissions]);

    // --- Handle File Selection ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // ... (existing code) ...
        const files = event.target.files;
        setBatchUploadError(null); setBatchUploadSuccess(false);
        if (files && pageContent) {
            const pdfFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
            if (pdfFiles.length !== files.length) {
                setBatchUploadError(pageContent.pdfOnlyError); event.target.value = ''; return;
            }
            setFileStatuses(prev => [
                ...prev.filter(item => item.status !== 'SELECTED'),
                ...pdfFiles.map((file, i) => ({ tempId: `${Date.now()}-${i}-${file.name}`, file, fileName: file.name, status: 'SELECTED', submissionId: null, errorMessage: null }))
            ]);
        } else {
            setFileStatuses(prev => prev.filter(item => item.status !== 'SELECTED'));
        }
        event.target.value = '';
    };

    // --- Handle Removing a File ---
    const handleRemoveFile = (tempIdToRemove: string) => {
        // ... (existing code) ...
         setFileStatuses(prev => prev.filter(item => item.tempId !== tempIdToRemove));
        setBatchUploadError(null); setBatchUploadSuccess(false);
    };

    // --- Handle Clearing Completed/Failed Items ---
    const handleClearCompletedFailed = () => {
        // ... (existing code) ...
         setFileStatuses(prev => prev.filter(item => {
            const statusUpper = item.status?.toUpperCase();
            return statusUpper !== 'COMPLETED' && statusUpper !== 'FAILED' && statusUpper !== 'UPLOAD_FAILED';
        }));
        setBatchUploadError(null); setBatchUploadSuccess(false);
    };

    // --- Handle Upload Confirmation ---
    const handleConfirmation = async () => {
        // ... (existing code - no changes needed here for download) ...
         if (!pageContent) return;
        const filesToUploadNow = fileStatuses.filter(item => item.status === 'SELECTED');
        if (filesToUploadNow.length === 0) { setBatchUploadError(pageContent.uploadErrorMessage + ' No files selected.'); return; }
        const missingFile = filesToUploadNow.find(item => !item.file);
        if (missingFile) {
            setBatchUploadError(pageContent.fileMissingError);
            setFileStatuses(prev => prev.map(item => item.tempId === missingFile.tempId ? { ...item, status: 'UPLOAD_FAILED', errorMessage: pageContent.fileMissingError } : item));
            return;
        }
        setIsUploading(true); setBatchUploadError(null); setBatchUploadSuccess(false);
        const currentBatchTempIds = filesToUploadNow.map(f => f.tempId);
        setFileStatuses(prev => prev.map(item => currentBatchTempIds.includes(item.tempId) ? { ...item, status: 'UPLOADING', errorMessage: null } : item));
        const formData = new FormData();
        filesToUploadNow.forEach(item => formData.append('files', item.file!, item.fileName));
        let uploadErrorOccurred = false;
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error(pageContent.authenticationRequired);
            const uploadUrl = `${CLEANED_API_BASE_URL}/api/upload/`;
            const response = await fetch(uploadUrl, { method: 'POST', body: formData, headers: { 'Authorization': `Token ${token}` } });
            if (response.ok) {
                const result = await response.json();
                const submissionIdsMap = new Map<string, string | null>();
                const backendSubmissionIds = result.submission_ids || [];
                filesToUploadNow.forEach((item, index) => submissionIdsMap.set(item.tempId, backendSubmissionIds[index] || null));
                setFileStatuses(prev => prev.map(item => {
                    if (currentBatchTempIds.includes(item.tempId)) {
                        const submissionId = submissionIdsMap.get(item.tempId);
                        if (submissionId) return { ...item, status: 'PENDING', submissionId, file: undefined };
                        uploadErrorOccurred = true; return { ...item, status: 'UPLOAD_FAILED', errorMessage: pageContent.noSubmissionIdError, file: undefined };
                    } return item;
                }));
                if (!uploadErrorOccurred) { setBatchUploadSuccess(true); setTimeout(() => setBatchUploadSuccess(false), 5000); }
                else { setBatchUploadError(pageContent.uploadErrorMessage + ' Some files failed.'); }
                setTimeout(() => fetchSubmissions(false), 1500);
            } else {
                uploadErrorOccurred = true; let errorMsg = pageContent.uploadErrorMessage;
                try { errorMsg += ` ${(await response.json()).detail || response.statusText}`; } catch { errorMsg += ` ${response.statusText}`; }
                setBatchUploadError(errorMsg);
                setFileStatuses(prev => prev.map(item => currentBatchTempIds.includes(item.tempId) ? { ...item, status: 'UPLOAD_FAILED', errorMessage: errorMsg, file: undefined } : item));
            }
        } catch (error: any) {
            uploadErrorOccurred = true;
            const errorMessage = error.message === pageContent.authenticationRequired ? error.message : `${pageContent.networkError}: ${error.message || pageContent.internalError}`;
            setBatchUploadError(errorMessage);
            setFileStatuses(prev => prev.map(item => currentBatchTempIds.includes(item.tempId) ? { ...item, status: 'UPLOAD_FAILED', errorMessage: errorMessage, file: undefined } : item));
        } finally {
            setIsUploading(false);
            if (uploadErrorOccurred) setTimeout(() => setBatchUploadError(null), 10000);
        }
    };

    // --- NEW: Handle File Download ---
    const handleDownload = async (submissionId: string, requestedFilename: string | null) => {
        if (!pageContent) return;
        setDownloadingFileId(submissionId); // Indicate download start for this specific file
        setDownloadError(null); // Clear previous download errors

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Instead of setting error, perhaps redirect to login or show a persistent message
                setDownloadError(pageContent.authenticationRequired);
                 // Optionally clear the error after a delay
                 setTimeout(() => setDownloadError(null), 7000);
                return; // Stop the download attempt
            }

            const downloadUrl = `${CLEANED_API_BASE_URL}/submission/${submissionId}/download/`; // Correct backend URL
            console.log(`Attempting download from: ${downloadUrl}`); // Log the URL

            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

             console.log(`Download response status: ${response.status}`); // Log response status

            if (response.ok) {
                const blob = await response.blob();
                console.log(`Received blob of type: ${blob.type}, size: ${blob.size}`); // Log blob info

                // Determine filename
                let filename = requestedFilename || 'download.pdf';
                const disposition = response.headers.get('content-disposition');
                console.log(`Content-Disposition header: ${disposition}`); // Log header
                if (disposition) {
                    const filenameRegex = /filename[^;=\n]*=(?:(['"])(?<filename>.*?)\1|(?<filename_fallback>[^;\n]*))/i; // Improved regex
                    const matches = filenameRegex.exec(disposition);
                    // Use named capture groups if supported, otherwise fallback
                    const extractedFilename = matches?.groups?.filename || matches?.groups?.filename_fallback;
                    if (extractedFilename) {
                         // Decode URI component potentially encoded filename
                         try {
                            filename = decodeURIComponent(extractedFilename.replace(/['"]/g, ''));
                         } catch (e) {
                            console.warn("Could not decode filename from header, using fallback.", e);
                            // Use the raw extracted filename if decoding fails
                            filename = extractedFilename.replace(/['"]/g, '');
                         }
                    }
                }
                 console.log(`Downloading file as: ${filename}`);

                // Create a temporary link to trigger download
                const tempUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = tempUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();

                // Clean up
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(tempUrl);
                console.log("Download initiated successfully.");

            } else {
                // Handle download errors
                let errorMsg = pageContent.downloadError;
                const statusText = response.statusText; // Store status text
                if (response.status === 404) {
                    errorMsg += ' (File not found on server).';
                } else if (response.status === 403) {
                    errorMsg += ' (Permission denied).';
                } else {
                     try {
                         // Try to parse error detail from JSON response
                         const errorData = await response.json();
                         errorMsg += ` (Server error: ${errorData.detail || statusText})`;
                     } catch {
                         // If response is not JSON, use status text
                         errorMsg += ` (Server error: ${statusText})`;
                     }
                }
                console.error(`Download failed for ${submissionId}: ${response.status} ${statusText}`);
                setDownloadError(errorMsg);
                 setTimeout(() => setDownloadError(null), 7000);
            }
        } catch (error: any) {
            console.error('Download exception:', error);
            setDownloadError(`${pageContent.downloadError} (${pageContent.networkError}: ${error.message || 'Unknown error'})`);
             setTimeout(() => setDownloadError(null), 7000);
        } finally {
            setDownloadingFileId(null); // Indicate download end regardless of success/failure
        }
    };


    // --- Helper to Get Localized Status Text ---
    const getLocalizedStatus = useCallback((status: FileProcessingStatus | null | undefined): string => {
        // ... (existing code) ...
        if (!pageContent || !status) return String(status || 'Unknown');
        const statusUpper = String(status).toUpperCase();
        switch (statusUpper) {
            case 'SELECTED': return pageContent.fileStatusSelected;
            case 'UPLOADING': return pageContent.fileStatusUploading;
            case 'UPLOAD_FAILED': return pageContent.fileStatusUploadFailed;
            case 'PENDING': return pageContent.processingStatusPending;
            case 'PROCESSING': return pageContent.processingStatusProcessing;
            case 'COMPLETED': return pageContent.processingStatusCompleted;
            case 'FAILED': return pageContent.processingStatusFailed;
            default: return String(status);
        }
    }, [pageContent]);

    // --- Helper to Group Submissions ---
    const groupSubmissionsByType = useCallback((submissions: Submission[]): GroupedSubmissions => {
        // ... (existing code) ...
         const unknownTypeKey = pageContent?.unknownTestType || 'Unknown Type';
        return submissions.reduce((acc, submission) => {
            const typeName = submission.test_type_name || unknownTypeKey;
            if (!acc[typeName]) acc[typeName] = [];
            acc[typeName].push(submission);
            return acc;
        }, {} as GroupedSubmissions);
    }, [pageContent?.unknownTestType]);

    // Memoize derived state
    const groupedSubmissions = useMemo(() => groupSubmissionsByType(uploadedSubmissions), [uploadedSubmissions, groupSubmissionsByType]);
    const testTypeSections = useMemo(() => Object.keys(groupedSubmissions).sort(), [groupedSubmissions]);
    const selectedFilesForDisplay = useMemo(() => fileStatuses.filter(item => item.status === 'SELECTED'), [fileStatuses]);
    const processingUploadsForDisplay = useMemo(() => fileStatuses.filter(item => item.status !== 'SELECTED'), [fileStatuses]);
    const hasCompletedOrFailedStatusItems = useMemo(() => fileStatuses.some(item => {
        const statusUpper = item.status?.toUpperCase();
        return statusUpper === 'COMPLETED' || statusUpper === 'FAILED' || statusUpper === 'UPLOAD_FAILED';
    }), [fileStatuses]);

    // --- Render Loading/Error States ---
    if (isContentLoading) {
        const loadingMsg = pageContent?.loadingSubmissionsMessage || 'Loading content...';
        return (<div className={styles.loadingPageContainer}><div className={styles.loadingSpinner}></div><p>{loadingMsg}</p></div>);
     }
    if (contentError || !pageContent) {
         // Ensure pageContent exists before accessing its properties
         const errorMsg = contentError || pageContent?.fetchSubmissionsErrorMessage || 'Error loading page configuration.';
         return <p className={styles.errorMessage}>{errorMsg}</p>;
     }


    // --- Main Component Render ---
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

             {/* Display general download error */}
             {downloadError && <p className={styles.downloadErrorMessage}>{downloadError}</p>}


            {/* --- Uploaded Documents Section --- */}
            <div className={styles.listHeader}>
                 <h2 className={styles.sectionTitle}>{pageContent.bloodTestsSectionTitle}</h2>
                 <button onClick={() => fetchSubmissions(true)} disabled={isLoadingSubmissions || isUploading} className={styles.refreshButton}>
                     {isLoadingSubmissions ? <div className={styles.smallSpinner}></div> : pageContent.refreshListButton}
                 </button>
            </div>

            {isLoadingSubmissions && !uploadedSubmissions.length ? (
                 <div className={styles.loadingSubmissionsContainer}><div className={styles.loadingSpinner}></div><p>{pageContent.loadingSubmissionsMessage}</p></div>
            ) : fetchSubmissionsError ? (
                 <p className={styles.errorMessage}>{fetchSubmissionsError}</p>
            ) : uploadedSubmissions.length === 0 ? (
                <p>{pageContent.noDocumentsMessage}</p>
            ) : (
                 testTypeSections.map(typeName => (
                    <div key={typeName} className={styles.documentSection}>
                        <h2 className={styles.sectionTitle}>{typeName}</h2>
                        <div className={styles.documentListWrapper}>
                            <ul className={styles.documentList}>
                                {groupedSubmissions[typeName].map(submission => {
                                     const statusUpper = submission.processing_status?.toUpperCase();
                                     const isDownloadingThis = downloadingFileId === submission.id;

                                     return (
                                        <li key={submission.id} className={styles.documentItem}>
                                            <span className={styles.documentName}>
                                                {submission.file_name || `Submission ${submission.id.substring(0, 8)}`}
                                            </span>
                                            <div className={styles.documentMeta}>
                                                {submission.test_date && (<span>{new Date(submission.test_date).toLocaleDateString(locale)}</span>)}
                                                <span>{getLocalizedStatus(submission.processing_status)}</span>
                                            </div>
                                            <div className={styles.documentActions}>
                                                {statusUpper === 'COMPLETED' && (
                                                    <Link href={`/${locale}/lab_results/${submission.id}`} className={styles.actionLink}>
                                                        {pageContent.viewDetailsAction}
                                                    </Link>
                                                )}
                                                {/* Download Button */}
                                                <button
                                                    onClick={() => handleDownload(submission.id, submission.file_name)}
                                                    className={`${styles.actionLink} ${styles.downloadButton}`} // Style as link/button
                                                    disabled={isDownloadingThis || isUploading} // Disable while downloading this or uploading anything
                                                    title={pageContent.downloadFileAction} // Tooltip
                                                >
                                                     {isDownloadingThis ? (
                                                        <>
                                                            <div className={styles.smallSpinnerInline}></div>
                                                            {/* Use fallback for downloading message */}
                                                            {pageContent.downloadingMessage || 'Downloading...'}
                                                        </>
                                                     ) : (
                                                        pageContent.downloadFileAction
                                                     )}
                                                </button>
                                            </div>
                                        </li>
                                     );
                                })}
                            </ul>
                        </div>
                    </div>
                 ))
            )}

            {/* --- Upload Section --- */}
            <div className={styles.uploadSection}>
                 {/* ... (rest of upload section remains the same) ... */}
                 <h2 className={styles.uploadTitle}>{pageContent.uploadSectionTitle}</h2>
                <div
                     className={`${styles.uploadForm} ${isUploading || selectedFilesForDisplay.length > 0 ? styles.uploadFormDisabled : ''}`}
                     onClick={() => !isUploading && selectedFilesForDisplay.length === 0 && document.getElementById('fileInput')?.click()}
                >
                    <p>{pageContent.uploadFormPrompt}</p>
                    <input
                        type="file" id="fileInput" className={styles.hiddenFileInput}
                        onChange={handleFileChange} multiple accept=".pdf"
                        disabled={isUploading || selectedFilesForDisplay.length > 0}
                    />
                </div>

                {batchUploadSuccess && <p className={styles.uploadSuccessMessage}>{pageContent.uploadSuccessMessage}</p>}
                {batchUploadError && <p className={styles.uploadErrorMessage}>{batchUploadError}</p>}

                {selectedFilesForDisplay.length > 0 && (
                    <div className={styles.selectedFilesList}>
                        <h4>{pageContent.selectedFilesTitle}</h4>
                        <ul>
                            {selectedFilesForDisplay.map(item => (
                                <li key={item.tempId} className={styles.selectedFileItem}>
                                    <span className={styles.selectedFileName}>{item.fileName}</span>
                                    <button className={styles.removeFileButton} onClick={() => handleRemoveFile(item.tempId)} disabled={isUploading} aria-label={`Remove ${item.fileName}`}>&times;</button>
                                </li>
                            ))}
                        </ul>
                         <button className={styles.clearSelectedButton} onClick={() => setFileStatuses(prev => prev.filter(item => item.status !== 'SELECTED'))} disabled={isUploading}>
                             {pageContent.clearSelectedButton} ({selectedFilesForDisplay.length})
                         </button>
                    </div>
                )}

                {selectedFilesForDisplay.length > 0 && (
                     <button className={styles.confirmUploadButton} onClick={handleConfirmation} disabled={isUploading}>
                         {isUploading
                            ? <><div className={styles.smallSpinner}></div> {pageContent.uploadingMessage}</>
                            : `${pageContent.confirmUploadButtonText} (${selectedFilesForDisplay.length})`
                         }
                     </button>
                )}

                 {processingUploadsForDisplay.length > 0 && (
                     <div className={styles.uploadStatusSection}>
                         <h3 className={styles.uploadStatusTitle}>{pageContent.uploadStatusSectionTitle}</h3>
                         <ul className={styles.uploadStatusList}>
                             {processingUploadsForDisplay.map(item => {
                                 const statusUpper = item.status?.toUpperCase();
                                 const isFinalState = statusUpper === 'COMPLETED' || statusUpper === 'FAILED' || statusUpper === 'UPLOAD_FAILED';
                                 const isProcessingState = statusUpper === 'UPLOADING' || statusUpper === 'PENDING' || statusUpper === 'PROCESSING';
                                 return (
                                     <li key={item.tempId} className={styles.uploadStatusItem}>
                                         <span className={styles.uploadStatusFileName}>{item.fileName}</span>
                                         <span className={styles.uploadStatusText}>
                                             {getLocalizedStatus(item.status)}
                                             {isProcessingState && <div className={styles.smallSpinner}></div>}
                                             {(statusUpper === 'UPLOAD_FAILED' || statusUpper === 'FAILED') && item.errorMessage && (
                                                 <span className={styles.uploadStatusError}> ({pageContent.fileStatusErrorDetails} {item.errorMessage})</span>
                                             )}
                                             {isFinalState && (
                                                 <button className={styles.removeStatusItemButton} onClick={() => handleRemoveFile(item.tempId)} aria-label={`Remove ${item.fileName} from status list`}>&times;</button>
                                             )}
                                         </span>
                                     </li>
                                 );
                             })}
                         </ul>
                         {hasCompletedOrFailedStatusItems && (
                              <button className={styles.clearStatusListButton} onClick={handleClearCompletedFailed} disabled={isUploading || isLoadingSubmissions}>
                                  {pageContent.clearCompletedFailedButton}
                              </button>
                         )}
                     </div>
                 )}
            </div>
        </div>
    );
}
