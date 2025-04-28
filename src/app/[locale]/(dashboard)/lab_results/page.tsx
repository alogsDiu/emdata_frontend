// app/(dashboard)/lab_results/page.tsx
"use client"; // This page is a Client Component

import { useState } from 'react';
import styles from './page.module.css'; // Import the CSS module for this page

// Import the context hook to access locale and sidebar content (for layout strings)
// Adjust the path as necessary based on where you placed DashboardContext.tsx
import { useDashboardContext } from '../DashboardContext';
// Import DocObj type from your types file

// Import getLocalizedContent to fetch page-specific content
import { getLocalizedContent } from '@/lib/i18n'; // Assuming lib/i18n.ts is correct
import { useEffect } from 'react'; // Import useEffect for client-side data fetching
import { div } from 'framer-motion/client';

interface DocObj {
    id: string;
    name: string;
    url: string; // URL to view/download the document
    // Add other properties if needed, like type, date, etc.
  }

// Define expected content structure for lab_results.json (or default.json)
// You'll need to define the structure of your page-specific localized content
interface LabResultsPageContent {
    pageTitle: string;
    bloodTestsSectionTitle: string;
    urineTestsSectionTitle: string;
    poopTestsSectionTitle: string;
    noDocumentsMessage: string;
    viewAction: string;
    uploadSectionTitle: string;
    uploadFormPrompt: string;
    selectedFilesTitle: string;
    confirmUploadButtonText: string;
    uploadingMessage: string;
    uploadErrorMessage: string; // Base error message text
    uploadSuccessMessage: string;
    // Add other localized strings needed for this page
}


