// emdata_frontend/src/app/[locale]/developer/page.tsx
"use client";

import { use, useState, useEffect, FormEvent } from 'react'; // Добавлен 'use'
import styles from './page.module.css';
import { getLocalizedContent } from '@/lib/i18n'; 
import LanguageSwitcher from '@/components/general/LanguageSwitcher'; 

// --- Interfaces ---
interface DeveloperPageParams { // Отдельный интерфейс для параметров страницы
    locale: string;
}

interface DeveloperPageProps { // Пропсы для компонента страницы
    params: Promise<DeveloperPageParams>; // params теперь Promise
}

interface DeveloperPageContent {
    pageTitle: string;
    loadingMessage: string;
    tokenUnavailableError: string;
    adminOnlyError: string;

    testResultsExportTitle: string;
    filtersTitle: string;
    analyteNameLabel: string;
    testDateAfterLabel: string;
    testDateBeforeLabel: string;
    clearFiltersButtonText: string;
    downloadButtonText: string;
    downloadingMessage: string;
    downloadErrorOccurred: string;
    feedbackSuccess: string;
    feedbackError: string;
    noFiltersAppliedTestResults: string;
    fetchingFilterOptions: string; 
    errorLoadingOptions: string; 

    healthSummaryExportTitle: string;
    summaryDateAfterLabel: string;
    summaryDateBeforeLabel: string;
    summaryIsConfirmedLabel: string;
    confirmedOptionAny: string;
    confirmedOptionYes: string;
    confirmedOptionNo: string;
    downloadHealthSummariesButtonText: string;
    noFiltersAppliedHealthSummaries: string;
}

// --- Constants ---
const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const TEST_RESULTS_CSV_API_URL = `${CLEANED_API_BASE_URL}/api/export/test-results/csv/`;
const HEALTH_SUMMARIES_CSV_API_URL = `${CLEANED_API_BASE_URL}/api/export/health-summaries/csv/`;

