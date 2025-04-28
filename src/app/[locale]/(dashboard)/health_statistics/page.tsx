// app/[locale]/(dashboard)/health_statistics/page.tsx
"use client"; // This page is a Client Component

import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import styles from './page.module.css'; // Import the CSS module for this page

// Import Recharts components for charting
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import the context hook to access locale
// Adjust the path as necessary based on where you placed DashboardContext.tsx
import { useDashboardContext } from '../DashboardContext';

// Import getLocalizedContent to fetch page-specific content
import { getLocalizedContent } from '@/lib/i18n'; // Assuming lib/i18n.ts is correct
import { start } from 'repl';

// Define expected content structure for health_statistics.json (or default.json)
interface HealthStatisticsPageContent {
    pageTitle: string;
    overallStatsTitle: string; // Removed based on new backend structure
    trendsTitle: string;
    chartsPlaceholder: string; // Keep placeholder text for now
    mostChangeTitle: string; // Title for the 'Most Change' section
    changeLabel: string; // Label for the change amount (e.g., "Change:")
    noStatsDataMessage: string; // Message when no stats data is available
    allChangesTitle: string; // New: Title for the 'All Changes' section
    selectMetricsLabel: string; // New: Label for metric selection
    // Add other localized strings needed for this page
}

// Define the interface for a single historical data point within a metric's history
interface MetricHistoryPoint {
    date: string; // e.g., "YYYY-MM-DD" or a timestamp string
    value: number;
}

// Define the interface for a single metric's data from the backend (Matching the new structure)
interface MetricData {
    name_of_component: string; // Metric name
    name_of_unit: string;      // Metric unit
    percentage_of_change: number; // Change percentage
    list_of_all_the_values: MetricHistoryPoint[]; // History with dates and values (assuming sorted by date from API)
}

// Define the interface for health statistics data structure
// Updated to be an array of the new MetricData objects from the backend
type HealthStatsData = MetricData[];


// Define a type for processed chart data
interface ChartDataPoint {
    date: string; // X-axis value (e.g., date)
    [key: string]: number | string; // Dynamic keys for metrics (Y-axis values)
}

// Define a type for calculated change (derived from MetricData for display)
interface DisplayMetricChange {
    metricName: string; // Use consistent frontend naming
    unit: string; // Use consistent frontend naming
    latestValue: number; // This will be calculated from History
    percentage_of_change: number;

    // Add localized metric name if needed
}

// Define a type for the processed list of all changes
interface DisplayAllChange {
    metricName: string; // Use consistent frontend naming
    unit: string; // Use consistent frontend naming
    latestValue: number;
    previousValue: number | null; // Previous value might not exist
    percentage_of_change: number;
}