export default function LabResultsPage() {
    // Access locale and sidebarContent from the layout's context
    // Use sidebarContent for strings relevant to the sidebar/layout
    const { locale } = useDashboardContext();

    // State to hold the localized content for THIS PAGE
    const [pageContent, setPageContent] = useState<LabResultsPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    // Use useParams to get the locale in this Client Component
    // Although available from context, getting directly from params is also an option
    // const params = useParams();
    // const locale = params.locale as string; // Ensure locale is string type


    // Fetch the page-specific localized content on the client side
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                // Fetch content for the 'lab_results' key using the current locale
                // Replace 'lab_results' with the actual key for this page's content
                const content = await getLocalizedContent(locale, 'lab_results') as LabResultsPageContent;
                 if (content) {
                    setPageContent(content);
                 } else {
                    // Fallback content if localization fails
                    setPageContent({
                        pageTitle: 'Lab Results',
                        bloodTestsSectionTitle: 'Blood Tests',
                        urineTestsSectionTitle: 'Urine Tests',
                        poopTestsSectionTitle: 'Poop Tests',
                        noDocumentsMessage: 'No documents uploaded yet.',
                        viewAction: 'View',
                        uploadSectionTitle: 'Upload New Document',
                        uploadFormPrompt: 'Drag and drop your document here, or click to select file(s).',
                        selectedFilesTitle: 'Selected Files:',
                        confirmUploadButtonText: 'Confirm Upload',
                        uploadingMessage: 'Uploading files...',
                        uploadErrorMessage: 'Upload failed:', // Fallback error text
                        uploadSuccessMessage: 'Upload successful!',
                    });
                 }

            } catch (error: any) {
                console.error("Error loading page content:", error);
                setContentError("Failed to load page content.");
                 // Set fallback content on error
                 setPageContent({
                     pageTitle: 'Lab Results',
                     bloodTestsSectionTitle: 'Blood Tests',
                     urineTestsSectionTitle: 'Urine Tests',
                     poopTestsSectionTitle: 'Poop Tests',
                     noDocumentsMessage: 'No documents uploaded yet.',
                     viewAction: 'View',
                     uploadSectionTitle: 'Upload New Document',
                     uploadFormPrompt: 'Drag and drop your document here, or click to select file(s).',
                     selectedFilesTitle: 'Selected Files:',
                     confirmUploadButtonText: 'Confirm Upload',
                     uploadingMessage: 'Uploading files...',
                     uploadErrorMessage: 'Upload failed:', // Fallback error text
                     uploadSuccessMessage: 'Upload successful!',
                 });
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchPageContent();

    }, [locale]); // Re-fetch content when the locale changes


    // In a real application, you would fetch and manage
    // the list of already uploaded documents here, likely using state.
    // For now, we use placeholder data structure.
    const uploadedDocuments = {
        blood: [
            { id: 'b1', name: 'Bloodwork 2023-10-26.pdf', url: '#' },
            { id: 'b2', name: 'Blood analysis results.docx', url: '#' },
        ],
        urine: [
            { id: 'u1', name: 'Urinalysis Report.pdf', url: '#' },
        ],
        poop: [
            // { id: 'p1', name: 'Stool Sample Results.pdf', url: '#' }, // Example if you had poop docs
        ],
    };

    // State to store the files selected by the user for upload
    // Storing as an array of File objects
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false); // State to track upload status
    const [uploadError, setUploadError] = useState<string | null>(null); // State for upload errors
    const [uploadSuccess, setUploadSuccess] = useState(false); // State for upload success

    // Handle file selection from the input
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
             // Convert FileList to an array and update state
            setSelectedFiles(Array.from(files));
        } else {
            setSelectedFiles([]); // Set to empty array if no files selected
        }
        // Clear previous messages
        setUploadError(null);
        setUploadSuccess(false);
    };

    // Handle removing a file from the selected files list
    const handleRemoveFile = (indexToRemove: number) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        // Clear status messages when files are removed
        setUploadError(null);
        setUploadSuccess(false);
    };


    // Handle the confirmation button click to send files
    const handleConfirmation = async () => {
        if (selectedFiles.length === 0) {
            setUploadError('Please select files to upload.');
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        const formData = new FormData();
        // Append each selected file to the FormData object
        selectedFiles.forEach(file => {
            formData.append('files', file); // 'files' is the field name your server expects
        });


        // --- Implement your actual file sending logic here ---
        // This is a placeholder using fetch API to a hypothetical API route
        try {
            const response = await fetch('/api/upload-lab-results', { // Replace with your actual API endpoint
                method: 'POST',
                body: formData,
                // Headers like 'Content-Type': 'multipart/form-data' are usually
                // automatically set correctly by the browser when using FormData
            });

            if (response.ok) {
                // Handle successful upload
                console.log('Files uploaded successfully!');
                setUploadSuccess(true);
                setSelectedFiles([]); // Clear selected files after successful upload
                // You might want to refresh the list of uploadedDocuments here
            } else {
                // Handle upload errors
                console.error('Upload failed with status:', response.status);

                // --- Improved Error Handling ---
                const contentType = response.headers.get('content-type');
                let errorDetails = `Status: ${response.status}`;

                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorDetails += `, Details: ${JSON.stringify(errorData)}`;
                        // Use localized error message base + details
                        setUploadError(`${pageContent?.uploadErrorMessage || 'Upload failed'}: ${errorData.message || `Status ${response.status}`}`);
                    } catch (jsonError) {
                        // If parsing JSON also fails, fall back to raw text
                        const text = await response.text();
                        errorDetails += `, Could not parse JSON, Raw response: ${text}`;
                         // Use localized error message base + snippet
                        setUploadError(`${pageContent?.uploadErrorMessage || 'Upload failed'}: Received non-JSON error from server (Status ${response.status}). Raw: ${text.substring(0, 100)}...`); // Show snippet of raw text
                    }
                } else {
                    // If not JSON, read as text
                    const text = await response.text();
                     errorDetails += `, Raw response: ${text}`;
                     // Use localized error message base + snippet
                    setUploadError(`${pageContent?.uploadErrorMessage || 'Upload failed'}: Received non-JSON error from server (Status ${response.status}). Raw: ${text.substring(0, 100)}...`); // Show snippet of raw text
                }

                console.error('Upload error details:', errorDetails);

                // --- End Improved Error Handling ---
            }
        } catch (error: any) {
            // Handle network or other errors
            console.error('Upload failed:', error);
             // Use localized error message base + network error
            setUploadError(`${pageContent?.uploadErrorMessage || 'Upload failed'}: ${error.message || 'Network error'}`);
        } finally {
            setIsUploading(false); // End loading state
        }
        // --- End of actual file sending logic ---
    };

    // Show loading or error state while content is fetching
    if (isContentLoading) {
        return (
        <div className={styles.loadingPageContainer}>
            <div className={styles.loadingSpinner}></div>
        </div> 
    )
    }

    if (contentError || !pageContent) {
         return <p>Error loading page content.</p>; // Or an error message/component
    }

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* --- Existing sections for already uploaded documents --- */}
            <div className={styles.documentSection}>
                <h2 className={styles.sectionTitle}>{pageContent.bloodTestsSectionTitle}</h2>
                {uploadedDocuments.blood.length > 0 ? (
                     <ul className={styles.documentList}>
                         {uploadedDocuments.blood.map((doc:DocObj) => (
                             <li key={doc.id} className={styles.documentItem}>
                                 <span className={styles.documentName}>{doc.name}</span>
                                 <div className={styles.documentActions}>
                                     <a href={doc.url} target="_blank" rel="noopener noreferrer">{pageContent.viewAction}</a>
                                 </div>
                             </li>
                         ))}
                     </ul>
                ) : (
                    <p>{pageContent.noDocumentsMessage}</p>
                )}
            </div>

            <div className={styles.documentSection}>
                <h2 className={styles.sectionTitle}>{pageContent.urineTestsSectionTitle}</h2>
                 {uploadedDocuments.urine.length > 0 ? (
                     <ul className={styles.documentList}>
                         {uploadedDocuments.urine.map((doc:DocObj) => ( // Added DocObj type hint here too
                             <li key={doc.id} className={styles.documentItem}>
                                 <span className={styles.documentName}>{doc.name}</span>
                                 <div className={styles.documentActions}>
                                     <a href={doc.url} target="_blank" rel="noopener noreferrer">{pageContent.viewAction}</a>
                                     {/* Add more actions like download, delete */}
                                 </div>
                             </li>
                         ))}
                     </ul>
                ) : (
                    <p>{pageContent.noDocumentsMessage}</p>
                )}
            </div>

                <div className={styles.documentSection}>
                <h2 className={styles.sectionTitle}>{pageContent.poopTestsSectionTitle}</h2> {/* Or appropriate medical term */}
                 {uploadedDocuments.poop.length > 0 ? (
                     <ul className={styles.documentList}>
                         {uploadedDocuments.poop.map( (doc : DocObj) => (
                             <li key={doc.id} className={styles.documentItem}>
                                 <span className={styles.documentName}>{doc.name}</span>
                                 <div className={styles.documentActions}>
                                     <a href={doc.url} target="_blank" rel="noopener noreferrer">{pageContent.viewAction}</a>
                                     {/* Add more actions like download, delete */}
                                 </div>
                             </li>
                         ))}
                     </ul>
                ) : (
                    <p>{pageContent.noDocumentsMessage}</p>
                )}
            </div>
            {/* --- End of existing sections --- */}


            {/* --- Upload Section --- */}
            <div className={styles.uploadSection}>
                <h2 className={styles.uploadTitle}>{pageContent.uploadSectionTitle}</h2>
                {/* The clickable area for file input */}
                <div
                     className={styles.uploadForm}
                     onClick={() => document.getElementById('fileInput')?.click()} // Trigger file input click
                >
                    <p>{pageContent.uploadFormPrompt}</p>
                    <input
                        type="file"
                        id="fileInput"
                        className={styles.hiddenFileInput}
                        onChange={handleFileChange}
                        multiple // Add the multiple attribute to allow selecting multiple files
                        accept=".pdf" // Example: Only accept PDF files
                        // Reset the input value when selectedFiles changes to allow selecting the same file(s) again after removal
                        value=""
                    />
                </div>

                {selectedFiles.length > 0 && (
                    <div className={styles.selectedFilesList}>
                        <h4>{pageContent.selectedFilesTitle}</h4>
                        <ul>
                            {selectedFiles.map((file, index) => (
                                <li key={index} className={styles.selectedFileItem}> 
                                    <span className={styles.selectedFileName}>{file.name}</span>
                                    <button
                                        className={styles.removeFileButton} // Add a class for styling
                                        onClick={() => handleRemoveFile(index)} // Call handler with index
                                        aria-label={`Remove ${file.name}`}
                                    >&times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {selectedFiles.length > 0 && !isUploading && (
                     <button
                         className={styles.confirmUploadButton} // Add a class for styling
                         onClick={handleConfirmation}
                         disabled={isUploading} // Disable button while uploading
                     >
                         {pageContent.confirmUploadButtonText} ({selectedFiles.length})
                     </button>
                )}

                {isUploading && <p className={styles.uploadStatusMessage}>{pageContent.uploadingMessage}</p>}
                {uploadError && <p className={styles.uploadErrorMessage}>{`${pageContent.uploadErrorMessage} ${uploadError}`}</p>}
                {uploadSuccess && <p className={styles.uploadSuccessMessage}>{pageContent.uploadSuccessMessage}</p>}

            </div>
            {/* --- End Upload Section --- */}

        </div>
    );

}