// --- Helper Functions ---
async function triggerBackendCsvDownload(token: string, apiUrlWithParams: string): Promise<Response> {
    console.log(`Requesting CSV from: ${apiUrlWithParams}`);
    const response = await fetch(apiUrlWithParams, {
        method: 'GET',
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) {
        let errorDetails = `Server error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || errorData.message || errorData.error || errorDetails;
        } catch (e) {
            const textError = await response.text();
            errorDetails = textError || errorDetails;
        }
        throw new Error(`Failed to initiate download: ${errorDetails}`);
    }
    return response;
}

function getDefaultEnglishContent(): DeveloperPageContent {
    return {
        pageTitle: 'Developer Data Export', loadingMessage: 'Loading page...',
        tokenUnavailableError: 'Authentication token not found. Please ensure you are logged in correctly.',
        adminOnlyError: 'This page is for administrators only.',
        
        testResultsExportTitle: 'Export Test Results (CSV)',
        filtersTitle: 'Filters',
        analyteNameLabel: 'Analyte Name (contains):',
        testDateAfterLabel: 'Test Date After (YYYY-MM-DD):',
        testDateBeforeLabel: 'Test Date Before (YYYY-MM-DD):',
        clearFiltersButtonText: 'Clear All Filters',
        downloadButtonText: 'Download Test Results CSV',
        downloadingMessage: 'Preparing your download...',
        downloadErrorOccurred: 'Download failed. Please try again later.',
        feedbackSuccess: 'Download started successfully! Check your downloads folder.',
        feedbackError: 'An error occurred.',
        noFiltersAppliedTestResults: 'No filters applied for Test Results. This will export all accessible test results.',
        fetchingFilterOptions: 'Loading filter options...', 
        errorLoadingOptions: 'Error loading filter options.', 

        healthSummaryExportTitle: 'Export Health Summaries (CSV)',
        summaryDateAfterLabel: 'Summary Created After (YYYY-MM-DD):',
        summaryDateBeforeLabel: 'Summary Created Before (YYYY-MM-DD):',
        summaryIsConfirmedLabel: 'Is Confirmed:',
        confirmedOptionAny: 'Any',
        confirmedOptionYes: 'Yes',
        confirmedOptionNo: 'No',
        downloadHealthSummariesButtonText: 'Download Health Summaries CSV',
        noFiltersAppliedHealthSummaries: 'No filters applied for Health Summaries. This will export all accessible health summaries.',
    };
}

// --- Component ---
export default function DeveloperPage({ params: paramsPromise }: DeveloperPageProps) { // params переименован в paramsPromise и тип изменен
    const actualParams = use(paramsPromise); // Разворачиваем Promise с помощью React.use()
    const { locale } = actualParams; // Теперь locale извлекается из разрешенного объекта

    const [pageContent, setPageContent] = useState<DeveloperPageContent>(getDefaultEnglishContent());
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [isDownloadingTestResults, setIsDownloadingTestResults] = useState(false);
    const [isDownloadingHealthSummaries, setIsDownloadingHealthSummaries] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string | null; type: 'info' | 'error' | 'success' }>({ message: null, type: 'info' });
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isAuthTokenChecked, setIsAuthTokenChecked] = useState(false);

    // Test Results Filter States
    const [analyteNameInput, setAnalyteNameInput] = useState('');
    const [testDateAfter, setTestDateAfter] = useState('');
    const [testDateBefore, setTestDateBefore] = useState('');

    // Health Summaries Filter States
    const [summaryDateAfter, setSummaryDateAfter] = useState('');
    const [summaryDateBefore, setSummaryDateBefore] = useState('');
    const [summaryIsConfirmed, setSummaryIsConfirmed] = useState('');

    const [isLoadingFilterOptions, setIsLoadingFilterOptions] = useState(false); 
    const [optionLoadingError, setOptionLoadingError] = useState<string | null>(null); 

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setAuthToken(token);
        setIsAuthTokenChecked(true);
    }, []);

    useEffect(() => {
        const fetchContent = async () => { 
            setIsContentLoading(true);
            try {
                // locale теперь доступен здесь после use(paramsPromise)
                const contentFromCMS = await getLocalizedContent(locale, 'developer_page') as DeveloperPageContent;
                setPageContent({ ...getDefaultEnglishContent(), ...contentFromCMS });
            } catch (error: any) {
                console.error("Error loading page content from CMS:", error.message);
                setFeedback({ message: `Error: Could not load page text. (${error.message}) Using defaults.`, type: 'error' });
            }
            setIsContentLoading(false);
        };

        if (locale && isAuthTokenChecked) { // locale будет доступен после разрешения Promise
            fetchContent();
        }
    }, [locale, isAuthTokenChecked]);

    const commonDownloadLogic = async (
        apiUrl: string, 
        queryParams: URLSearchParams, 
        setIsDownloadingState: (isDownloading: boolean) => void,
        successMessageKey: keyof DeveloperPageContent,
        defaultFilenamePrefix: string
    ) => {
        if (!authToken) {
            setFeedback({ message: pageContent.tokenUnavailableError, type: 'error' });
            return;
        }
        setFeedback({ message: pageContent.downloadingMessage, type: 'info' });
        setIsDownloadingState(true);
        
        const apiUrlWithParams = `${apiUrl}?${queryParams.toString()}`;

        try {
            const response = await triggerBackendCsvDownload(authToken, apiUrlWithParams);
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${defaultFilenamePrefix}_${new Date().toISOString().slice(0,10)}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none'; a.href = url; a.download = filename;
            document.body.appendChild(a); a.click();
            window.URL.revokeObjectURL(url); document.body.removeChild(a);
            setFeedback({ message: pageContent[successMessageKey] as string || `Download "${filename}" started!`, type: 'success' });
            setTimeout(() => setFeedback({ message: null, type: 'info' }), 7000);
        } catch (err: any) {
            console.error("Download process error:", err);
            setFeedback({ message: err.message || pageContent.downloadErrorOccurred, type: 'error' });
        } finally {
            setIsDownloadingState(false);
        }
    };

    const handleDownloadTestResults = async () => {
        const queryParams = new URLSearchParams();
        if (analyteNameInput) queryParams.append('analyte_name', analyteNameInput);
        if (testDateAfter) queryParams.append('test_date_after', testDateAfter);
        if (testDateBefore) queryParams.append('test_date_before', testDateBefore);
        
        await commonDownloadLogic(
            TEST_RESULTS_CSV_API_URL,
            queryParams,
            setIsDownloadingTestResults,
            'feedbackSuccess',
            "test_results_export"
        );
    };

    const handleDownloadHealthSummaries = async () => {
        const queryParams = new URLSearchParams();
        if (summaryDateAfter) queryParams.append('created_at_after', summaryDateAfter);
        if (summaryDateBefore) queryParams.append('created_at_before', summaryDateBefore);
        if (summaryIsConfirmed === 'true' || summaryIsConfirmed === 'false') {
            queryParams.append('is_confirmed', summaryIsConfirmed);
        }
        
        await commonDownloadLogic(
            HEALTH_SUMMARIES_CSV_API_URL,
            queryParams,
            setIsDownloadingHealthSummaries,
            'feedbackSuccess',
            "health_summaries_export"
        );
    };

    const clearAllFilters = () => {
        setAnalyteNameInput('');
        setTestDateAfter('');
        setTestDateBefore('');
        setSummaryDateAfter('');
        setSummaryDateBefore('');
        setSummaryIsConfirmed('');
        setFeedback({ message: null, type: 'info' });
    };

    if (isContentLoading || !isAuthTokenChecked) { // locale еще может быть не определен здесь, если paramsPromise не разрешен
        return (
            <div className={styles.loadingPageContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>{getDefaultEnglishContent().loadingMessage}</p> {/* Используем дефолтное сообщение, пока locale не доступен */}
            </div>
        );
    }

    if (!authToken) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.pageContainer}>
                    <div className={styles.controlsHeaderMinimal}><LanguageSwitcher /></div>
                    <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                    <div className={styles.errorMessageSection}>
                        <p className={`${styles.feedbackMessage} ${styles.error}`}>{pageContent.tokenUnavailableError}</p>
                    </div>
                </div>
            </div>
        );
    }

    const noTestResultFiltersApplied = !analyteNameInput && !testDateAfter && !testDateBefore;
    const noHealthSummaryFiltersApplied = !summaryDateAfter && !summaryDateBefore && !summaryIsConfirmed;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageContainer}>
                <div className={styles.controlsHeaderMinimal}><LanguageSwitcher /></div>
                <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

                {feedback.message && !optionLoadingError && (
                    <p className={`${styles.feedbackMessage} ${styles.feedbackBase} ${styles[feedback.type]}`}>
                        {feedback.message}
                    </p>
                )}
                {isLoadingFilterOptions && <p className={styles.infoMessage}>{pageContent.fetchingFilterOptions}</p>}
                {optionLoadingError && <p className={`${styles.feedbackMessage} ${styles.error}`}>{pageContent.errorLoadingOptions}</p>}
                
                <div className={styles.formActionsGlobal}>
                    <button type="button" onClick={clearAllFilters} className={`${styles.button} ${styles.secondaryButton}`}>
                        {pageContent.clearFiltersButtonText}
                    </button>
                </div>

                {/* --- Test Results Export Section --- */}
                <section className={`${styles.exportSection} ${styles.borderedSection}`}>
                    <h2 className={styles.sectionTitle}>{pageContent.testResultsExportTitle}</h2>
                    <form className={styles.filterForm} onSubmit={(e: FormEvent) => { e.preventDefault(); handleDownloadTestResults(); }}>
                        <h3 className={styles.subSectionTitle}>{pageContent.filtersTitle}</h3>
                        <div className={styles.filterGrid}>
                            <div className={styles.filterItem}>
                                <label htmlFor="analyteNameInput" className={styles.label}>{pageContent.analyteNameLabel}</label>
                                <input type="text" id="analyteNameInput" value={analyteNameInput} onChange={(e) => setAnalyteNameInput(e.target.value)} className={styles.input} placeholder="e.g., Hemoglobin" />
                            </div>
                            <div className={styles.filterItem}>
                                <label htmlFor="testDateAfter" className={styles.label}>{pageContent.testDateAfterLabel}</label>
                                <input type="date" id="testDateAfter" value={testDateAfter} onChange={(e) => setTestDateAfter(e.target.value)} className={styles.input} />
                            </div>
                            <div className={styles.filterItem}>
                                <label htmlFor="testDateBefore" className={styles.label}>{pageContent.testDateBeforeLabel}</label>
                                <input type="date" id="testDateBefore" value={testDateBefore} onChange={(e) => setTestDateBefore(e.target.value)} className={styles.input} />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" disabled={isDownloadingTestResults || isLoadingFilterOptions} className={`${styles.button} ${styles.mainDownloadButton}`}>
                                {isDownloadingTestResults ? pageContent.downloadingMessage : pageContent.downloadButtonText}
                            </button>
                        </div>
                        {noTestResultFiltersApplied && <p className={styles.infoMessage}>{pageContent.noFiltersAppliedTestResults}</p>}
                    </form>
                </section>

                {/* --- Health Summaries Export Section --- */}
                <section className={`${styles.exportSection} ${styles.borderedSection}`}>
                    <h2 className={styles.sectionTitle}>{pageContent.healthSummaryExportTitle}</h2>
                    <form className={styles.filterForm} onSubmit={(e: FormEvent) => { e.preventDefault(); handleDownloadHealthSummaries(); }}>
                        <h3 className={styles.subSectionTitle}>{pageContent.filtersTitle}</h3>
                        <div className={styles.filterGrid}>
                            <div className={styles.filterItem}>
                                <label htmlFor="summaryDateAfter" className={styles.label}>{pageContent.summaryDateAfterLabel}</label>
                                <input type="date" id="summaryDateAfter" value={summaryDateAfter} onChange={(e) => setSummaryDateAfter(e.target.value)} className={styles.input} />
                            </div>
                            <div className={styles.filterItem}>
                                <label htmlFor="summaryDateBefore" className={styles.label}>{pageContent.summaryDateBeforeLabel}</label>
                                <input type="date" id="summaryDateBefore" value={summaryDateBefore} onChange={(e) => setSummaryDateBefore(e.target.value)} className={styles.input} />
                            </div>
                            <div className={styles.filterItem}>
                                <label htmlFor="summaryIsConfirmed" className={styles.label}>{pageContent.summaryIsConfirmedLabel}</label>
                                <select id="summaryIsConfirmed" value={summaryIsConfirmed} onChange={(e) => setSummaryIsConfirmed(e.target.value)} className={styles.select}>
                                    <option value="">{pageContent.confirmedOptionAny}</option>
                                    <option value="true">{pageContent.confirmedOptionYes}</option>
                                    <option value="false">{pageContent.confirmedOptionNo}</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" disabled={isDownloadingHealthSummaries || isLoadingFilterOptions} className={`${styles.button} ${styles.mainDownloadButton}`}>
                                {isDownloadingHealthSummaries ? pageContent.downloadingMessage : pageContent.downloadHealthSummariesButtonText}
                            </button>
                        </div>
                        {noHealthSummaryFiltersApplied && <p className={styles.infoMessage}>{pageContent.noFiltersAppliedHealthSummaries}</p>}
                    </form>
                </section>
            </div>
        </div>
    );
}

