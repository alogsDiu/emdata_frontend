// app/[locale]/(dashboard)/health_statistics/summary_page.tsx
"use client"; // This page is a Client Component

import { useState, useEffect } from 'react';
import styles from './page.module.css'; // Import the CSS module
import { getLocalizedContent } from '@/lib/i18n';

// Define the expected structure of the summary data
interface HealthSummaryData {
    overallSummary: string;
    keyFindings: string[]; // Array of key findings sentences/points
    detailedBreakdown: {
        metricName: string;
        changePercentage: number;
        latestValue: number;
        unit: string;
        llmComment: string; // Brief comment from the LLM about this metric
    }[];
}

// Define expected content structure for summary.json (or default.json) - for localized text
interface SummaryPageContent {
    pageTitle: string;
    overallSummaryTitle: string;
    keyFindingsTitle: string;
    detailedBreakdownTitle: string;
    loadingMessage: string;
    errorMessage: string;
    noDataMessage: string;
    disclaimer: string;
    // Add other localized strings needed
}

/**
 * Generates random mock data for the HealthSummaryData interface.
 * This function is used here to simulate receiving data from an API.
 * In a real application, this data would come from your backend.
 * @returns {HealthSummaryData} An object containing random health summary data.
 */
function generateRandomHealthSummaryData(): HealthSummaryData {
    const metrics = [
        { name: "Hemoglobin", unit: "g/L" },
        { name: "WBC", unit: "x10^9/L" },
        { name: "Iron", unit: "µmol/L" },
        { name: "Cholesterol", unit: "mmol/L" },
        { name: "Glucose", unit: "mmol/L" },
        { name: "Vitamin D", unit: "nmol/L" },
    ];

    const detailedBreakdown = metrics.map(metric => {
        // Generate random change percentage between -20 and +20
        const changePercentage = parseFloat((Math.random() * 40 - 20).toFixed(1));
        // Generate random latest value (example ranges)
        let latestValue = 0;
        let llmComment = "";

        switch (metric.name) {
            case "Hemoglobin":
                latestValue = parseFloat((Math.random() * (160 - 120) + 120).toFixed(1));
                llmComment = changePercentage > 5 ? "Showing a positive trend." : changePercentage < -5 ? "Needs monitoring." : "Stable levels observed.";
                break;
            case "WBC":
                latestValue = parseFloat((Math.random() * (10 - 4) + 4).toFixed(1));
                 llmComment = changePercentage > 10 ? "Slight increase noted." : changePercentage < -10 ? "Slight decrease noted." : "Within typical range.";
                break;
            case "Iron":
                latestValue = parseFloat((Math.random() * (30 - 10) + 10).toFixed(1));
                 llmComment = changePercentage > 15 ? "Levels are improving." : changePercentage < -15 ? "Consider supplementation." : "Consistent levels.";
                break;
            case "Cholesterol":
                latestValue = parseFloat((Math.random() * (6 - 3) + 3).toFixed(1));
                 llmComment = changePercentage > 5 ? "Elevated slightly, monitor diet." : changePercentage < -5 ? "Showing improvement." : "Levels are stable.";
                break;
            case "Glucose":
                latestValue = parseFloat((Math.random() * (7 - 4) + 4).toFixed(1));
                 llmComment = changePercentage > 8 ? "Slightly high, consider dietary adjustments." : changePercentage < -8 ? "Lower than previous." : "Within normal limits.";
                break;
             case "Vitamin D":
                latestValue = parseFloat((Math.random() * (80 - 30) + 30).toFixed(1));
                llmComment = changePercentage > 10 ? "Levels are increasing." : changePercentage < -10 ? "Levels are decreasing, consider sun exposure or supplements." : "Stable levels observed.";
                break;
            default:
                latestValue = parseFloat((Math.random() * 100).toFixed(1));
                llmComment = "Trend observed.";
        }


        return {
            metricName: metric.name,
            changePercentage: changePercentage,
            latestValue: latestValue,
            unit: metric.unit,
            llmComment: llmComment,
        };
    });

    const overallSummary = "Overall, your recent health metrics show varied trends. Some key indicators remain stable, while others show slight fluctuations. Pay attention to the detailed breakdown for specific areas.";

    const keyFindings = [
        "Hemoglobin levels are currently stable.",
        "Cholesterol shows a minor fluctuation.",
        "Consider reviewing factors influencing Vitamin D levels if they are decreasing.",
        "WBC count is within the typical range."
    ];

    return {
        overallSummary: overallSummary,
        keyFindings: keyFindings,
        detailedBreakdown: detailedBreakdown,
    };
}


