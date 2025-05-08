// app/[locale]/(dashboard)/all_summaries_page/page.tsx
"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getLocalizedContent } from '@/lib/i18n';
import { useDashboardContext } from '../DashboardContext';
import { format, Locale } from 'date-fns'; // Import Locale type
// Import specific locales that will be used.
// These are relatively small and can be bundled.
import { enUS, ru, kk } from 'date-fns/locale';

interface HealthSummaryResponseData {
    id: string;
    created_at: string;
    symptoms_prompt: string;
    ai_summary: string;
    ai_key_findings: string[];
    ai_detailed_breakdown: {
        metricName: string;
        changePercentage: number;
        latestValue: number;
        unit: string;
        llmComment: string;
    }[];
    ai_suggested_diagnosis: string;
    is_confirmed: boolean;
    confirmed_diagnosis: string | null;
}

interface AllSummariesPageContent {
    pageTitle: string;
    loadingMessage: string;
    errorMessage: string;
    noSummariesMessage: string;
    summaryCardTitle: string;
    overallSummaryTitle: string;
    keyFindingsTitle: string;
    detailedBreakdownTitle: string;
    suggestedDiagnosisTitle: string;
    symptomsPromptTitle: string;
    disclaimer: string;
    authenticationRequired: string;
    viewDetailsButton: string;
    hideDetailsButton: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

export default function AllHealthSummariesPage() {
    const { locale } = useDashboardContext();

    const [summariesData, setSummariesData] = useState<HealthSummaryResponseData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageContent, setPageContent] = useState<AllSummariesPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);
    const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
    // State to hold the current date-fns locale object
    const [currentDateLocale, setCurrentDateLocale] = useState<Locale>(enUS); // Default to enUS

    // --- Effect for loading localized page content and setting date-fns locale ---
    useEffect(() => {
        const loadContentAndDateLocale = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                const content = await getLocalizedContent(locale, 'all_summaries') as AllSummariesPageContent;
                if (content) {
                    setPageContent({
                        pageTitle: content.pageTitle || 'All Health Summaries',
                        loadingMessage: content.loadingMessage || 'Loading summaries...',
                        errorMessage: content.errorMessage || 'Could not load health summaries.',
                        noSummariesMessage: content.noSummariesMessage || 'No health summaries found.',
                        summaryCardTitle: content.summaryCardTitle || 'Summary from {date}',
                        overallSummaryTitle: content.overallSummaryTitle || 'Overall Summary',
                        keyFindingsTitle: content.keyFindingsTitle || 'Key Findings',
                        detailedBreakdownTitle: content.detailedBreakdownTitle || 'Detailed Breakdown',
                        suggestedDiagnosisTitle: content.suggestedDiagnosisTitle || 'Suggested Diagnosis (AI)',
                        symptomsPromptTitle: content.symptomsPromptTitle || 'User Symptoms Provided',
                        disclaimer: content.disclaimer || 'Attention: This summary is AI-generated and not medical advice. Consult a doctor.',
                        authenticationRequired: content.authenticationRequired || 'Authentication required.',
                        viewDetailsButton: content.viewDetailsButton || "View Details",
                        hideDetailsButton: content.hideDetailsButton || "Hide Details",
                    });
                } else {
                    throw new Error("Failed to load localized content for all summaries page.");
                }

                // Set the date-fns locale based on the current app locale
                if (locale === 'kk') {
                    setCurrentDateLocale(kk);
                } else if (locale === 'ru') {
                    setCurrentDateLocale(ru);
                } else {
                    setCurrentDateLocale(enUS); // Default or English
                }

            } catch (err: any) {
                console.error("Error loading page content or date locale:", err);
                setContentError("Failed to load page content. Default text is shown.");
                setPageContent({ // Fallback content
                    pageTitle: 'All Health Summaries',
                    loadingMessage: 'Loading summaries...',
                    errorMessage: 'Could not load health summaries.',
                    noSummariesMessage: 'No health summaries found.',
                    summaryCardTitle: 'Summary from {date}',
                    overallSummaryTitle: 'Overall Summary',
                    keyFindingsTitle: 'Key Findings',
                    detailedBreakdownTitle: 'Detailed Breakdown',
                    suggestedDiagnosisTitle: 'Suggested Diagnosis (AI)',
                    symptomsPromptTitle: 'User Symptoms Provided',
                    disclaimer: 'Attention: This summary is AI-generated and not medical advice. Consult a doctor.',
                    authenticationRequired: 'Authentication required.',
                    viewDetailsButton: "View Details",
                    hideDetailsButton: "Hide Details",
                });
                setCurrentDateLocale(enUS); // Fallback date locale
            } finally {
                setIsContentLoading(false);
            }
        };
        loadContentAndDateLocale();
    }, [locale]);

    // --- Effect for fetching all health summaries ---
    useEffect(() => {
        if (!pageContent || isContentLoading) return; // Don't fetch data until content is loaded

        const fetchSummaries = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError(pageContent.authenticationRequired);
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${CLEANED_API_BASE_URL}/api/health-summaries/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    let errorDetail = pageContent.errorMessage;
                    try {
                        const errorData = await response.json();
                        errorDetail = errorData.detail || errorDetail;
                    } catch (e) { /* Ignore if error response is not JSON */ }
                    throw new Error(errorDetail);
                }

                const data: HealthSummaryResponseData[] = await response.json();
                setSummariesData(data);

            } catch (error: any) {
                console.error("Error fetching health summaries:", error);
                setError(error.message || pageContent.errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummaries();
    }, [pageContent, isContentLoading]); // Re-fetch if pageContent changes or content loading finishes

    const toggleSummaryDetails = (summaryId: string) => {
        setExpandedSummaryId(prevId => prevId === summaryId ? null : summaryId);
    };


    // --- Render Logic ---
    if (isContentLoading || !pageContent) { // Check if pageContent itself is still loading
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>{pageContent?.loadingMessage || 'Loading...'}</p>
            </div>
        );
    }

    if (contentError) {
        return <div className={styles.errorContainer}><p>{contentError}</p></div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {isLoading && ( // This isLoading is for fetching summaries data
                <div className={styles.loadingContainer} style={{ marginTop: '20px' }}>
                    <div className={styles.loadingSpinner}></div>
                    <p>{pageContent.loadingMessage}</p>
                </div>
            )}

            {error && <p className={styles.errorMessageApi}>{error}</p>}

            {!isLoading && !error && summariesData && summariesData.length === 0 && (
                <p className={styles.noDataMessage}>{pageContent.noSummariesMessage}</p>
            )}

            {!isLoading && !error && summariesData && summariesData.length > 0 && (
                <div className={styles.summariesList}>
                    {summariesData.map((summary) => (
                        <div key={summary.id} className={styles.summaryCard}>
                            <h2 className={styles.summaryCardTitle}>
                                {/* Use the currentDateLocale state here */}
                                {pageContent.summaryCardTitle.replace('{date}', format(new Date(summary.created_at), 'PPP p', { locale: currentDateLocale }))}
                            </h2>
                             <p className={styles.summaryExcerpt}>
                                <strong>{pageContent.suggestedDiagnosisTitle}:</strong> {summary.ai_suggested_diagnosis || "N/A"}
                                <br />
                                <i>{summary.ai_summary.substring(0, 150)}{summary.ai_summary.length > 150 ? "..." : ""}</i>
                            </p>
                            <button
                                onClick={() => toggleSummaryDetails(summary.id)}
                                className={styles.toggleDetailsButton}
                            >
                                {expandedSummaryId === summary.id ? pageContent.hideDetailsButton : pageContent.viewDetailsButton}
                            </button>

                            {expandedSummaryId === summary.id && (
                                <div className={styles.summaryDetails}>
                                    <section className={styles.section}>
                                        <h3 className={styles.sectionTitle}>{pageContent.symptomsPromptTitle}</h3>
                                        <p className={styles.symptomsText}>{summary.symptoms_prompt}</p>
                                    </section>

                                    <section className={styles.section}>
                                        <h3 className={styles.sectionTitle}>{pageContent.overallSummaryTitle}</h3>
                                        <p>{summary.ai_summary}</p>
                                    </section>

                                    {summary.ai_key_findings && summary.ai_key_findings.length > 0 && (
                                        <section className={styles.section}>
                                            <h3 className={styles.sectionTitle}>{pageContent.keyFindingsTitle}</h3>
                                            <ul className={styles.list}>
                                                {summary.ai_key_findings.map((finding, index) => (
                                                    <li key={index} className={styles.listItem}>{finding}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {summary.ai_suggested_diagnosis && (
                                        <section className={styles.section}>
                                            <h3 className={styles.sectionTitle}>{pageContent.suggestedDiagnosisTitle}</h3>
                                            <p className={styles.diagnosisHighlight}>{summary.ai_suggested_diagnosis}</p>
                                        </section>
                                    )}

                                    {summary.ai_detailed_breakdown && summary.ai_detailed_breakdown.length > 0 && (
                                        <section className={styles.section}>
                                            <h3 className={styles.sectionTitle}>{pageContent.detailedBreakdownTitle}</h3>
                                            <ul className={styles.list}>
                                                {summary.ai_detailed_breakdown.map((metric, index) => {
                                                    const changePercentageDisplay = typeof metric.changePercentage === 'number'
                                                        ? metric.changePercentage.toFixed(1)
                                                        : 'N/A';
                                                    const changePercentageColor = typeof metric.changePercentage === 'number'
                                                        ? (metric.changePercentage > 0 ? 'green' : (metric.changePercentage < 0 ? 'red' : 'grey'))
                                                        : 'grey';
                                                    return (
                                                        <li key={index} className={styles.listItem}>
                                                            <strong>{metric.metricName}:</strong>
                                                            {' '}
                                                            <span style={{ color: changePercentageColor }}>
                                                                ({changePercentageDisplay}%)
                                                            </span>
                                                            {' '}
                                                            (Latest: {metric.latestValue} {metric.unit})
                                                            <br />
                                                            <span className={styles.llmComment}><i>AI: {metric.llmComment}</i></span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </section>
                                    )}
                                    <p className={styles.disclaimer}>{pageContent.disclaimer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