export default function HealthStatisticsPage() {
    // Access locale from the layout's context
    const { locale } = useDashboardContext(); // We only need locale here

    // State to hold the localized content for THIS PAGE
    const [pageContent, setPageContent] = useState<HealthStatisticsPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    // State to hold the actual health statistics data fetched from API
    const [healthStats, setHealthStats] = useState<HealthStatsData | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true); // Loading state for stats data
    const [statsError, setStatsError] = useState<string | null>(null); // Error state for stats data


    // State to track which metrics are selected for the chart
    const [selectedMetricsForChart, setSelectedMetricsForChart] = useState<string[]>([]);


    // --- Mock Data simulating the new backend structure with random values and varying dates ---
    const generateRandomHistory = (initialStartDateString: string, numPoints: number, baseValue: number, variance: number): MetricHistoryPoint[] => {
        const history: MetricHistoryPoint[] = [];
        let currentValue = baseValue;
        let currentDate = new Date(initialStartDateString); // Start with the initial date

        history.push({
             date: currentDate.toISOString().split('T')[0], // Format initial date
             value: Math.max(0, parseFloat(currentValue.toFixed(2))),
        });


        for (let i = 1; i < numPoints; i++) {
            const nextDate = new Date(currentDate); // Start from the previous date
            // Add a smaller, more consistent random number of days (e.g., between 7 and 14)
            const randomDays = Math.floor(Math.random() * (14 - 7 + 1)) + 7;
            nextDate.setDate(currentDate.getDate() + randomDays); // Add random days to the previous date

            currentValue += (Math.random() - 0.5) * variance * 2; // Random change
            history.push({
                date: nextDate.toISOString().split('T')[0], // Format the new date
                value: Math.max(0, parseFloat(currentValue.toFixed(2))), // Ensure value is non-negative and formatted
            });
            currentDate = nextDate; // Update currentDate for the next iteration
        }
        return history;
    };

    // Generate random mock data for multiple metrics matching the new structure
    const generateMockHealthStatsData = (): HealthStatsData => {
        const metrics: MetricData[] = [];
        const metricNames = ["Hemoglobin", "WBC", "Iron", "Cholesterol", "Glucose"];
        const units = ["g/l", "тыс/мка", "мкмоль/л", "mmol/L", "mmol/L"];
        const baseValues = [150, 6.0, 20.0, 5.0, 4.5];
        const variances = [10, 1.0, 5.0, 1.0, 0.5];
        const numPoints = 5; // Number of historical data points

        // Generate potentially different starting dates for each metric
        const startingDates = [
            "2024-01-05",
            "2024-01-11",
            "2024-01-02",
            "2024-01-01",
            "2024-01-10",
        ];


        metricNames.forEach((name, index) => {
            // Use a different starting date for each metric
            const startDate = startingDates[index % startingDates.length];
            const history = generateRandomHistory(startDate, numPoints, baseValues[index], variances[index]);

            // Ensure history has at least two points to calculate change percentage meaningfully
            // In a real scenario, the backend would provide the percentage_of_change
            // For mock data, we'll calculate it if possible, otherwise default to 0 or handle appropriately
            let percentage_of_change = 0;
            if (history.length >= 2) {
                 const latestValue = history[history.length - 1].value;
                 const previousValue = history[history.length - 2].value;
                 const change = latestValue - previousValue;
                 percentage_of_change = previousValue !== 0 ? (change / previousValue) * 100 : 0;
            }


            metrics.push({
                name_of_component: name, // Use new property name
                name_of_unit: units[index], // Use new property name
                percentage_of_change: parseFloat(percentage_of_change.toFixed(2)), // Use new property name (calculated for mock)
                list_of_all_the_values: history, // Use new property name
            });
        });

        return metrics;
    };

    // Generate the mock data once
    const mockHealthStatsData = generateMockHealthStatsData();


    // --- Effect to fetch page-specific localized content ---
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                // Fetch content for the 'health_statistics' key using the current locale
                const content = await getLocalizedContent(locale, 'health_statistics') as HealthStatisticsPageContent;
                 if (content) {
                    setPageContent(content);
                 } else {
                    // Fallback content if localization fails
                    setPageContent({
                        pageTitle: 'Health Statistics',
                        overallStatsTitle: 'Overall Metrics', // Keep fallback even if not displayed
                        trendsTitle: 'Health Trends',
                        chartsPlaceholder: 'Charts will appear here.',
                        mostChangeTitle: 'Most Significant Change', // Fallback
                        changeLabel: 'Change:', // Fallback
                        noStatsDataMessage: 'No health statistics data available. Upload a document to see your stats.', // Fallback
                        allChangesTitle: 'All Changes', // Fallback
                        selectMetricsLabel: 'Select Metrics for Chart:', // Fallback
                    });
                 }

            } catch (error: any) {
                console.error("Error loading page content:", error);
                setContentError("Failed to load page content.");
                 // Set fallback content on error
                 setPageContent({
                     pageTitle: 'Health Statistics',
                     overallStatsTitle: 'Overall Metrics', // Keep fallback
                     trendsTitle: 'Health Trends',
                     chartsPlaceholder: 'Charts will appear here.',
                     mostChangeTitle: 'Most Significant Change', // Fallback
                     changeLabel: 'Change:', // Fallback
                     noStatsDataMessage: 'No health statistics data available. Upload a document to see your stats.', // Fallback
                     allChangesTitle: 'All Changes', // Fallback
                     selectMetricsLabel: 'Select Metrics for Chart:', // Fallback
                 });
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchPageContent();

    }, [locale]); // Re-fetch content when the locale changes


    // --- Effect to load mock health statistics data ---
    // This effect simulates fetching data from an API
    useEffect(() => {
        setIsLoadingStats(true);
        setStatsError(null); // Clear previous errors
        setHealthStats(null); // Clear previous data

        // Simulate API call delay
        const loadMockData = setTimeout(() => {
            setHealthStats(mockHealthStatsData); // Use the generated mock data
            setIsLoadingStats(false);
        }, 500); // Simulate a 500ms loading time

        // Cleanup the timeout if the component unmounts or locale changes
        return () => clearTimeout(loadMockData);

        // In a real app, this would be:
        // const fetchHealthStats = async () => { ... fetch logic ... };
        // fetchHealthStats();

    }, [locale]); // Re-load mock data when the locale changes (simulating re-fetch)


    // --- Process health statistics data for charts and most changed metric ---
    // Use useMemo to re-calculate chart data and most changed metric only when healthStats changes
    const processedData = useMemo(() => {
        const metricsData = healthStats; // healthStats is now an array of MetricData

        if (!metricsData || metricsData.length === 0) {
            return { chartData: [], allChanges: [], mostChangedMetric: null, individualMetricData: {} };
        }

        // Step 1: Consolidate history across all metrics onto a single timeline (still needed for overall date range)
        const dateMap = new Map<string, ChartDataPoint>();

        metricsData.forEach(metric => {
            // Ensure history exists and has data points
            if (metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0) { // Use new property name
                metric.list_of_all_the_values.forEach(historyPoint => { // Use new property name
                    const dateKey = historyPoint.date;
                    if (!dateMap.has(dateKey)) {
                        dateMap.set(dateKey, { date: dateKey });
                    }
                    const dataPoint = dateMap.get(dateKey)!;
                    // Add the metric value to the data point for this date
                    dataPoint[metric.name_of_component] = historyPoint.value; // Use new property name
                });
            }
        });

        // Convert map values to an array and sort by date (still sorting for overall timeline)
        const processedChartData: ChartDataPoint[] = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


         // Step 2: Prepare data for individual metric charts
         const individualMetricData: { [key: string]: ChartDataPoint[] } = {};

         metricsData.forEach(metric => {
             if (metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0) {
                 // For individual charts, we only need the history points for that specific metric
                 // Sort the history points by date for the individual chart
                 const sortedHistory = metric.list_of_all_the_values.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                 // Map history points to the ChartDataPoint structure for Recharts
                 individualMetricData[metric.name_of_component] = sortedHistory.map(point => ({
                     date: point.date,
                     [metric.name_of_component]: point.value // Include only the current metric's value
                 }));
             }
         });


        // Step 3: Prepare data for the "All Changes" list and find the most changed metric
        const allChangesList: DisplayAllChange[] = [];
        let mostChanged: DisplayMetricChange | null = null;
        let maxAbsoluteChangePercentage = -1; // Initialize with a value less than any possible percentage

        metricsData.forEach(metric => {
            // Ensure the metric has a percentage_of_change and at least one history point to get a latest value
            if (typeof metric.percentage_of_change === 'number' && metric.list_of_all_the_values && metric.list_of_all_the_values.length >= 1) { // Use new property names

                 // Find the previous value from history if available (assuming history is sorted by date)
                 const previousHistoryPoint = metric.list_of_all_the_values.length >= 2 ? metric.list_of_all_the_values[metric.list_of_all_the_values.length - 2] : null; // Use new property name

                 // Create an object for the "All Changes" list
                 allChangesList.push({
                     metricName: metric.name_of_component, // Use new property name
                     unit: metric.name_of_unit, // Use new property name
                     latestValue: metric.list_of_all_the_values[metric.list_of_all_the_values.length - 1].value, // Get latest value from history
                     previousValue: previousHistoryPoint ? previousHistoryPoint.value : null,
                     percentage_of_change: metric.percentage_of_change, // Use new property name
                 });


                const absolutePercentage = Math.abs(metric.percentage_of_change); // Use new property name

                if (absolutePercentage > maxAbsoluteChangePercentage) {
                    maxAbsoluteChangePercentage = absolutePercentage;

                    // Calculate latest value from the last history point (assuming History is sorted)
                    const latestHistoryPoint = metric.list_of_all_the_values[metric.list_of_all_the_values.length - 1]; // Use new property name

                    mostChanged = {
                        metricName: metric.name_of_component, // Use new property name
                        unit: metric.name_of_unit, // Use new property name
                        latestValue: latestHistoryPoint.value, // Get latest value from history
                        percentage_of_change: metric.percentage_of_change, // Use new property name
                    };
                }
            }
        });

        // Return all processed data, including individual metric data
        return {
            chartData: processedChartData, // Still keep this for reference if needed, though not used for individual charts
            allChanges: allChangesList,
            mostChangedMetric: mostChanged,
            individualMetricData: individualMetricData, // New: Data structured for individual charts
        };

    }, [healthStats]); // Re-run this memoization when healthStats changes

    // Destructure processed data for rendering
    const { chartData, allChanges, mostChangedMetric, individualMetricData } = processedData;


    // Effect to initialize selectedMetricsForChart when healthStats is loaded
    useEffect(() => {
        if (healthStats && healthStats.length > 0) {
            // Initialize selected metrics to include all metrics with history by default
            const allMetricNames = healthStats
                .filter(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0) // Only include metrics with history (use new property name)
                .map(metric => metric.name_of_component); // Use new property name
            setSelectedMetricsForChart(allMetricNames);
        } else {
            setSelectedMetricsForChart([]); // Clear selection if no data
        }
    }, [healthStats]); // Re-run when healthStats changes


    // Handler for metric selection checkboxes
    const handleMetricSelection = (metricName: string, isSelected: boolean) => {
        setSelectedMetricsForChart(prevSelected => {
            if (isSelected) {
                // Add metric if selected and not already in the list
                if (!prevSelected.includes(metricName)) {
                    return [...prevSelected, metricName];
                }
            } else {
                // Remove metric if deselected
                return prevSelected.filter(name => name !== metricName);
            }
            return prevSelected; // Return previous state if no change
        });
    };


    // Show loading state while content or stats are fetching
    if (isContentLoading || isLoadingStats) {
        return (
            <div className={styles.loadingPageContainer}>
                {/* Use the loading spinner component */}
                <div className={styles.loadingSpinner}></div>
                 {/* Optional: Add loading text below spinner */}
                 {/* <p>{isContentLoading ? 'Loading content...' : 'Loading statistics...'}</p> */}
            </div>
        );
    }

    // Show error state if content fetching failed
    if (contentError || statsError || !pageContent) { // pageContent should be loaded if no contentError
         return <p>{contentError || statsError || 'Error loading page data.'}</p>; // Display relevant error
    }

    // Show message if no health stats data is available after loading
    // Check if healthStats is null, empty array, or if any metric has history with at least one point
    const hasAnyDataPoints = healthStats?.some(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0); // Use new property name
    if (!healthStats || healthStats.length === 0 || !hasAnyDataPoints) {
        return (
            <div className={styles.pageContainer}>
                 <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                 {/* Use localized message for no data */}
                 <p>{pageContent.noStatsDataMessage}</p>
            </div>
        );
    }


    return (
        <div className={styles.pageContainer}>
            {/* Use localized title from pageContent */}
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* Section for Most Significant Change - Displayed at the top */}
            {/* Use a type guard to check if mostChangedMetric is not null */}
            {mostChangedMetric !== null && (
                 <div className={styles.statsSection}> {/* Use statsSection class */}
                     <h2 className={styles.sectionTitle}>{pageContent.mostChangeTitle}</h2> {/* Use sectionTitle class */}
                     <div className={styles.mostChangeHighlight}> {/* Add styling for this highlight */}
                        {/* Introduce a local variable with asserted type */}
                        {/* This helps TypeScript understand the type within this block */}
                        {(mostChangedMetric as DisplayMetricChange) && (
                           <p>
                               <strong>{(mostChangedMetric as DisplayMetricChange).metricName}:</strong> {/* Localize metric name if needed */}
                               {' '} {/* Add a space */}
                               {pageContent.changeLabel} {/* Localized "Change:" label */}
                               {' '} {/* Add a space */}
                               {/* Display the change percentage with sign and unit */}
                               <span style={{ color: (mostChangedMetric as DisplayMetricChange).percentage_of_change >= 0 ? 'green' : 'red', fontWeight: 'bold' }}> {/* Added bold */}
                                   {(mostChangedMetric as DisplayMetricChange).percentage_of_change.toFixed(1)}% {/* Format percentage */}
                               </span>
                               {' '} {/* Add a space */}
                               (Most Recent: {(mostChangedMetric as DisplayMetricChange).latestValue} {(mostChangedMetric as DisplayMetricChange).unit}) {/* Use latestValue */}
                           </p>
                        )}
                     </div>
                 </div>
            )}

             {/* Section for All Changes */}
             {allChanges.length > 0 && (
                 <div className={styles.statsSection}> {/* Use statsSection class */}
                     <h2 className={styles.sectionTitle}>{pageContent.allChangesTitle}</h2> {/* Use sectionTitle class */}
                     <ul className={styles.changesList}> {/* Add styling for the list */}
                         {allChanges.map(change => (
                             <li key={change.metricName} className={styles.changeItem}> {/* Add styling for list item */}
                                 <strong>{change.metricName}:</strong> {/* Localize metric name if needed */}
                                 {' '} {/* Add a space */}
                                 {pageContent.changeLabel} {/* Localized "Change:" label */}
                                 {' '} {/* Add a space */}
                                 <span style={{ color: change.percentage_of_change >= 0 ? 'green' : 'red', fontWeight: 'bold' }}> {/* Added bold */}
                                     {change.percentage_of_change.toFixed(1)}% {/* Format percentage */}
                                 </span>
                                 {' '} {/* Add a space */}
                                 (Latest: {change.latestValue} {change.unit}, Previous: {change.previousValue !== null ? `${change.previousValue} ${change.unit}` : 'N/A'})
                             </li>
                         ))}
                     </ul>
                 </div>
             )}


            {/* Section for Health Trends (Graphs) */}
            <div className={styles.statsSection}> {/* Use statsSection class */}
                 {/* Use localized section title */}
                <h2 className={styles.sectionTitle}>{pageContent.trendsTitle}</h2> {/* Use sectionTitle class */}

                {/* Metric Selection Controls */}
                {healthStats && healthStats.length > 0 && ( // Only show controls if stats data is available
                    <div className={styles.metricSelectionControls}> {/* Add styling */}
                        <label>{pageContent.selectMetricsLabel}</label> {/* Localized label */}
                        <div className={styles.checkboxGroup}> {/* Add styling */}
                            {healthStats
                                .filter(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0) // Only show metrics with history (use new property name)
                                .map(metric => (
                                <label key={metric.name_of_component} className={styles.metricCheckboxLabel}> {/* Add styling (use new property name for key) */}
                                    <input
                                        type="checkbox"
                                        value={metric.name_of_component} // Use new property name
                                        checked={selectedMetricsForChart.includes(metric.name_of_component)} // Use new property name
                                        onChange={(e) => handleMetricSelection(metric.name_of_component, e.target.checked)} // Use new property name
                                    />
                                    {metric.name_of_component} {/* Localize metric name if needed (use new property name) */}
                                </label>
                            ))}
                        </div>
                    </div>
                )}


                 {/* Render separate charts for each selected metric */}
                 {selectedMetricsForChart.length > 0 ? (
                    <div className={styles.chartsArea}> {/* Area for charts */}
                        {selectedMetricsForChart.map((metricName, index) => {
                            const metricData = individualMetricData[metricName];
                            // Find the original metric object to get the unit and potentially localize the name
                            const originalMetric = healthStats?.find(m => m.name_of_component === metricName);

                            // Only render a chart if there are at least two data points for this metric
                            if (metricData && metricData.length >= 2) {
                                return (
                                    <div key={metricName} className={styles.individualChartContainer}> {/* Container for each chart */}
                                        {/* Chart Title (Metric Name) */}
                                        <h3 className={styles.chartTitle}>{metricName} ({originalMetric?.name_of_unit})</h3> {/* Use new property name for unit */}
                                        <ResponsiveContainer width="100%" height={250}> 
                                            <LineChart
                                                data={metricData} // Use data specific to this metric
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" /> {/* X-axis for date */}
                                                <YAxis /> {/* Y-axis for metric values */}
                                                <Tooltip />
                                                <Legend />
                                                {/* Line for this specific metric */}
                                                <Line
                                                    type="monotone" // Smooth line
                                                    dataKey={metricName} // Metric name as data key
                                                    // Assign different colors to lines based on index (example)
                                                    stroke={['#8884d8', '#82ca9d', '#ffc658', '#a4dee3', '#f45b69', '#b072d1'][index % 6]}
                                                    activeDot={{ r: 8 }}
                                                    name={`${metricName} (${originalMetric?.name_of_unit})`} // Label in the legend (localize if needed)
                                                    unit={originalMetric?.name_of_unit} // Pass unit
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            }
                             return null; // Don't render a chart if not enough data points
                        })}
                    </div>
                 ) : (
                     // Show placeholder or message if no metrics are selected or not enough data
                    <p>{pageContent.chartsPlaceholder}</p>
                 )}
            </div>

            {/* Removed Overall Metrics section as it doesn't fit the new data structure */}

        </div>
    );
}