export default function HealthStatisticsSummaryPage() {
    // State to hold the summary data - initialized directly with mock data
    // Simulate a slight delay to better mimic fetching, if desired (optional)
    const [summaryData, setSummaryData] = useState<HealthSummaryData | null>(null);
    // State for loading status - starts true, set to false after simulated load
    const [isLoading, setIsLoading] = useState(true);
    // State for error messages - will remain null in this simulation
    const [error, setError] = useState<string | null>(null);
    // State to hold localized content for this page
    const [pageContent, setPageContent] = useState<SummaryPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    // --- Effect to fetch page-specific localized content ---
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                // Assuming getLocalizedContent is available and works for 'summary' key
                // You'll need to adjust the path and key ('summary') as per your i18n setup
                const content = await getLocalizedContent('en', 'summary') as SummaryPageContent; // Replace 'en' with dynamic locale if available
                 if (content) {
                    setPageContent(content);
                 } else {
                     // Fallback content if localization fails
                     setPageContent({
                         pageTitle: 'Health Summary',
                         overallSummaryTitle: 'Overall Summary',
                         keyFindingsTitle: 'Key Findings',
                         detailedBreakdownTitle: 'Detailed Breakdown',
                         loadingMessage: 'Loading summary...',
                         errorMessage: 'Failed to load summary.',
                         noDataMessage: 'No summary data available.',
                         disclaimer: 'Disclaimer: This summary is generated by an AI model and should not be considered medical advice. Always consult with a healthcare professional for any health concerns.',
                     });
                 }
            } catch (error: any) {
                console.error("Error loading summary page content:", error);
                setContentError("Failed to load summary page content.");
                 // Set fallback content on error
                  setPageContent({
                      pageTitle: 'Health Summary',
                      overallSummaryTitle: 'Overall Summary',
                      keyFindingsTitle: 'Key Findings',
                      detailedBreakdownTitle: 'Detailed Breakdown',
                      loadingMessage: 'Loading summary...',
                      errorMessage: 'Failed to load summary.',
                      noDataMessage: 'No summary data available.',
                      disclaimer: 'Disclaimer: This summary is generated by an AI model and should not be considered medical advice. Always consult with a healthcare professional for any health concerns.',
                  });
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchPageContent();
    }, []); // Empty dependency array means this runs once on mount

    // --- Effect to simulate receiving summary data ---
    useEffect(() => {
        // Simulate a network delay before setting the data
        const simulateFetch = setTimeout(() => {
            const mockData = generateRandomHealthSummaryData();
            setSummaryData(mockData);
            setIsLoading(false); // Set loading to false after data is "received"
        }, 500); // Simulate a 500ms delay

        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(simulateFetch);

    }, []); // Empty dependency array means this runs once on mount


    // Show loading state while content or summary data is fetching
    if (isContentLoading || isLoading || !pageContent) {
        return (
            <div className={styles.loadingContainer}>
                 <div className={styles.loadingSpinner}></div>
                 {/* Use localized loading message */}
                 <p>{pageContent?.loadingMessage || 'Loading...'}</p>
            </div>
        );
    }

    // Show error state if fetching failed (will not happen with this simulation)
    if (error) {
        return <div className={styles.errorContainer}><p>{error}</p></div>;
    }

    // Show message if no summary data is available after loading (should not happen with mock data)
    if (!summaryData) {
        return (
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                {/* Use localized no data message */}
                <p>{pageContent.noDataMessage}</p>
            </div>
        );
    }


    // Render the summary content
    return (
        <div className={styles.container}>
            {/* Use localized page title */}
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* Overall Summary Section */}
            <section className={styles.section}>
                 {/* Use localized section title */}
                <h2 className={styles.sectionTitle}>{pageContent.overallSummaryTitle}</h2>
                <p>{summaryData.overallSummary}</p>
            </section>

            {/* Key Findings Section */}
            {summaryData.keyFindings && summaryData.keyFindings.length > 0 && (
                <section className={styles.section}>
                     {/* Use localized section title */}
                    <h2 className={styles.sectionTitle}>{pageContent.keyFindingsTitle}</h2>
                    <ul className={styles.list}>
                        {summaryData.keyFindings.map((finding, index) => (
                            <li key={index} className={styles.listItem}>{finding}</li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Detailed Breakdown Section */}
            {summaryData.detailedBreakdown && summaryData.detailedBreakdown.length > 0 && (
                <section className={styles.section}>
                     {/* Use localized section title */}
                    <h2 className={styles.sectionTitle}>{pageContent.detailedBreakdownTitle}</h2>
                    <ul className={styles.list}>
                        {summaryData.detailedBreakdown.map((metric, index) => (
                            <li key={index} className={styles.listItem}>
                                <strong>{metric.metricName}:</strong> {metric.changePercentage.toFixed(1)}% (Latest: {metric.latestValue} {metric.unit}) - {metric.llmComment}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Disclaimer */}
            <p className={styles.disclaimer}>{pageContent.disclaimer}</p>

        </div>
    );
}
